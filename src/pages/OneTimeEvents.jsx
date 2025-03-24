import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import OneTimeEventDetails from "../components/OneTimeEventDetails";

function ViewOneTimeEvents() {
    const [eventName, setEventName] = useState("");
    const [eventDetails, setEventDetails] = useState("");
    const [startDate, setStartDate] = useState("");
    const [isHighImportance, setIsHighImportance] = useState(false);
    const [oneTimeEvents, setOneTimeEvents] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        getOneTimeEvent();
        const now = new Date();
        const localISOString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
        setStartDate(localISOString.slice(0, 16));
    }, []);

    const today = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric"
    });

    // 辅助函数：检查日期是否是今天
    const isToday = (dateString) => {
        const today = new Date();
        const eventDate = new Date(dateString);
        return (
            eventDate.getDate() === today.getDate() &&
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear()
        );
    };

    // 对事件进行排序的函数
    const sortEvents = (events) => {
        return events.sort((a, b) => {
            // 首先按是否为今天的事件排序
            const aIsToday = isToday(a.start_date);
            const bIsToday = isToday(b.start_date);
            
            if (aIsToday && !bIsToday) return -1;
            if (!aIsToday && bIsToday) return 1;
            
            // 如果都是今天或都不是今天的事件，则按日期排序
            return new Date(a.start_date) - new Date(b.start_date);
        });
    };

    const getOneTimeEvent = () => {
        api
            .get("/api/one_time_events_list/")
            .then((res) => res.data)
            .then((data) => {
                const sortedEvents = sortEvents(data);
                setOneTimeEvents(sortedEvents);
            })
            .catch((err) => {
                console.error("Failed to fetch events:", err);
                alert("Failed to fetch one-time events!");
            });
    };

    const createOneTimeEvent = (e) => {

        e.preventDefault();

        const formattedStartDate = startDate.includes("T")
            ? startDate
            : startDate + 'T00:00'

        const eventData = {
            event_name: eventName,
            event_details: eventDetails || "N/A",
            start_date: formattedStartDate,
            is_high_importance: isHighImportance,
        };
    
        api
            .post("/api/one_time_event/create/", eventData)
            .then((res) => {
                if (res.status === 201) {
                    setEventName("");
                    setEventDetails("");
                    setStartDate(new Date().toISOString().slice(0, 10));
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
            .patch(`/api/one_time_event/update/${id}/`, { is_done: is_done_value })
            .then((res) => {
                if (res.status === 200) {
                    getOneTimeEvent();
                }
            })
            .catch((err) => {
                console.error("Error marking event as done:", err);
                alert("Error marking event as done!");
            });
    };

    const updateEventDetails = (id, updated_record_details) => {
        api
            .patch(`/api/one_time_event/update/${id}/`, { event_details: updated_record_details })
            .then((res) => {
                if (res.status === 200) {
                    getOneTimeEvent();
                }
            })
            .catch((err) => {
                console.error("Error updating event details", err);
                alert("Error updating event details!");
            });
    };

    const postponeStartDate = (id, newStartDate) => {
        api
            .patch(`/api/one_time_event/update/${id}/`, { start_date: newStartDate })
            .then((res) => {
                if (res.status === 200) {
                    getOneTimeEvent();
                }
            })
            .catch((err) => {
                console.error("Error when postpone start date:", err);
                alert("Error when postpone start date!");
            });
    };

    // 将事件分组：今天的事件和其他事件
    const todayEvents = oneTimeEvents.filter(event => isToday(event.start_date));
    const otherEvents = oneTimeEvents.filter(event => !isToday(event.start_date));

    return (
        <div>
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

            <br />
            <br /> 
            <br />
            <br />
            <br />
            <br />
            <br /> 
            <br />
            <br />

            <h2 className="heading">One Time Events <span className="date"> - {today}</span></h2>

            {oneTimeEvents.length > 0 ? (
                <div>
                    {/* 显示今天的事件 */}
                    {todayEvents.length > 0 && (
                        <div>
                            <h3 className="subheading">Today's Events</h3>
                            {todayEvents.map((event) => (
                                <OneTimeEventDetails
                                    one_time_event_details={event}
                                    onDelete={deleteOneTimeEvent}
                                    onDone={updateAsDone}
                                    onUpdateEventDetails={updateEventDetails}
                                    onPostpone={postponeStartDate}
                                    key={event.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* 显示其他事件 */}
                    {otherEvents.length > 0 && (
                        <div>
                            <h3 className="subheading">Upcoming Events</h3>
                            {otherEvents.map((event) => (
                                <OneTimeEventDetails
                                    one_time_event_details={event}
                                    onDelete={deleteOneTimeEvent}
                                    onDone={updateAsDone}
                                    onUpdateEventDetails={updateEventDetails}
                                    onPostpone={postponeStartDate}
                                    key={event.id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p>No one-time events found.</p>
            )}

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