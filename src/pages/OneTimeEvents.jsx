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
        setStartDate(new Date().toISOString().slice(0, 16));
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
                    getOneTimeEvents();
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
                getOneTimeEvents();
            })
            .catch((error) => alert(error));
    };

    const markEventAsDone = (id) => {
        api
            .patch(`/api/one_time_event/update/${id}/`, { is_done: true }) // 假设使用 PATCH 请求
            .then((res) => {
                if (res.status === 200) {
                    getOneTimeEvents(); // 更新事件列表
                }
            })
            .catch((err) => {
                console.error("Error marking event as done:", err);
                alert("Error marking event as done!");
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
                        onDelete={deleteOneTimeEvent}
                        onDone={markEventAsDone}
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
                    type="date" // 只需要用户选择日期
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
                            margin: 0,
                            verticalAlign: "middle",
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
        </div>
    );
}

export default ViewOneTimeEvents; 
