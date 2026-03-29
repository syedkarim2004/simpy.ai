from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, 
    TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime

def generate_preauth_pdf(patient_data: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm
    )
    
    styles = getSampleStyleSheet()
    story = []
    
    # Colors
    primary_blue = colors.HexColor('#1E3A5F')
    accent_blue = colors.HexColor('#3B82F6')
    light_gray = colors.HexColor('#F8F9FA')
    border_gray = colors.HexColor('#DEE2E6')
    green = colors.HexColor('#10B981')
    
    # Header style
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=18,
        fontName='Helvetica-Bold',
        textColor=primary_blue,
        alignment=TA_CENTER,
        spaceAfter=4
    )
    sub_header_style = ParagraphStyle(
        'SubHeader',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica',
        textColor=colors.gray,
        alignment=TA_CENTER,
        spaceAfter=2
    )
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Normal'],
        fontSize=11,
        fontName='Helvetica-Bold',
        textColor=colors.white,
        alignment=TA_LEFT,
        leftIndent=6
    )
    field_label_style = ParagraphStyle(
        'FieldLabel',
        parent=styles['Normal'],
        fontSize=8,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#6B7280'),
        spaceAfter=1
    )
    field_value_style = ParagraphStyle(
        'FieldValue',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica',
        textColor=colors.black,
        spaceAfter=4
    )
    bold_value_style = ParagraphStyle(
        'BoldValue',
        parent=styles['Normal'],
        fontSize=11,
        fontName='Helvetica-Bold',
        textColor=primary_blue,
        spaceAfter=4
    )
    
    def section_header(title):
        header_table = Table(
            [[Paragraph(title, section_title_style)]],
            colWidths=[17*cm]
        )
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), primary_blue),
            ('ROWBACKGROUNDS', (0,0), (-1,-1), [primary_blue]),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ]))
        return header_table
    
    def field_cell(label, value):
        return [
            Paragraph(label.upper(), field_label_style),
            Paragraph(str(value) if value else "_______________", 
                     field_value_style if value else field_value_style)
        ]
    
    # ═══════════════════════════════
    # HOSPITAL LETTERHEAD
    # ═══════════════════════════════
    story.append(Paragraph("PRE-AUTHORIZATION REQUEST FORM", header_style))
    story.append(Paragraph("Cashless Hospitalization | Insurance Pre-Auth | TPA Submission", sub_header_style))
    story.append(Paragraph(
        f"Form ID: {patient_data.get('admission_id', 'AUTO-GENERATED')} | "
        f"Date: {datetime.now().strftime('%d %B %Y')} | "
        f"Status: PENDING REVIEW",
        sub_header_style
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_blue, spaceAfter=12))
    
    # ═══════════════════════════════
    # SECTION 1: PATIENT INFORMATION
    # ═══════════════════════════════
    story.append(section_header("SECTION 1 — PATIENT INFORMATION"))
    story.append(Spacer(1, 8))
    
    patient_table_data = [
        [
            field_cell("Patient Full Name", patient_data.get('patient_name')),
            field_cell("Patient ID", patient_data.get('patient_id', 'SIMPY-UID-AUTO')),
            field_cell("Admission ID", patient_data.get('admission_id', 'ADM-AUTO'))
        ],
        [
            field_cell("Age", f"{patient_data.get('age')} Years" if patient_data.get('age') else ""),
            field_cell("Gender", patient_data.get('gender')),
            field_cell("Date of Birth", patient_data.get('dob', 'As per ID proof'))
        ],
    ]
    
    patient_table = Table(patient_table_data, colWidths=[8*cm, 4*cm, 5*cm])
    patient_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_gray),
        ('GRID', (0,0), (-1,-1), 0.5, border_gray),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(patient_table)
    story.append(Spacer(1, 12))
    
    # ═══════════════════════════════
    # SECTION 2: INSURANCE DETAILS
    # ═══════════════════════════════
    story.append(section_header("SECTION 2 — INSURANCE & TPA DETAILS"))
    story.append(Spacer(1, 8))
    
    insurance_table_data = [
        [
            field_cell("Insurance Provider", patient_data.get('insurance_provider')),
            field_cell("Policy Number", patient_data.get('policy_number')),
        ],
        [
            field_cell("TPA Name", patient_data.get('tpa_name')),
            field_cell("Member ID / Card No.", patient_data.get('member_id', '')),
        ],
        [
            field_cell("Policy Type", patient_data.get('policy_type', 'Individual / Family Floater')),
            field_cell("Sum Insured (Rs.)", patient_data.get('sum_insured', '')),
        ],
    ]
    
    insurance_table = Table(insurance_table_data, colWidths=[8.5*cm, 8.5*cm])
    insurance_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_gray),
        ('GRID', (0,0), (-1,-1), 0.5, border_gray),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(insurance_table)
    story.append(Spacer(1, 12))
    
    # ═══════════════════════════════
    # SECTION 3: CLINICAL DETAILS
    # ═══════════════════════════════
    story.append(section_header("SECTION 3 — CLINICAL & DIAGNOSIS DETAILS"))
    story.append(Spacer(1, 8))
    
    clinical_data = [
        [
            field_cell("Primary Diagnosis", patient_data.get('diagnosis')),
            field_cell("ICD-10 Code", patient_data.get('icd_code')),
        ],
        [
            field_cell("Proposed Treatment / Procedure", patient_data.get('proposed_treatment')),
            field_cell("Estimated Duration (Days)", patient_data.get('duration', '3-5 Days')),
        ],
        [
            field_cell("Treating Doctor", patient_data.get('doctor_name', '')),
            field_cell("Department / Specialty", patient_data.get('specialty', '')),
        ],
        [
            field_cell("Hospital Name", patient_data.get('hospital_name', '')),
            field_cell("Ward / Room Type", patient_data.get('room_type', 'General / Semi-Private')),
        ],
    ]
    
    clinical_table = Table(clinical_data, colWidths=[11*cm, 6*cm])
    clinical_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), light_gray),
        ('GRID', (0,0), (-1,-1), 0.5, border_gray),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(clinical_table)
    story.append(Spacer(1, 12))
    
    # ═══════════════════════════════
    # SECTION 4: COST ESTIMATION
    # ═══════════════════════════════
    story.append(section_header("SECTION 4 — ESTIMATED COST DETAILS"))
    story.append(Spacer(1, 8))
    
    cost_data = [
        ["Cost Component", "Estimated Amount (Rs.)", "Remarks"],
        ["Room & Board Charges", patient_data.get('room_charges', ''), "Per day as per policy"],
        ["Surgeon / Consultant Fees", patient_data.get('surgeon_fees', ''), "As per schedule"],
        ["OT / Procedure Charges", patient_data.get('ot_charges', ''), "Including consumables"],
        ["Medicines & Pharmacy", patient_data.get('medicine_charges', ''), "Estimated"],
        ["Investigation / Labs", patient_data.get('investigation_charges', ''), "Pre-operative"],
        ["ICU Charges (if applicable)", patient_data.get('icu_charges', 'N/A'), ""],
        ["Miscellaneous", patient_data.get('misc_charges', ''), ""],
        ["TOTAL ESTIMATED COST", patient_data.get('estimated_cost', ''), "Subject to actuals"],
    ]
    
    cost_table = Table(cost_data, colWidths=[7*cm, 5*cm, 5*cm])
    cost_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_blue),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#DBEAFE')),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0,-1), (-1,-1), primary_blue),
        ('GRID', (0,0), (-1,-1), 0.5, border_gray),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, light_gray]),
        ('FONTSIZE', (0,1), (-1,-1), 9),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(cost_table)
    story.append(Spacer(1, 12))
    
    # ═══════════════════════════════
    # SECTION 5: DECLARATION
    # ═══════════════════════════════
    story.append(section_header("SECTION 5 — DECLARATION & SIGNATURES"))
    story.append(Spacer(1, 8))
    
    decl_text = """I/We hereby declare that the information provided in this Pre-Authorization 
    Request Form is true and correct to the best of my knowledge. I authorize the 
    treating hospital and insurance company/TPA to process this pre-authorization 
    request and share relevant medical information for claim processing purposes."""
    
    story.append(Paragraph(decl_text, ParagraphStyle(
        'Decl', parent=styles['Normal'], fontSize=9,
        textColor=colors.HexColor('#374151'), leading=14
    )))
    story.append(Spacer(1, 20))
    
    sig_data = [
        ["Patient / Guardian Signature", "Treating Doctor Signature", "Hospital Authority"],
        ["", "", ""],
        ["Name: _______________", "Name: _______________", "Name: _______________"],
        ["Date: _______________", "Reg. No.: ____________", "Stamp & Date: ________"],
    ]
    
    sig_table = Table(sig_data, colWidths=[5.67*cm, 5.67*cm, 5.67*cm])
    sig_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F3F4F6')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, border_gray),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('ROWHEIGHT', (0,1), (0,1), 40),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(sig_table)
    story.append(Spacer(1, 12))
    
    # ═══════════════════════════════
    # FOOTER
    # ═══════════════════════════════
    story.append(HRFlowable(width="100%", thickness=1, color=border_gray, spaceAfter=6))
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=7, textColor=colors.gray, alignment=TA_CENTER
    )
    story.append(Paragraph(
        f"Generated by Simpy.ai Health Audit Protocol | "
        f"Form ID: {patient_data.get('admission_id', 'N/A')} | "
        f"Generated: {datetime.now().strftime('%d %b %Y %I:%M %p')} | "
        f"CONFIDENTIAL — FOR INSURANCE/TPA USE ONLY",
        footer_style
    ))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
