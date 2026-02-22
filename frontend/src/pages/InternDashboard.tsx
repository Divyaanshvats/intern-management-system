import { useEffect, useState } from "react";
import api from "../services/api";
import StepIndicator from "../components/StepIndicator";
import { useToast } from "../components/ToastContext";
import { downloadEvaluationPDF } from "../services/pdfService";

function InternDashboard() {
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const limit = 5;
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const res = await api.get("/intern/evaluations", {
                params: {
                    skip: page * limit,
                    limit: limit
                }
            });
            setEvaluations(res.data.evaluations || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            console.error(err);
            showToast("Failed to load evaluations", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvaluations();
    }, [page]);

    const submitFeedback = async (evaluationId: number) => {
        if (!feedback) {
            showToast("Please provide your feedback", "error");
            return;
        }
        setLoading(true);
        try {
            await api.post("/submit-intern-feedback", null, {
                params: {
                    evaluation_id: evaluationId,
                    comment: feedback,
                },
            });

            showToast("Feedback Submitted Successfully", "success");
            fetchEvaluations();
            setFeedback("");
        } catch (err) {
            console.error(err);
            showToast("Error submitting feedback", "error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "pending_intern": return "badge-pending";
            case "pending_hr": return "badge-pending";
            case "completed": return "badge-completed";
            default: return "badge-pending";
        }
    };

    const getStatusText = (status: string) => {
        return status.replace("_", " ").toUpperCase();
    };

    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: "2rem" }}>
                <h1>Intern Dashboard</h1>
                <p>Review your performance evaluations and provide feedback.</p>
            </header>

            <section>
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    {evaluations.map((evalItem) => (
                        <div key={evalItem.id} className="glass-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem" }}>Evaluation #{evalItem.id}</h3>
                                    <p style={{ fontSize: "0.875rem" }}>Assigned to you</p>
                                </div>
                                <span className={`badge ${getStatusBadgeClass(evalItem.status)}`}>
                                    {getStatusText(evalItem.status)}
                                </span>
                            </div>

                            <StepIndicator status={evalItem.status} hasReport={!!evalItem.report} />

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                                <div>
                                    <label>Manager Rating</label>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>{evalItem.rating}/5</div>
                                </div>
                                <div>
                                    <label>Manager Comment</label>
                                    <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{evalItem.manager_comment}</p>
                                </div>
                            </div>

                            {evalItem.status === "pending_intern" && (
                                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1.5rem" }}>
                                    <label>Your Feedback</label>
                                    <textarea
                                        placeholder="Add your comments here..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        style={{ marginBottom: "1rem", minHeight: "100px" }}
                                    />
                                    <button onClick={() => submitFeedback(evalItem.id)} disabled={loading}>
                                        Submit Feedback
                                    </button>
                                </div>
                            )}

                            {evalItem.status === "completed" && evalItem.report && (
                                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1.5rem" }}>
                                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
                                        <h4 style={{ color: "var(--accent)", marginBottom: "1rem" }}>AI Performance Analysis</h4>
                                        <div style={{ whiteSpace: "pre-wrap", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                            {evalItem.report}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => downloadEvaluationPDF(evalItem)}
                                        style={{ width: "100%" }}
                                    >
                                        Download Report (PDF)
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {evaluations.length === 0 && !loading && <div className="glass-card">No evaluations found.</div>}
                </div>

                {total > limit && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
                        <button
                            className="secondary"
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </button>
                        <span style={{ alignSelf: "center" }}>Page {page + 1} of {Math.ceil(total / limit)}</span>
                        <button
                            className="secondary"
                            disabled={(page + 1) * limit >= total}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default InternDashboard;
