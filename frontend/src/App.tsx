import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import ManagerDashboard from "./pages/ManagerDashboard.tsx";
import InternDashboard from "./pages/InternDashboard.tsx";
import HRDashboard from "./pages/HRDashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Layout from "./components/Layout.tsx";
import { ToastProvider } from "./components/ToastContext.tsx";
import "./index.css";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/manager"
              element={
                <ProtectedRoute role="manager">
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/intern"
              element={
                <ProtectedRoute role="intern">
                  <InternDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hr"
              element={
                <ProtectedRoute role="hr">
                  <HRDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;