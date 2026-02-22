import jsPDF from "jspdf";

export const downloadEvaluationPDF = (evaluation: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Algo8.ai", margin, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("INTERN PERFORMANCE REPORT", margin, 35);

    // Line separator
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.line(margin, 45, pageWidth - margin, 45);

    // Evaluation Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Evaluation ID: #${evaluation.id}`, margin, 55);
    doc.text(`Date: ${new Date(evaluation.created_at).toLocaleDateString()}`, pageWidth - margin - 40, 55);

    doc.setFontSize(14);
    doc.text("Participant Information", margin, 70);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Intern Email: ${evaluation.intern_id}`, margin, 80);
    doc.text(`Manager Email: ${evaluation.manager_id}`, margin, 85);
    doc.text(`Duration: ${evaluation.months_worked} Months`, margin, 90);

    // Scores
    doc.setFont("helvetica", "bold");
    doc.text("Ratings", margin, 105);
    doc.setFont("helvetica", "normal");
    doc.text(`Manager Rating: ${evaluation.rating}/5`, margin, 112);
    doc.text(`HR Adjustment: ${evaluation.hr_rating_adjustment > 0 ? "+" : ""}${evaluation.hr_rating_adjustment}`, margin, 117);

    const finalRating = Math.min(5, Math.max(1, evaluation.rating + (evaluation.hr_rating_adjustment || 0)));
    doc.setFont("helvetica", "bold");
    doc.text(`Final Performance Score: ${finalRating}/5`, margin, 125);

    // Comments
    doc.setFontSize(12);
    doc.text("Management Comments", margin, 140);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const mgrComment = doc.splitTextToSize(`Manager: ${evaluation.manager_comment}`, pageWidth - (margin * 2));
    doc.text(mgrComment, margin, 147);

    const hrCommentY = 147 + (mgrComment.length * 5) + 5;
    const hrComment = doc.splitTextToSize(`HR: ${evaluation.hr_comment || "No additional comments."}`, pageWidth - (margin * 2));
    doc.text(hrComment, margin, hrCommentY);

    // AI Report (New Page if needed)
    doc.addPage();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("AI Generated Analysis", margin, 13);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const reportLines = doc.splitTextToSize(evaluation.report || "AI Analysis pending.", pageWidth - (margin * 2));
    doc.text(reportLines, margin, 35);

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Confidential - Algo8.ai Intern Management System - Page ${i} of ${pageCount}`, pageWidth / 2, 285, { align: "center" });
    }

    doc.save(`Algo8_Report_Eval_${evaluation.id}.pdf`);
};
