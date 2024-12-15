import React, { useState } from "react";

function OneTimeEventDetails({ one_time_event_details, onDelete }) {
    const [showHistory, setShowHistory] = useState(false); // 控制是否显示历史内容

    if (!one_time_event_details) {
        return <p>No event details available.</p>;
    }

    const formattedCreatedAt = new Date(one_time_event_details.created_at).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric" }
    );
    const formattedStartDate = new Date(one_time_event_details.start_date).toLocaleString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    );

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <h3 style={styles.title}>{one_time_event_details.event_name}</h3>
                <div>
                    <button
                        style={styles.deleteButton}
                        onClick={() => onDelete(one_time_event_details.id)}
                    >
                        Delete
                    </button>
                    <button
                        style={styles.toggleButton}
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? "Hide History" : "View History"}
                    </button>
                </div>
            </div>
            <p style={styles.detail}><strong>Details:</strong> {one_time_event_details.event_details}</p>
            <p style={styles.detail}><strong>Start Date:</strong> {formattedStartDate}</p>
            <p style={styles.meta}><strong>Created At:</strong> {formattedCreatedAt}</p>
            {showHistory && (
                <p style={styles.history}><strong>History:</strong> {one_time_event_details.event_history}</p>
            )}
        </div>
    );
}

const styles = {
    card: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        margin: "16px 0",
        backgroundColor: "#fff",
        maxWidth: "400px",
        position: "relative",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: "18px",
        marginBottom: "8px",
        color: "#333",
    },
    deleteButton: {
        backgroundColor: "#f44336",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: "14px",
        marginLeft: "8px",
        transition: "background-color 0.3s",
    },
    toggleButton: {
        backgroundColor: "#2196f3",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "background-color 0.3s",
        marginLeft: "8px",
    },
    detail: {
        fontSize: "14px",
        margin: "4px 0",
        color: "#555",
    },
    meta: {
        fontSize: "12px",
        margin: "8px 0",
        color: "#888",
    },
    history: {
        fontSize: "14px",
        marginTop: "4px",
        color: "#555",
    },
};

export default OneTimeEventDetails;
