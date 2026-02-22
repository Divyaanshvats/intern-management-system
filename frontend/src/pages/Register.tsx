import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/ToastContext";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("manager");
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            showToast("Please fill in all fields", "error");
            return;
        }

        if ((role === "manager" || role === "hr") && !inviteCode) {
            showToast("Please enter the Algo8 Invite Code", "error");
            return;
        }

        // Algo8.ai Domain Validation for Manager/HR
        if ((role === "manager" || role === "hr") && !email.toLowerCase().endsWith("@algo8.ai")) {
            showToast("Managers and HR must use an @algo8.ai email address", "error");
            return;
        }

        setLoading(true);
        try {
            await api.post("/register", {
                name,
                email,
                password,
                role,
                invite_code: inviteCode,
            });

            showToast("User Registered Successfully", "success");
            navigate("/");
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || "Registration Failed";
            showToast(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh" }}>
            <div className="glass-card" style={{ width: "100%", maxWidth: "450px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Register</h2>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Full Name</label>
                    <input
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Email Address</label>
                    <input
                        placeholder={role === "intern" ? "john@company.com" : "firstname.lastname@algo8.ai"}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <label>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="manager">Manager</option>
                        <option value="intern">Intern</option>
                        <option value="hr">HR</option>
                    </select>
                </div>

                {(role === "manager" || role === "hr") && (
                    <div style={{ marginBottom: "2rem" }}>
                        <label style={{ color: "var(--accent)" }}>Algo8 Invite Code</label>
                        <input
                            type="password"
                            placeholder="Enter Secret Key"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            style={{ borderColor: "var(--accent)" }}
                        />
                    </div>
                )}

                <button onClick={handleRegister} style={{ width: "100%", marginBottom: "1.5rem" }} disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

                <div style={{ textAlign: "center" }}>
                    <Link to="/" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "0.9rem" }}>
                        Already have an account? Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;