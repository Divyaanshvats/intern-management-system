import { useEffect, useState } from "react";
import api from "../services/api";
import StepIndicator from "../components/StepIndicator";
import { useToast } from "../components/ToastContext";
import { downloadEvaluationPDF } from "../services/pdfService";

function HRDashboard() {
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(0);
    const limit = 10;
    const [users, setUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"evaluations" | "users">("evaluations");
    const [hrComment, setHrComment] = useState("");
    const [ratingAdjustment, setRatingAdjustment] = useState(0);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const res = await api.get("/hr/evaluations", {
                params: {
                    search: search || undefined,
                    status: statusFilter || undefined,
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

    const fetchUsers = async () => {
        try {
            const res = await api.get("/hr/users");
            setUsers(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEvaluations();
        fetchUsers();
    }, [page, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchEvaluations();
    };

    const toggleUserStatus = async (email: string) => {
        try {
            await api.post("/hr/toggle-user", null, { params: { email } });
            showToast("User status updated", "success");
            fetchUsers();
        } catch (err) {
            showToast("Failed to update user", "error");
        }
    };

    const submitReview = async (evaluationId: number) => {
        if (!hrComment) {
            showToast("Please provide your review comments", "error");
            return;
        }
        setLoading(true);
        try {
            await api.post("/submit-hr-review", null, {
                params: {
                    evaluation_id: evaluationId,
                    comment: hrComment,
                    rating_adjustment: ratingAdjustment,
                },
            });

            showToast("Review Submitted & AI Report Generated", "success");
            setHrComment("");
            setRatingAdjustment(0);
            fetchEvaluations();
        } catch (err) {
            console.error(err);
            showToast("Error submitting review", "error");
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (evaluationId: number) => {
        setLoading(true);
        try {
            await api.post(`/generate-report/${evaluationId}`);
            showToast("AI Report Generated Successfully", "success");
            fetchEvaluations();
        } catch (err) {
            console.error(err);
            showToast("Failed to generate AI report", "error");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
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
                <h1>HR Dashboard</h1>
                <p>Manage evaluations and user access control.</p>
            </header>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-glass)" }}>
                <button
                    onClick={() => setActiveTab("evaluations")}
                    style={{
                        background: activeTab === "evaluations" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                        border: "none",
                        color: activeTab === "evaluations" ? "var(--primary)" : "var(--text-secondary)",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px 8px 0 0",
                        cursor: "pointer"
                    }}
                >
                    Evaluations ({total})
                </button>
                <button
                    onClick={() => setActiveTab("users")}
                    style={{
                        background: activeTab === "users" ? "rgba(99, 102, 241, 0.2)" : "transparent",
                        border: "none",
                        color: activeTab === "users" ? "var(--primary)" : "var(--text-secondary)",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px 8px 0 0",
                        cursor: "pointer"
                    }}
                >
                    User Management
                </button>
            </div>

            {activeTab === "evaluations" ? (
                <section>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                        <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", gap: "1rem" }}>
                            <input
                                placeholder="Search by Intern or Manager email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button type="submit" className="secondary">Search</button>
                        </form>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                            style={{ width: "200px" }}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending_hr">Pending HR</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div style={{ display: "grid", gap: "2rem" }}>
                        {evaluations.map((evalItem) => (
                            <div key={evalItem.id} className="glass-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.1rem" }}>{evalItem.intern_id}</h3>
                                        <p style={{ fontSize: "0.875rem" }}>Evaluation #{evalItem.id} | Manager: {evalItem.manager_id}</p>
                                    </div>
                                    <span className={`badge ${getStatusBadgeClass(evalItem.status)}`}>
                                        {getStatusText(evalItem.status)}
                                    </span>
                                </div>

                                <StepIndicator status={evalItem.status} hasReport={!!evalItem.report} />

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                                    <div>
                                        <label>Manager Rating</label>
                                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>{evalItem.rating}/5</div>
                                    </div>
                                    <div style={{ gridColumn: "span 2" }}>
                                        <label>Manager Comment</label>
                                        <p style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{evalItem.manager_comment}</p>
                                    </div>
                                    <div style={{ gridColumn: "span 3", borderTop: "1px solid var(--border-glass)", paddingTop: "1rem" }}>
                                        <label>Intern Comment</label>
                                        <p style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{evalItem.intern_comment || "No comment provided."}</p>
                                    </div>
                                </div>

                                {evalItem.status === "pending_hr" && (
                                    <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1.5rem" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                                            <div>
                                                <label>HR Comment</label>
                                                <textarea
                                                    placeholder="Final assessment..."
                                                    value={hrComment}
                                                    onChange={(e) => setHrComment(e.target.value)}
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <label>Rating Adjustment (-2 to +2)</label>
                                                <input
                                                    type="number"
                                                    min="-2"
                                                    max="2"
                                                    value={ratingAdjustment}
                                                    onChange={(e) => setRatingAdjustment(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => submitReview(evalItem.id)}
                                            disabled={loading}
                                            style={{ width: "100%" }}
                                        >
                                            {loading ? "Finalizing..." : "Finalize & Generate AI Report"}
                                        </button>
                                    </div>
                                )}

                                {evalItem.status === "completed" && (
                                    <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "1.5rem" }}>
                                        {evalItem.report ? (
                                            <>
                                                <div style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "12px", marginBottom: "1rem" }}>
                                                    <h4 style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>Final AI Report</h4>
                                                    <div style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                                        {evalItem.report}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => downloadEvaluationPDF(evalItem)}
                                                    className="secondary"
                                                    style={{ width: "100%" }}
                                                >
                                                    Download Branded PDF
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{ textAlign: "center", padding: "1rem", background: "rgba(255, 165, 0, 0.1)", borderRadius: "8px" }}>
                                                <p style={{ color: "#ffa500", marginBottom: "1rem", fontSize: "0.9rem" }}>
                                                    ⚠️ AI Report failed to generate automatically.
                                                </p>
                                                <button
                                                    onClick={() => generateReport(evalItem.id)}
                                                    className="secondary"
                                                    style={{ width: "100%" }}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Generating..." : "Manually Generate AI Report"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {total > limit && (
                        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
                            <button className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
                            <span style={{ alignSelf: "center" }}>Page {page + 1} of {Math.ceil(total / limit)}</span>
                            <button className="secondary" disabled={(page + 1) * limit >= total} onClick={() => setPage(page + 1)}>Next</button>
                        </div>
                    )}
                </section>
            ) : (
                <section className="glass-card">
                    <h2 style={{ marginBottom: "1.5rem" }}>User Management</h2>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-glass)" }}>
                                <th style={{ padding: "1rem" }}>Name</th>
                                <th style={{ padding: "1rem" }}>Email</th>
                                <th style={{ padding: "1rem" }}>Role</th>
                                <th style={{ padding: "1rem" }}>Status</th>
                                <th style={{ padding: "1rem" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.email} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                                    <td style={{ padding: "1rem" }}>{u.name}</td>
                                    <td style={{ padding: "1rem" }}>{u.email}</td>
                                    <td style={{ padding: "1rem", textTransform: "capitalize" }}>{u.role}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{
                                            color: u.is_active ? "var(--success)" : "var(--danger)",
                                            fontWeight: 600
                                        }}>
                                            {u.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <button
                                            onClick={() => toggleUserStatus(u.email)}
                                            style={{
                                                padding: "6px 12px",
                                                fontSize: "0.8rem",
                                                background: u.is_active ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                                                color: u.is_active ? "var(--danger)" : "var(--success)",
                                                border: `1px solid ${u.is_active ? "var(--danger)" : "var(--success)"}`
                                            }}
                                        >
                                            {u.is_active ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}
        </div>
    );
}

export default HRDashboard;
