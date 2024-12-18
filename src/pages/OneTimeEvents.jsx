import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 导入 useNavigate
import api from "../api";
import OneTimeEventDetails from "../components/OneTimeEventDetails";

function ViewOneTimeEvents() {
    const [eventName, setEventName] = useState(""); // 存储事件名称
    const [eventDetails, setEventDetails] = useState(""); // 存储事件详情
    const [startDate, setStartDate] = useState(""); // 存储事件开始时间
    const [isHighImportance, setIsHighImportance] = useState(false); // 是否非常重要
    const [oneTimeEvents, setOneTimeEvents] = useState([]); // 存储事件列表

    const navigate = useNavigate(); // 获取 navigate 函数

    useEffect(() => {
        getOneTimeEvent();
        setStartDate(new Date().toISOString().slice(0, 16));
    }, []);

    const getOneTimeEvent = () => {
        api
            .get("/api/one_time_events_list/") // 修正 API 路径
            .then((res) => res.data)
            .then((data) => {
                setOneTimeEvents(data); // 设置返回的事件列表
            })
            .catch((err) => {
                console.error("Failed to fetch events:", err);
                alert("Failed to fetch one-time events!");
            });
    };

    const createOneTimeEvent = (e) => {
        e.preventDefault();
    
        // 如果用户只选择了日期，自动添加时间为 "00:00:00"
        const formattedStartDate = startDate.includes("T")
            ? startDate
            : `${startDate}T00:00:00`;
    
        const eventData = {
            event_name: eventName,
            event_details: eventDetails || "N/A",
            start_date: formattedStartDate, // 使用格式化后的日期时间
            is_high_importance: isHighImportance,
        };
    
        api
            .post("/api/one_time_event/create/", eventData)
            .then((res) => {
                if (res.status === 201) {
                    setEventName("");
                    setEventDetails("");
                    setStartDate(new Date().toISOString().slice(0, 10)); // 重置为当前日期
                    setIsHighImportance(false);
                    getOneTimeEvent();
                } else {
                    console.log("Failed to create OneTimeEvent.");
                }
            })
            .catch((err) => {
                console.error("Error creating event:", err);
                alert("Error creating one-time event!");
            });
    };    

    const deleteOneTimeEvent = (id) => {
        api
            .delete(`/api/one_time_event/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("One-time-event deleted!   id: " + id);
                else alert("Failed to delete One Time Event.");
                getOneTimeEvent();
            })
            .catch((error) => alert(error));
    };

    const markEventAsDone = (id) => {
        api
            .patch(`/api/one_time_event/update/${id}/`, { is_done: true }) // 假设使用 PATCH 请求
            .then((res) => {
                if (res.status === 200) {
                    getOneTimeEvent(); // 更新事件列表
                }
            })
            .catch((err) => {
                console.error("Error marking event as done:", err);
                alert("Error marking event as done!");
            });
    };

    return (
        <div>
            <h2 style={styles.heading}>One-Time Events</h2>

            {/* 条件渲染：如果有事件，则显示列表 */}
            {oneTimeEvents.length > 0 ? (
                oneTimeEvents.map((event) => (
                    <OneTimeEventDetails
                        one_time_event_details={event}
                        onDelete={deleteOneTimeEvent}
                        onDone={markEventAsDone}
                        key={event.id}
                    />
                ))
            ) : (
                <p>No one-time events found.</p>
            )}

            <form onSubmit={createOneTimeEvent} style={styles.form}>
                <label htmlFor="event_name" style={styles.label}>Event Name:</label>
                <input
                    type="text"
                    id="event_name"
                    name="event_name"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    style={styles.input}
                />
                
                <label htmlFor="event_details" style={styles.label}>Event Details:</label>
                <textarea
                    id="event_details"
                    name="event_details"
                    value={eventDetails}
                    onChange={(e) => setEventDetails(e.target.value)}
                    style={styles.textarea}
                />
                
                <label htmlFor="start_date" style={styles.label}>Start Date:</label>
                <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={styles.input}
                />
                
                <div style={styles.checkboxContainer}>
                    <label htmlFor="is_very_important" style={styles.checkboxLabel}>High Importance?</label>
                    <input
                        type="checkbox"
                        id="is_very_important"
                        checked={isHighImportance}
                        onChange={() => setIsHighImportance(!isHighImportance)}
                        style={styles.checkbox}
                    />
                </div>

                <input type="submit" value="Create An One Time Event" style={styles.submitButton} />
            </form>
        </div>
    );
}

const styles = {
    heading: {
        textAlign: "center",
        color: "#333",
        marginBottom: "20px",
    },
    form: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        maxWidth: "600px",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    label: {
        fontWeight: "bold",
        fontSize: "16px",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxSizing: "border-box",
    },
    textarea: {
        padding: "10px",
        fontSize: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxSizing: "border-box",
        minHeight: "100px",
        resize: "vertical",
    },
    checkboxContainer: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    checkboxLabel: {
        fontSize: "16px",
        margin: 0,
    },
    checkbox: {
        width: "20px",
        height: "20px",
        cursor: "pointer",
    },
    submitButton: {
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "20px",
    },
};

export default ViewOneTimeEvents;
