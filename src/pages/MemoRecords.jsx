import { useState, useEffect } from "react";
import React from "react";
import "../styles/MemoRecords.css";
import api from "../api";
import { useNavigate } from "react-router-dom";
import MemoRecordDetails from "../components/MemoRecordDetails";

function MemoRecords() {
    const [memo_records, setMemoRecords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);  
    const navigate = useNavigate();

    useEffect(() => {
        getMemoRecords();
    }, [refreshKey]);  

    const getMemoRecords = () => {
        api
            .get("/api/memo_records_list/")
            .then((res) => res.data)
            .then((data) => {
                console.log("Data fetched: " + JSON.stringify(data) + "     data size: " + Object.keys(data).length); 
                setMemoRecords(data);
                setCurrentIndex(0);  
            })
            .catch((err) => {
                if (err.response && err.response.status === 401) {
                    alert("Your session has expired. Please log in again.");
                    localStorage.setItem("redirectUrl", window.location.pathname);
                    navigate("/login");
                } else {
                    alert(err);
                }
            });
    };

    const currentRecord = memo_records[currentIndex];

    const goToNext = () => {
        if (currentIndex <= memo_records.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToCreate = () => {
        navigate("/create-a-memo-record");
    };

    const refreshData = () => {
        setRefreshKey(prevKey => prevKey + 1);  
    };

    return (
        <div>
            <div>
                <h2>Memo Records</h2>
                <p>Number of records: {memo_records.length}</p>

                {currentIndex === memo_records.length ? (
                    <div className="centered-img">
                        <img 
                            src="https://media.tenor.com/ZzQNUhQckqMAAAAC/excited-friends.gif" 
                            onClick={refreshData}
                            alt="Excited Friends"
                        />
                    </div>
                ) : (
                    currentRecord && (
                        <div>
                            <MemoRecordDetails 
                                memo_record={currentRecord}
                                goToNext={goToNext} 
                            />
                        </div>
                    )
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