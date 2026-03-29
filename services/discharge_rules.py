def evaluate_discharge(case, discharge):
    flags = []
    warnings = []

    # LOS mismatch
    if discharge["length_of_stay"] > case["expected_los"] + 1:
        warnings.append("Extended hospital stay detected")

    # Procedure mismatch
    if case["procedure"] not in discharge["procedures_done"]:
        flags.append("Procedure mismatch with pre-auth")

    # Missing docs
    if len(discharge["bill_items"]) == 0:
        flags.append("Final bill missing")

    risk_score = 100 - (len(flags)*20 + len(warnings)*10)

    return {
        "flags": flags,
        "warnings": warnings,
        "risk_score": max(risk_score, 0)
    }
