import React from "react";

interface StepIndicatorProps {
    status: string;
    hasReport?: boolean;
}

const steps = [
    { id: "pending_intern", label: "Intern Feedback" },
    { id: "pending_hr", label: "HR Review" },
    { id: "completed", label: "AI Report" }
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ status, hasReport }) => {
    const currentStepIndex = steps.findIndex(step => step.id === status);
    const isCompleted = status === "completed";

    const getStepStatus = (index: number) => {
        if (index === 2) { // AI Report step
            return hasReport ? "completed" : (isCompleted ? "warning" : "pending");
        }
        if (isCompleted) return "completed";
        if (index < currentStepIndex) return "completed";
        if (index === currentStepIndex) return "active";
        return "pending";
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
            {steps.map((step, index) => {
                const stepStatus = getStepStatus(index);
                return (
                    <React.Fragment key={step.id}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                background: stepStatus === "completed" ? "var(--success)" :
                                    stepStatus === "active" ? "var(--primary)" :
                                        stepStatus === "warning" ? "#ffa500" : "rgba(255,255,255,0.05)",
                                color: stepStatus === "pending" ? "var(--text-secondary)" : "white",
                                border: (stepStatus === "pending" || stepStatus === "warning") ? "1px solid var(--border-glass)" : "none",
                                transition: "all 0.3s ease"
                            }}>
                                {stepStatus === "completed" ? "✓" : (stepStatus === "warning" ? "!" : index + 1)}
                            </div>
                            <span style={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                color: stepStatus === "pending" ? "var(--text-secondary)" : "var(--text-primary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div style={{
                                height: "2px",
                                flex: 1,
                                background: index < currentStepIndex || isCompleted ? "var(--success)" : "rgba(255,255,255,0.05)",
                                marginTop: "-1.5rem"
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StepIndicator;
