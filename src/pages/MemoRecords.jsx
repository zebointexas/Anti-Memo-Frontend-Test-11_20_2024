import { useState, useEffect } from "react";
import api from "../api";
import MemoRecord from "../components/MemoRecord"
import "../styles/Home.css"

function MemoRecords() {
    
    const [memo_records, setMemoRecords] = useState([]);

    useEffect(() => {
        getMemoRecords();
    }, []);

    const getMemoRecords = () => {
        api
            .get("/api/memo_records/")
            .then((res) => res.data)
            .then((data) => {
                // alert("Data fetched: " + JSON.stringify(data) + "     data size: " + Object.keys(data).length); 
                setMemoRecords(data);
            })
            .catch((err) => alert(err));
    };
 
    // const createMemoRecords = (e) => {
    //     e.preventDefault();
    //     api
    //         .post("/api/memo_records/", { record_Detail })
    //         .then((res) => {
    //             if (res.status === 201) alert("Note created!");
    //             else alert("Failed to make note.");
    //             getMemoRecords();
    //         })
    //         .catch((err) => alert(err));
    // };

    // const createMemoRecords = (e) => {
    //     e.preventDefault();
    //     api
    //         .post("/api/memo_records/", { record_Detail })
    //         .then((res) => {
    //             if (res.status === 201) {
    //                 alert("Memo record created!");
    //                 getMemoRecords();
    //             } else {
    //                 alert("Failed to create memo record.");
    //             }
    //         })
    //         .catch((err) => alert("Error: " + err));
    // };
     

    return (
        <div>
            <div>
                <h2>memo_records</h2>
                <p>Number of records: {memo_records.length}</p>
                {memo_records.map((memo_record) => (
                    <MemoRecord memo_record={memo_record} />
                ))}
            </div>
 
            {/* <h2>Create a Note</h2>
            <form onSubmit={createMemoRecords}>
                <label htmlFor="content">Content:</label>
                <br />
                <textarea
                    id="content"
                    name="content"
                    required
                    value={record_Detail}
                    onChange={(e) => setRecordDetail(e.target.value)}
                ></textarea>
                <br />
                <input type="submit" value="Submit"></input>
            </form> */}
        </div>
    );
}

export default MemoRecords;