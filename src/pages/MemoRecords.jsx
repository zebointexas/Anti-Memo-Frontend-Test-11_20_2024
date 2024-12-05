import { useState, useEffect } from "react";
import React from "react";
import "../styles/Home.css";
import api from "../api";
import { useNavigate } from "react-router-dom";
import MemoRecordDetails from "../components/MemoRecordDetails"; // 导入 MemoRecordDetails 组件

function MemoRecords() {
    const [memo_records, setMemoRecords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        getMemoRecords();
    }, []);

    const getMemoRecords = () => {
        api
            .get("/api/memo_records/")
            .then((res) => res.data)
            .then((data) => {
                console.log("Data fetched: " + JSON.stringify(data) + "     data size: " + Object.keys(data).length); 
                setMemoRecords(data);
            })
            .catch((err) => alert(err));
    };

    const currentRecord = memo_records[currentIndex];

    const goToNext = () => {
        if (currentIndex < memo_records.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToCreate = () => {
        navigate("/create-a-memo-record");
    };

    return (
        <div>
            <div>
                <h2>Memo Records</h2>
                <p>Number of records: {memo_records.length}</p>
                {currentRecord && (
                    <div>
                        <MemoRecordDetails 
                            memo_record={currentRecord}  
                            goToNext={goToNext} // 传递 goToNext 方法
                        />
                    </div>
                )}
            </div>
    
            <br />
            <br />
            <div>
                <button onClick={goToCreate}>Create a Memo Record</button>         
            </div>
        </div>
    );
}

export default MemoRecords;
