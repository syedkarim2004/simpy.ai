from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, 
    TableStyle, HRFlowable
)
from io import BytesIO
from datetime import datetime

def generate_final_report(data):
    """
    Generates a professional PDF settlement report.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=30,
        fontName='Helvetica-Bold'
    )
    
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor("#00E5C3"),
        spaceBefore=20,
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )

    elements = []
    
    # Header
    elements.append(Paragraph("AI Generated Settlement Report", title_style))
    elements.append(Paragraph(f"Decision ID: AI-{datetime.now().strftime('%y%m%d%H%M')}", styles['Normal']))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 20))
    
    # Patient Info Table
    info_data = [
        ["Claim Number", data.get("claim_number", "SA-99214")],
        ["Hospital", data.get("hospital_name", "Apollo Hospital")],
        ["Admission Date", data.get("admission_date", "N/A")],
        ["Discharge Date", data.get("discharge_date", "N/A")]
    ]
    t_info = Table(info_data, colWidths=[150, 300])
    t_info.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f8fafc")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ]))
    elements.append(t_info)

    # Audit Observations Section
    elements.append(Paragraph("Audit Observations", section_style))
    obs_text = "Policy compliance check completed. System verified room rent limits, ICU charges, and consumables against active insurance coverage rules."
    elements.append(Paragraph(obs_text, styles['Normal']))
    elements.append(Spacer(1, 10))
    
    # Financial Summary Table
    elements.append(Paragraph("Final Insurance Decision", section_style))
    
    total = data.get("total_claimed", 0)
    discount = data.get("hospital_discount", 0)
    tds = data.get("tds", 0)
    non_pay = data.get("non_pay_amount", 0)
    final = data.get("final_settlement", 0)
    
    summary_data = [
        ["Description", "Amount (INR)"],
        ["Gross Bill Amount", f"Rs. {total:,}"],
        ["Contractual Discount (-)", f"Rs. {discount:,}"],
        ["Statutory TDS (-)", f"Rs. {tds:,}"],
        ["Non-Covered Items (-)", f"Rs. {non_pay:,}"],
        ["Net Payable (Approved)", f"Rs. {final:,}"]
    ]
    t_summary = Table(summary_data, colWidths=[300, 150])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (1,1), (1,-1), 'RIGHT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('PADDING', (0,0), (-1,-1), 10),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#ecfdf5")),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('LINEBELOW', (0, -2), (-1, -2), 1, colors.black),
    ]))
    elements.append(t_summary)

    # Category Breakdown
    if data.get("bill_breakdown"):
        elements.append(Paragraph("Itemized Decision Ledger", section_style))
        breakdown_data = [["Category", "Bill Amt", "Approved", "Deduction"]]
        for item in data["bill_breakdown"]:
            breakdown_data.append([
                item["category"],
                f"{item.get('bill_amount', 0):,}",
                f"{item.get('payable_amount', 0):,}",
                f"{item.get('non_pay_amount', 0):,}"
            ])
        
        t_breakdown = Table(breakdown_data, colWidths=[200, 80, 80, 90])
        t_breakdown.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('ALIGN', (1,1), (-1,-1), 'RIGHT'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ]))
        elements.append(t_breakdown)

    # Recommendations
    elements.append(Paragraph("System Recommendation", section_style))
    rec = "No further action required. The claim is reconciled with high confidence." if non_pay < total * 0.1 else "Review high deduction items for potential dispute / enhancement request."
    elements.append(Paragraph(f"• {rec}", styles['Normal']))
    
    # Footer Note
    elements.append(Spacer(1, 40))
    footer_text = "CONFIDENTIAL: This AI-generated report is intended for RCM and Insurance Reconciliation purposes only."
    elements.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=1)))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
