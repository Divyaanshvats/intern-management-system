import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/ToastContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleLogin = async () => {
        if (!email || !password) {
            showToast("Please fill in all fields", "error");
            return;
        }
        setLoading(true);
        try {
            const response = await api.post("/login", { email, password });
            const token = response.data.access_token;
            localStorage.setItem("token", token);

            showToast("Login Successful", "success");

            const payload = JSON.parse(atob(token.split(".")[1]));
            const role = payload.role;

            if (role === "manager") navigate("/manager");
            else if (role === "intern") navigate("/intern");
            else if (role === "hr") navigate("/hr");

        } catch (error: any) {
            showToast("Login failed. Please check your credentials.", "error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
            <div className="glass-card" style={{ width: "100%", maxWidth: "400px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Login</h2>

                <div style={{ marginBottom: "1.5rem" }}>
                    <label>Email</label>
                    <input
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button onClick={handleLogin} style={{ width: "100%", marginBottom: "1.5rem" }} disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div style={{ textAlign: "center" }}>
                    <Link to="/register" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "0.9rem" }}>
                        Don't have an account? Register here
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;