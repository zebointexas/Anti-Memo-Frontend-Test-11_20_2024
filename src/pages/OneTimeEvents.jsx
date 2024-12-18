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

    const today = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric"
    });

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
                if (res.status === 204) null;
                else alert("Failed to delete One Time Event.");
                getOneTimeEvent();
            })
            .catch((error) => alert(error));
    };

    const updateAsDone = (id, is_done_value) => {
        api
            .patch(`/api/one_time_event/update/${id}/`, { is_done: is_done_value }) // 假设使用 PATCH 请求
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

    const updateEventDetails = (id, updated_record_details) => {
        api
            .patch(`/api/one_time_event/update/${id}/`, { event_details: updated_record_details }) // 假设使用 PATCH 请求
            .then((res) => {
                if (res.status === 200) {
                    getOneTimeEvent(); // 更新事件列表
                }
            })
            .catch((err) => {
                console.error("Error updating event details", err);
                alert("Error updating event details!");
            });
    };

    const postponeStartDate = (id, newStartDate) => {
        api
            .patch(`/api/one_time_event/update/${id}/`, { start_date: newStartDate }) // 假设使用 PATCH 请求
            .then((res) => {
                if (res.status === 200) {
                    getOneTimeEvent(); // 更新事件列表
                }
            })
            .catch((err) => {
                console.error("Error when postpone start date:", err);
                alert("Error when postpone start date!");
            });
    };

    return (
        <div>
            <h2 className="heading">One Time Events <span className="date"> - {today}</span> </h2>

            {/* 条件渲染：如果有事件，则显示列表 */}
            {oneTimeEvents.length > 0 ? (
                oneTimeEvents.map((event) => (
                    <OneTimeEventDetails
                        one_time_event_details={event}
                        onDelete={deleteOneTimeEvent}
                        onDone={updateAsDone}
                        onUpdateEventDetails={updateEventDetails}
                        onPostpone={postponeStartDate}
                        key={event.id}
                    />
                ))
            ) : (
                <p>No one-time events found.</p>
            )}

            <form onSubmit={createOneTimeEvent} className="form">
                <label htmlFor="event_name" className="label">Event Name:</label>
                <input
                    type="text"
                    id="event_name"
                    name="event_name"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="input"
                />
                
                <label htmlFor="event_details" className="label">Event Details:</label>
                <textarea
                    id="event_details"
                    name="event_details"
                    value={eventDetails}
                    onChange={(e) => setEventDetails(e.target.value)}
                    className="textarea"
                />
                
                <label htmlFor="start_date" className="label">Start Date:</label>
                <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                />
                
                <div className="checkboxContainer">
                    <label htmlFor="is_very_important" className="checkboxLabel">High Importance?</label>
                    <input
                        type="checkbox"
                        id="is_very_important"
                        checked={isHighImportance}
                        onChange={() => setIsHighImportance(!isHighImportance)}
                        className="checkbox"
                    />
                </div>

                <input type="submit" value="Create An One Time Event" className="submitButton" />
            </form>

            <style>
                {`
                    .heading {
                        text-align: center;
                        color: #333;
                        margin-bottom: 20px;
                    }
                    .form {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        margin: auto;
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }
                    .label {
                        font-weight: bold;
                        font-size: 16px;
                    }
                    .input {
                        padding: 10px;
                        font-size: 16px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        box-sizing: border-box;
                    }
                    .textarea {
                        padding: 10px;
                        font-size: 16px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        box-sizing: border-box;
                        min-height: 100px;
                        resize: vertical;
                    }
                    .checkboxContainer {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .checkboxLabel {
                        font-size: 16px;
                        margin: 0;
                    }
                    .checkbox {
                        width: 20px;
                        height: 20px;
                        cursor: pointer;
                    }
                    .submitButton {
                        padding: 10px 20px;
                        font-size: 16px;
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 20px;
                    }
                    .date {
                        font-size: 14px;  /* 小一点的字体大小 */
                        color: #777;      /* 更柔和的颜色 */
                        font-weight: normal;  /* 去掉粗体 */
                    }
                `}
            </style>
        </div>
    );
}

export default ViewOneTimeEvents;
