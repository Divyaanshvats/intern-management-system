import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactNode;
    role: string;
}

function ProtectedRoute({ children, role }: Props) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" />;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.role !== role) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;