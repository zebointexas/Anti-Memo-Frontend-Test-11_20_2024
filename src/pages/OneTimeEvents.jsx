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
        getOneTimeEvents();
    }, []);

    const getOneTimeEvents = () => {
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
 
        const eventData = {
            event_name: eventName,
            event_details: eventDetails,
            start_date: startDate,
            is_very_important: isHighImportance,
        };

        api
            .post("/api/one_time_events/create/", eventData) // 发送到创建 OneTimeEvent 的 API
            .then((res) => {
                if (res.status === 201) {
                    setEventName("");
                    setEventDetails("");
                    setStartDate("");
                    setIsHighImportance(false);
                    getOneTimeEvents(); // 刷新事件列表
                } else {
                    console.log("Failed to create OneTimeEvent.");
                }
            })
            .catch((err) => {
                console.error("Error creating event:", err);
                alert("Error creating one-time event!");
            });
    };

    return (
        <div>
            <h2>One-Time Events</h2>
            {/* 条件渲染：如果有事件，则显示列表 */}
            {oneTimeEvents.length > 0 ? (
                oneTimeEvents.map((event) => (
                    <OneTimeEventDetails
                        one_time_event_details={event}
                        key={event.id}
                    />
                ))
            ) : (
                <p>No one-time events found.</p>
            )}

            <form onSubmit={createOneTimeEvent}>
                <label htmlFor="event_name">Event Name:</label>
                <br />
                <input
                    type="text"
                    id="event_name"
                    name="event_name"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                />
                <br />

                <label htmlFor="event_details">Event Details:</label>
                <br />
                <textarea
                    id="event_details"
                    name="event_details"
                    value={eventDetails}
                    onChange={(e) => setEventDetails(e.target.value)}
                />
                <br />

                <label htmlFor="start_date">Start Date:</label>
                <br />
                <input
                    type="datetime-local"
                    id="start_date"
                    name="start_date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <br />
                <br />

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label htmlFor="is_very_important" style={{ margin: 0, lineHeight: "normal" }}>
                        High Importance?
                    </label>
                    <input
                        type="checkbox"
                        id="is_very_important"
                        checked={isHighImportance}
                        onChange={() => setIsHighImportance(!isHighImportance)}
                        style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            margin: 0, // 去掉默认的外边距
                            verticalAlign: "middle" // 确保checkbox与label在同一行
                        }}
                    />
                </div>

                <br />
                <br />
                <input type="submit" value="Create An One Time Event" />
            </form>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />     
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />            
        </div>
    );
}

export default ViewOneTimeEvents; 
