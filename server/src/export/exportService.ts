import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Response } from "express";

const BRAND = { name: "Mentor Assistant AI", navy: "1B2A4A" };

export async function exportStudentExcel(res: Response, report: any) {
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND.name;

  const info = wb.addWorksheet("Student Profile");
  info.columns = [
    { header: "Field", key: "field", width: 28 },
    { header: "Value", key: "value", width: 40 },
  ];
  styleHeader(info);
  const fields: [string, unknown][] = [
    ["Name", report.fullName],
    ["Register Number", report.registerNumber],
    ["Roll Number", report.rollNumber || "Not assigned"],
    ["Year", report.year],
    ["Section", report.section],
    ["Department", report.department?.name],
    ["Mentor", report.mentor?.fullName],
    ["Attendance %", report.attendancePercentage],
    ["CGPA", report.cgpa],
    ["Arrears", report.arrearCount],
    ["Placement Status", report.placementStatus],
    ["Internship Status", report.internshipStatus],
    ["Certifications", report.certificationCount],
  ];
  fields.forEach(([field, value]) => info.addRow({ field, value }));

  const meetings = wb.addWorksheet("Meetings");
  meetings.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Type", key: "type", width: 12 },
    { header: "Summary", key: "summary", width: 50 },
    { header: "AI Risk Flagged", key: "risk", width: 16 },
  ];
  styleHeader(meetings);
  for (const m of report.meetings ?? []) {
    meetings.addRow({
      date: new Date(m.meetingDate).toLocaleDateString(),
      type: m.meetingType,
      summary: m.aiSummary ?? m.discussionSummary,
      risk: m.aiStatus,
    });
  }

  const issues = wb.addWorksheet("Issues");
  issues.columns = [
    { header: "Category", key: "category", width: 22 },
    { header: "Severity", key: "severity", width: 12 },
    { header: "Status", key: "status", width: 14 },
    { header: "Description", key: "description", width: 50 },
  ];
  styleHeader(issues);
  for (const i of report.issues ?? []) {
    issues.addRow({ category: i.category, severity: i.severity, status: i.status, description: i.description });
  }

  const actions = wb.addWorksheet("Action Items");
  actions.columns = [
    { header: "Description", key: "description", width: 45 },
    { header: "Assigned To", key: "assignedTo", width: 18 },
    { header: "Target Date", key: "target", width: 14 },
    { header: "Status", key: "status", width: 14 },
  ];
  styleHeader(actions);
  for (const a of report.actionItems ?? []) {
    actions.addRow({
      description: a.description,
      assignedTo: a.assignedTo,
      target: new Date(a.targetCompletionDate).toLocaleDateString(),
      status: a.status,
    });
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="student-${report.registerNumber}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
}

export async function exportMonthlyExcel(res: Response, report: any) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Monthly Report");
  ws.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 20 },
  ];
  styleHeader(ws);
  const rows: [string, unknown][] = [
    ["Month/Year", `${report.period.month}/${report.period.year}`],
    ["Meetings Conducted", report.meetingsConducted],
    ["Students Mentored", report.studentsMentored],
    ["Issues Identified", report.issuesIdentified],
    ["Issues Resolved", report.issuesResolved],
    ["Actions Assigned", report.actionsAssigned],
    ["Actions Completed", report.actionsCompleted],
    ["Follow-ups Completed", report.followUpsCompleted],
    ["High Risk Students", report.highRiskStudents],
  ];
  rows.forEach(([metric, value]) => ws.addRow({ metric, value }));

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="monthly-report-${report.period.month}-${report.period.year}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
}

export function exportStudentPdf(res: Response, report: any) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="student-${report.registerNumber}.pdf"`);
  doc.pipe(res);

  pdfHeader(doc, "Student Mentoring Report", `Generated ${new Date().toLocaleDateString()}`);

  doc.fontSize(14).fillColor("#1B2A4A").text(report.fullName, { continued: false });
  const rollText = report.rollNumber ? ` | Roll: ${report.rollNumber}` : "";
  doc.fontSize(10).fillColor("#444444").text(`Reg: ${report.registerNumber}${rollText} | ${report.year} ${report.section} | ${report.department?.name ?? ""}`);
  doc.moveDown();

  addKeyValueTable(doc, [
    ["Roll Number", report.rollNumber ?? "Not assigned"],
    ["Register Number", report.registerNumber],
    ["Mentor", report.mentor?.fullName ?? "-"],
    ["Attendance", `${report.attendancePercentage}%`],
    ["CGPA", String(report.cgpa)],
    ["Arrears", String(report.arrearCount)],
    ["Placement", report.placementStatus],
    ["Internship", report.internshipStatus],
    ["Certifications", String(report.certificationCount)],
  ]);

  sectionTitle(doc, "Recent Meetings");
  for (const m of (report.meetings ?? []).slice(0, 10)) {
    doc.fontSize(9).fillColor("#111111").text(`${new Date(m.meetingDate).toLocaleDateString()} - ${m.meetingType}`, { continued: false });
    doc.fontSize(9).fillColor("#555555").text(m.aiSummary ?? m.discussionSummary);
    doc.moveDown(0.5);
  }

  sectionTitle(doc, "Issues");
  for (const i of report.issues ?? []) {
    doc.fontSize(9).fillColor("#111111").text(`[${i.severity}] ${i.category} - ${i.status}`);
    doc.fontSize(9).fillColor("#555555").text(i.description);
    doc.moveDown(0.5);
  }

  sectionTitle(doc, "Action Items");
  for (const a of report.actionItems ?? []) {
    doc.fontSize(9).fillColor("#111111").text(`${a.description} — ${a.status} (due ${new Date(a.targetCompletionDate).toLocaleDateString()})`);
  }

  doc.end();
}

export function exportMonthlyPdf(res: Response, report: any) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="monthly-report-${report.period.month}-${report.period.year}.pdf"`);
  doc.pipe(res);

  pdfHeader(doc, "Monthly Mentor Activity Report", `${report.period.month}/${report.period.year}`);

  addKeyValueTable(doc, [
    ["Meetings Conducted", String(report.meetingsConducted)],
    ["Students Mentored", String(report.studentsMentored)],
    ["Issues Identified", String(report.issuesIdentified)],
    ["Issues Resolved", String(report.issuesResolved)],
    ["Actions Assigned", String(report.actionsAssigned)],
    ["Actions Completed", String(report.actionsCompleted)],
    ["Follow-ups Completed", String(report.followUpsCompleted)],
    ["High Risk Students", String(report.highRiskStudents)],
  ]);

  doc.end();
}

// --- helpers ---------------------------------------------------------------

function styleHeader(ws: ExcelJS.Worksheet) {
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${BRAND.navy}` } };
}

function pdfHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  doc.fontSize(18).fillColor(`#${BRAND.navy}`).text(BRAND.name, { align: "left" });
  doc.fontSize(14).fillColor("#111111").text(title);
  doc.fontSize(9).fillColor("#666666").text(subtitle);
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#DDDDDD").stroke();
  doc.moveDown();
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor(`#${BRAND.navy}`).text(title);
  doc.moveDown(0.25);
}

function addKeyValueTable(doc: PDFKit.PDFDocument, rows: [string, string][]) {
  for (const [key, value] of rows) {
    doc.fontSize(10).fillColor("#333333").text(`${key}:`, { continued: true, width: 200 });
    doc.fillColor("#000000").text(` ${value}`);
  }
  doc.moveDown();
}
