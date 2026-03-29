from datetime import datetime
import json

def calculate_days(date1_str, date2_str):
    try:
        # Handle both YYYY-MM-DD and DD/MM/YYYY formats
        fmt1 = "%Y-%m-%d" if "-" in date1_str else "%d/%m/%Y"
        fmt2 = "%Y-%m-%d" if "-" in date2_str else "%d/%m/%Y"
        d1 = datetime.strptime(date1_str, fmt1)
        d2 = datetime.strptime(date2_str, fmt2)
        return abs((d2 - d1).days)
    except:
        return 0

def run_discharge_audit(case, extracted):
    """
    Enhanced Rule-Based Audit Engine (Phase 16).
    Applies 5 core validation rules to identify billing leaks and policy violations.
    """
    audit = {
        "risk_score": 100,
        "flags": [],
        "warnings": [],
        "inconsistencies": [],
        "is_fully_approved": False,
        "rule_results": []
    }
    
    score = 100
    flags = []
    warnings = []
    inconsistencies = []
    rule_results = []

    line_items = extracted.get("line_items", [])
    total_bill = extracted.get("claimed_amount", 0)
    settled_amount = extracted.get("settled_amount", 0)
    deductions_data = extracted.get("deductions", {})
    total_deductions = sum(deductions_data.values()) if isinstance(deductions_data, dict) else 0

    # RULE 1: Non-medical item detection
    # If reason contains: ["gloves", "diaper", "cotton", "mask", "towel"]
    non_med_keywords = ["gloves", "diaper", "cotton", "mask", "towel", "consumables", "sanitizer"]
    non_med_total = 0
    for item in line_items:
        desc = item.get("category", "").lower()
        reason = item.get("reason", "").lower()
        if any(kw in desc or kw in reason for kw in non_med_keywords):
            non_med_total += item.get("non_pay_amount", 0)
            warnings.append(f"Non-medical item detected: {item.get('category')} (₹{item.get('non_pay_amount')})")
    
    rule_results.append({"rule": "Non-Medical Detection", "status": "PASS" if non_med_total == 0 else "FLAGGED", "count": non_med_total})

    # RULE 2: Room rent proportionate deduction
    # If text contains: "proportionate deduction" OR "room rent"
    prop_deduction = False
    for item in line_items:
        if "proportionate" in item.get("reason", "").lower() or "room rent" in item.get("category", "").lower():
            if item.get("non_pay_amount", 0) > 0:
                prop_deduction = True
                flags.append(f"Policy Violation: Proportionate deduction applied to {item.get('category')}")
                score -= 15
    
    rule_results.append({"rule": "Room Rent Logic", "status": "FAIL" if prop_deduction else "PASS"})

    # RULE 3: Package inclusion rule
    # If: "included in package"
    package_violation = False
    for item in line_items:
        if "included in package" in item.get("reason", "").lower():
            package_violation = True
            warnings.append(f"Package Overlap: {item.get('category')} billed despite package inclusion.")
            score -= 10
    
    rule_results.append({"rule": "Package Sanity", "status": "WARN" if package_violation else "PASS"})

    # RULE 4: Admission/diet/mrd -> always NON_PAYABLE
    mand_non_pay_keywords = ["admission", "diet", "mrd", "registration"]
    mand_non_pay_total = 0
    for item in line_items:
        desc = item.get("category", "").lower()
        if any(kw in desc for kw in mand_non_pay_keywords):
            mand_non_pay_total += item.get("non_pay_amount", 0)
            if item.get("payable_amount", 0) > 0:
                flags.append(f"Invalid Payment: {item.get('category')} should be non-payable.")
                score -= 5
    
    rule_results.append({"rule": "Mandatory Non-Payables", "status": "PASS" if mand_non_pay_total > 0 else "INFO"})

    # RULE 5: Calculation validation
    # Check: claimed_amount - deductions ≈ settled_amount
    expected_settlement = total_bill - total_deductions
    calc_diff = abs(expected_settlement - settled_amount)
    if calc_diff > 10: # Margin of error
        flags.append(f"Calculation Mismatch: Expected ₹{expected_settlement:,}, Actual ₹{settled_amount:,}")
        inconsistencies.append("Settlement math discrepancy")
        score -= 20
    
    rule_results.append({"rule": "Math Integrity", "status": "PASS" if calc_diff <= 10 else "FAIL"})

    # Audit Scoring Logic
    audit["risk_score"] = max(score, 0)
    audit["flags"] = flags
    audit["warnings"] = warnings
    audit["inconsistencies"] = inconsistencies
    audit["rule_results"] = rule_results
    audit["non_medical_total"] = non_med_total
    
    return audit

def settlement_analysis(extracted, audit):
    """
    Generates high-quality AI insights and financial KPIs for the settlement.
    """
    total = extracted.get("claimed_amount", 0)
    final = extracted.get("final_payable_amount", 0)
    non_pay_total = audit.get("non_medical_total", 0)
    
    app_rate = (final / total * 100) if total > 0 else 0
    
    # Generate Narratives (Step 5)
    insights_list = []
    
    if audit["risk_score"] > 90:
        insights_list.append("High-integrity claim. Deductions align with standard policy exclusions.")
    elif audit["risk_score"] > 70:
        insights_list.append(f"Moderate leakage detected. ₹{non_pay_total:,} loss due to non-medical consumables.")
    else:
        insights_list.append("Critical discrepancies found. Potential overbilling or policy-based proportionate deductions.")

    if any("Proportionate" in f for f in audit["flags"]):
        insights_list.append("Notice: Room rent slab violation triggered proportionate deductions across all variables.")
    
    if audit.get("non_medical_total", 0) > 500:
        insights_list.append(f"Significant non-medical deduction (₹{audit['non_medical_total']:,}) for items like gloves and masks.")

    summary = f"This claim had ₹{total - final:,} deduction mainly due to {('non-medical consumables' if non_pay_total > 0 else 'policy exclusions')} and administrative adjustments."

    return {
        "approval_rate": round(app_rate, 2),
        "loss_to_patient": total - final,
        "non_medical_total": non_pay_total,
        "ai_insights": insights_list,
        "summary_narrative": summary
    }
