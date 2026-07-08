import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from sqlalchemy.orm import Session
from models.fir import FIR
from models.suspect import Suspect, SuspectFIR
from models.evidence import Evidence
from models.investigation import Investigation, InvestigationNote

def generate_fir_pdf_report(db: Session, fir_id: int) -> io.BytesIO:
    fir = db.get(FIR, fir_id)
    if not fir:
        return None

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#002B49'), # Premium navy blue
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#005A9C'),
        spaceBefore=12,
        spaceAfter=6
    )

    normal_style = styles['Normal']

    story = []

    # Title
    story.append(Paragraph(f"CASE REPORT: {fir.fir_number}", title_style))
    story.append(Spacer(1, 10))

    # Basic Info Table
    data = [
        [Paragraph("<b>FIR Number:</b>", normal_style), Paragraph(fir.fir_number, normal_style),
         Paragraph("<b>Incident Date:</b>", normal_style), Paragraph(str(fir.incident_date), normal_style)],
        [Paragraph("<b>Title:</b>", normal_style), Paragraph(fir.title, normal_style),
         Paragraph("<b>Status:</b>", normal_style), Paragraph(fir.status.value, normal_style)],
        [Paragraph("<b>Location:</b>", normal_style), Paragraph(fir.location_name or "Unknown", normal_style),
         Paragraph("<b>Reported Date:</b>", normal_style), Paragraph(str(fir.reported_date), normal_style)]
    ]
    t = Table(data, colWidths=[100, 160, 100, 160])
    t.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F2F2F2')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#F2F2F2')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Description Section
    story.append(Paragraph("Incident Description", h2_style))
    story.append(Paragraph(fir.description or "No description provided.", normal_style))
    story.append(Spacer(1, 15))

    # Victims
    story.append(Paragraph("Victims", h2_style))
    victim_rows = [[Paragraph("<b>Name</b>", normal_style), Paragraph("<b>Gender</b>", normal_style), Paragraph("<b>Impact</b>", normal_style)]]
    for v in fir.victims:
        victim_rows.append([
            Paragraph(v.full_name, normal_style),
            Paragraph(v.gender, normal_style),
            Paragraph(v.injury_type.value, normal_style)
        ])
    if len(victim_rows) > 1:
        vt = Table(victim_rows, colWidths=[200, 100, 220])
        vt.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EAEAEA')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(vt)
    else:
        story.append(Paragraph("No victims registered for this case.", normal_style))
    story.append(Spacer(1, 15))

    # Suspects
    story.append(Paragraph("Suspects", h2_style))
    suspect_links = db.query(SuspectFIR).filter(SuspectFIR.fir_id == fir_id).all()
    suspect_rows = [[Paragraph("<b>Name</b>", normal_style), Paragraph("<b>Role in Case</b>", normal_style), Paragraph("<b>Threat Level</b>", normal_style), Paragraph("<b>Status</b>", normal_style)]]
    for link in suspect_links:
        s = db.get(Suspect, link.suspect_id)
        if s:
            suspect_rows.append([
                Paragraph(s.full_name or "Unknown", normal_style),
                Paragraph(link.role_in_case or "Unknown", normal_style),
                Paragraph(s.threat_level.value, normal_style),
                Paragraph(s.arrest_status.value, normal_style)
            ])
    if len(suspect_rows) > 1:
        st = Table(suspect_rows, colWidths=[180, 120, 100, 120])
        st.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EAEAEA')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(st)
    else:
        story.append(Paragraph("No suspects identified.", normal_style))
    story.append(Spacer(1, 15))

    # Evidence
    story.append(Paragraph("Evidence Items", h2_style))
    evidence = db.query(Evidence).filter(Evidence.fir_id == fir_id).all()
    evidence_rows = [[Paragraph("<b>Title</b>", normal_style), Paragraph("<b>Type</b>", normal_style), Paragraph("<b>Status</b>", normal_style)]]
    for e in evidence:
        evidence_rows.append([
            Paragraph(e.title, normal_style),
            Paragraph(e.evidence_type.value, normal_style),
            Paragraph(e.status.value, normal_style)
        ])
    if len(evidence_rows) > 1:
        et = Table(evidence_rows, colWidths=[240, 140, 140])
        et.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EAEAEA')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(et)
    else:
        story.append(Paragraph("No evidence cataloged.", normal_style))

    doc.build(story)
    buffer.seek(0)
    return buffer
