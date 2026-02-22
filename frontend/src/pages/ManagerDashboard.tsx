import { useState, useEffect } from "react";
import api from "../services/api";
import StepIndicator from "../components/StepIndicator";
import { useToast } from "../components/ToastContext";
import { downloadEvaluationPDF } from "../services/pdfService";

function ManagerDashboard() {
    const [internId, setInternId] = useState("");
    const [rating, setRating] = useState(1);
    const [comment, setComment] = useState("");
    const [monthsWorked, setMonthsWorked] = useState(1);
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const limit = 5;
    const [reports, setReports] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const res = await api.get("/manager/evaluations", {
                params: {
                    search: search || undefined,
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

    const handleSubmit = async () => {
        if (!internId || !comment) {
            showToast("Please fill in all fields", "error");
            return;
        }
        setLoading(true);
        try {
            await api.post("/create-evaluation", {
                intern_id: internId,
                rating: rating,
                manager_comment: comment,
                months_worked: monthsWorked,
            });

            showToast("Evaluation Created Successfully", "success");
            setInternId("");
            setComment("");
            setRating(1);
            setMonthsWorked(1);
            setPage(0);
            fetchEvaluations();
        } catch (err) {
            console.error(err);
            showToast("Error creating evaluation", "error");
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (evaluationId: number) => {
        try {
            const res = await api.post(`/generate-report/${evaluationId}`);
            setReports((prev) => ({
                ...prev,
                [evaluationId]: res.data.report,
            }));
            showToast("Report Generated", "success");
            fetchEvaluations();
        } catch (err) {
            console.error(err);
            showToast("Error generating report", "error");
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "completed": return "badge-completed";
            case "pending_intern": case "pending_hr": return "badge-pending";
            default: return "badge-pending";
        }
    };

    const getStatusText = (status: string) => {
        return status.replace("_", " ").toUpperCase();
    };

    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: "2rem" }}>
                <h1>Manager Dashboard</h1>
                <p>Create and manage intern performance evaluations.</p>
            </header>

            <section className="glass-card" style={{ marginBottom: "3rem" }}>
                <h2 style={{ marginBottom: "1.5rem" }}>Create New Evaluation</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label>Intern Email</label>
                        <input
                            placeholder="intern@company.com"
                            value={internId}
                            onChange={(e) => setInternId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Rating (1–5)</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Months Worked</label>
                        <input
                            type="number"
                            min="1"
                            value={monthsWorked}
                            onChange={(e) => setMonthsWorked(Number(e.target.value))}
                        />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                        <label>Manager Comment</label>
                        <textarea
                            placeholder="Detailed performance review..."
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    style={{ marginTop: "1.5rem", width: "100%" }}
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Evaluation"}
                </button>
            </section>

            <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ margin: 0 }}>Evaluations</h2>
                    <div style={{ display: "flex", gap: "0.5rem", width: "350px" }}>
                        <input
                            placeholder="Search intern email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (setPage(0), fetchEvaluations())}
                            style={{ padding: "8px 12px" }}
                        />
                        <button onClick={() => { setPage(0); fetchEvaluations(); }} className="secondary" style={{ padding: "8px 16px" }}>Search</button>
                    </div>
                </div>

                <div style={{ display: "grid", gap: "1.5rem" }}>
                    {evaluations.map((evalItem) => (
                        <div key={evalItem.id} className="glass-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem" }}>{evalItem.intern_id}</h3>
                                    <p style={{ fontSize: "0.875rem" }}>Created on {new Date(evalItem.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`badge ${getStatusBadgeClass(evalItem.status)}`}>
                                    {getStatusText(evalItem.status)}
                                </span>
                            </div>

                            <StepIndicator status={evalItem.status} hasReport={!!evalItem.report} />

                            <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                                <div>
                                    <label style={{ fontSize: "0.75rem" }}>Rating</label>
                                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>{evalItem.rating}/5</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: "0.75rem" }}>Duration</label>
                                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{evalItem.months_worked} Months</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ fontSize: "0.75rem" }}>Your Comment</label>
                                <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{evalItem.manager_comment}</p>
                            </div>

                            {evalItem.status === "completed" && (
                                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1rem", marginTop: "1rem" }}>
                                    {(evalItem.report || reports[evalItem.id]) ? (
                                        <>
                                            <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
                                                <h4 style={{ fontSize: "0.9rem", color: "var(--accent)", marginBottom: "0.5rem" }}>AI Performance Analysis</h4>
                                                <div style={{ whiteSpace: "pre-wrap", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                                    {evalItem.report || reports[evalItem.id]}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => downloadEvaluationPDF(evalItem)}
                                                className="btn-primary"
                                                style={{ width: "100%", fontSize: "0.85rem" }}
                                            >
                                                Download Report (PDF)
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => generateReport(evalItem.id)} className="secondary" style={{ width: "100%" }}>
                                            Generate AI Report
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {evaluations.length === 0 && !loading && (
                        <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
                            No evaluations found.
                        </div>
                    )}
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

export default ManagerDashboard;
