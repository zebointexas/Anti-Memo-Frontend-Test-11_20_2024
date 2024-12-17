import React, { useState, useEffect, useRef } from "react";
import api from "../api";

function MemoRecordDetails({ memo_record, goToNext }) {
    const [isEditing, setIsEditing] = useState(false);
    const [updated_record_details, setUpdatedRecordDetails] = useState(memo_record.record_details);
    const [showContent, setShowContent] = useState(false);
    const [timer, setTimer] = useState(0); // 正计时的状态
    const timerRef = useRef(null); // 保存计时器引用

    useEffect(() => {
        setUpdatedRecordDetails(memo_record.record_details);
    }, [memo_record]);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, []);

    const resetTimer = () => {
        setTimer(0);
    };

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleContentChange = (e) => {
        setUpdatedRecordDetails(e.target.value);
    };

    const handleDetailsUpdate = () => {
        if (updated_record_details !== memo_record.record_details) {
            api.put(`/api/memo_records/update/record-details/${memo_record.id}/`, { record_details: updated_record_details })
                .then((res) => {
                    if (res.status === 200) {
                        console.log("MemoRecord details updated successfully!");
                    }
                })
                .catch((err) => alert(err));
        }
        setIsEditing(false);
    };

    const handleStudyStatusUpdate = (study_status) => (e) => {
        e.preventDefault();
        resetTimer();
        api.put(`/api/memo_records/update/study-history/${memo_record.id}/`, { study_status })
            .then((res) => {
                if (res.status === 200) {
                    console.log(`Updated study status to "${study_status}" for memo_record id: ${memo_record.id}`);
                }
            })
            .catch((err) => alert(err));
        goToNext();
        setShowContent(false);
        setIsEditing(false);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleDetailsUpdate();
        } else {
            setIsEditing(true);
            setShowContent(true);
        }
    };

    const deleteMemoRecord = (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            api.delete(`/api/memo_records/delete/${id}/`)
                .then((res) => {
                    if (res.status === 204) {
                        goToNext();
                    }
                })
                .catch((error) => alert(error));
        }
    };

    const styles = {
        wrapper: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
        },
        container: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
        },
        form: {
            display: "flex",
            flexDirection: "column",
            width: "100%",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "white",
            padding: "10px",
        },
        textarea: {
            width: "100%",
            minHeight: "500px",
            fontSize: "1.2em",
            padding: "12px",
            resize: "both",
            lineHeight: "1.6",
            boxSizing: "border-box",
            borderRadius: "8px",
            border: "1px solid #ccc",
        },
        buttonContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
        },
        deleteButton: {
            backgroundColor: "red",
            color: "white",
            marginTop: "10px",
        },
        timerInfo: {
            marginBottom: "10px",
        },
        displayAnswerButton: {
            fontSize: "40px",
            padding: "80px 30px",
            borderRadius: "40px",
            border: "none",
            cursor: "pointer",
        },
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div>
                    <form style={styles.form}>
                        <p>
                            <span style={{ fontWeight: "bold", fontSize: "25px", backgroundColor: "#FFFFE0" }}>
                                {memo_record.question}
                            </span>
                        </p>
                        {showContent ? (
                            isEditing ? (
                                <textarea
                                    value={updated_record_details}
                                    onChange={handleContentChange}
                                    rows={15}
                                    style={styles.textarea}
                                />
                            ) : (
                                <p style={{ ...styles.displayAnswerButton, whiteSpace: "pre-wrap" }}>
                                    {updated_record_details}
                                </p>
                            )
                        ) : (
                            <button
                                type="button"
                                style={styles.displayAnswerButton}
                                onClick={() => setShowContent(true)}
                            >
                                Display the Answer
                            </button>
                        )}

                        <div>
                            <p>MemoRecord ID: {memo_record.id}</p>
                            <p>Study History ID: {memo_record.study_history_id.id}</p>
                            <p>
                                Last Study Time:{" "}
                                {new Date(memo_record.study_history_id.last_updated).toLocaleTimeString()}
                            </p>
                            <p>
                                Last Study Date:{" "}
                                {new Date(memo_record.study_history_id.last_updated).toLocaleDateString()}
                            </p>
                        </div>
                    </form>
                    <div style={styles.buttonContainer}>
                        <div style={styles.timerInfo}>
                            <p>{formatTimer(timer)}</p>
                        </div>
                        <button type="button" onClick={handleStudyStatusUpdate("Remember")}>
                            Remember
                        </button>
                        <button type="button" onClick={handleStudyStatusUpdate("Forget")}>
                            Forget
                        </button>
                        <button type="button" onClick={handleEditToggle}>
                            {isEditing ? "Save" : "Edit"}
                        </button>
                        <button
                            type="button"
                            onClick={() => deleteMemoRecord(memo_record.id)}
                            style={styles.deleteButton}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MemoRecordDetails;
