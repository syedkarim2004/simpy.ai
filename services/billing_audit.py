NON_PAYABLES = ["Gloves", "PPE Kit", "Admin Charges"]

def calculate_settlement(case, discharge):
    total = discharge["total_bill"]

    deductions = 0
    deduction_details = []

    for item in discharge["bill_items"]:
        if item["name"] in NON_PAYABLES:
            deductions += item["cost"]
            deduction_details.append(f"{item['name']} not covered")

    # Policy limit
    approved = case["preauth_approved"]
    final_payable = min(total - deductions, approved)

    patient_pay = total - final_payable

    return {
        "total_bill": total,
        "deductions": deductions,
        "deduction_details": deduction_details,
        "insurance_pay": final_payable,
        "patient_pay": patient_pay,
        "preauth_approved": approved
    }
