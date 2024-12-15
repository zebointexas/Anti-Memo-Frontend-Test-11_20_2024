import { useState } from "react";
import { useNavigate } from "react-router-dom";  // 导入 useNavigate
import api from "../api";

function CreateOneTimeEvent() {
    const [eventName, setEventName] = useState("");  // 存储事件名称
    const [eventDetails, setEventDetails] = useState("");  // 存储事件详情
    const [startDate, setStartDate] = useState("");  // 存储事件开始时间
    const [isHighImportance, setIsHighImportance] = useState(false);  // 是否非常重要
    const navigate = useNavigate();  // 获取 navigate 函数
 
    // 提交表单
    const createOneTimeEvent = (e) => {
        e.preventDefault();
        
        // 验证必填字段
        if (!eventName || !startDate) {
            alert("Please fill all required fields!");
            return;
        }

        const eventData = {
            event_name: eventName,
            event_details: eventDetails,
            start_date: startDate,
            is_very_important: isHighImportance,
        };

        api
            .post("/api/one_time_events/create/", eventData)  // 发送到创建 OneTimeEvent 的 API
            .then((res) => {
                if (res.status === 201) {
                    console.log("OneTimeEvent was created!");
                    alert("OneTimeEvent was created!");
                } else {
                    console.log("Failed to create OneTimeEvent.");
                }
            })
            .catch((err) => alert(err));
    };
 
    return (
        <div>
            <h2>Create a One Time Event</h2>
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
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <br />

                {/* 使用flexbox进行水平对齐 */}
                <div style={{ display: "flex", alignItems: "center" }}>
                    <label htmlFor="is_very_important" >
                        High Importance?
                    </label>
                    <input
                        type="checkbox"
                        id="is_very_important"
                        checked={isHighImportance}
                        onChange={() => setIsHighImportance(!isHighImportance)}
                    />
                </div>

                <br />
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}

export default CreateOneTimeEvent;
