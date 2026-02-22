import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

interface Props {
    children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");

    let user = { email: "", role: "" };
    if (token) {
        try {
            user = JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
            console.error("Failed to decode token", e);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const isAuthPage = location.pathname === "/" || location.pathname === "/register";

    if (isAuthPage) {
        return <div className="auth-wrapper">{children}</div>;
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <aside style={{
                width: "280px",
                background: "var(--bg-glass)",
                backdropFilter: "var(--glass-blur)",
                borderRight: "1px solid var(--border-glass)",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                height: "100vh",
                zIndex: 10
            }}>
                <div style={{ marginBottom: "3rem" }}>
                    <h2 style={{ fontSize: "1.5rem", color: "var(--primary)", fontWeight: 800 }}>Algo8.ai</h2>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>Intern Management</p>
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: "none" }}>
                        <li style={{ marginBottom: "1rem" }}>
                            <Link
                                to={user.role ? `/${user.role}` : "/"}
                                style={{
                                    color: "var(--text-primary)",
                                    textDecoration: "none",
                                    fontWeight: 500,
                                    display: "block",
                                    padding: "10px 16px",
                                    borderRadius: "8px",
                                    background: location.pathname.includes(user.role) ? "rgba(99, 102, 241, 0.1)" : "transparent"
                                }}
                            >
                                Dashboard
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div style={{
                    borderTop: "1px solid var(--border-glass)",
                    paddingTop: "1.5rem"
                }}>
                    <div style={{ marginBottom: "1rem" }}>
                        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Logged in as</p>
                        <p style={{ fontWeight: 500, color: "var(--text-primary)" }}>{user.email || "User"}</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--primary)" }}>{user.role || "No Role"}</p>
                    </div>
                    <button onClick={handleLogout} className="secondary" style={{ width: "100%", fontSize: "0.9rem" }}>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: "280px",
                flex: 1,
                padding: "2rem",
                background: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent)"
            }}>
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
