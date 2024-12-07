import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Home.css"


function CreateAMemoRecord() {
    
    const [record_details, setRecord_Details] = useState("");
 
    const createMemoRecord = (e) => {
        e.preventDefault();
        api
            .post("/api/memo_records/", { record_details })
            .then((res) => {
                if (res.status === 201) console.log("MemoRecord was created!");
                else console.log("Failed to make a memoRecord.");
            })
            .catch((err) => alert(err));
    };
    
    return (
        <div> 
 
            <h2>Create a Memo Record</h2>
            <form onSubmit={createMemoRecord}>
                <label htmlFor="content">Content:</label>
                <br />
                <textarea
                    id="content"
                    name="content"
                    required
                    value={record_details}
                    onChange={(e) => setRecord_Details(e.target.value)}
                ></textarea>
                <br />
                <input type="submit" value="Submit"></input>
            </form>
        </div> 
    );
}

export default CreateAMemoRecord;