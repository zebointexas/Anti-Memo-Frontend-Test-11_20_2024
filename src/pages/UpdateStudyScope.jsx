import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";  // 引入 useLocation 来获取传递的 state 数据
import api from "../api";
import "../styles/Home.css";

function UpdateStudyScope() {
    const [subjectTypes, setSubjectTypes] = useState([]);  // For storing fetched subject types
    const [selectedSubjectTypes, setSelectedSubjectTypes] = useState([]); // For storing selected subject types (multiple)
    const [selectedCategories, setSelectedCategories] = useState([]); // For storing selected categories (multiple)
    const [keyValue, setKeyValue] = useState("");  // For storing the updated value to send to backend

    const location = useLocation();  // 使用 useLocation 钩子获取传递的 state 数据
    const { study_scope_id } = location.state || {};  // 获取 study_scope_id

    useEffect(() => {
        console.log("Received study_scope_id: ", study_scope_id);        
    }, [study_scope_id]);

    useEffect(() => {
        api.get("/api/subject_types_list/")
            .then((res) => {
                if (res.status === 200) {
                    setSubjectTypes(res.data); // Update the subject types list
                } else {
                    console.log("Failed to fetch subject types.");
                }
            })
            .catch((err) => alert(err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedSubjectTypes.length === 0 && selectedCategories.length === 0) {
            alert("Please select at least one subject type or category!");
            return;
        }

        const updatedKeyValue = {
            subject_types: selectedSubjectTypes,   
            categories: selectedCategories        
        };

        console.log(updatedKeyValue);  
        console.log("study_scope_id = " + study_scope_id);   

        api        
            api.put(`/api/study_scope/update/${study_scope_id}/`, updatedKeyValue, {
                headers: { 'Content-Type': 'application/json' } 
            })
            .then((res) => {
                if (res.status === 200) {
                    console.log("Study scope updated successfully!");
                    setKeyValue("");   
                    setSelectedSubjectTypes([]);   
                    setSelectedCategories([]);  
                }
            })
            .catch((err) => {
                console.log("Failed to update the study scope.");
                alert(err)
            });
    };
 
    const toggleSubjectType = (type) => {
        setSelectedSubjectTypes((prev) => {
            if (prev.includes(type)) {
                return prev.filter(item => item !== type); // Remove if already selected
            } else {
                return [...prev, type]; // Add if not selected
            }
        });
    };

    const toggleCategory = (category) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter(item => item !== category); // Remove if already selected
            } else {
                return [...prev, category]; // Add if not selected
            }
        });
    };

    return (
        <div>
            <h3>Update Study Scope</h3>
            
            <h4>Choose Subject Types:</h4>
            <div>
                {subjectTypes.map((subject) => (
                    <div key={subject.id}>
                        <input
                            type="checkbox"
                            id={`subject-${subject.id}`}
                            value={subject.type}
                            checked={selectedSubjectTypes.includes(subject.type)}
                            onChange={() => toggleSubjectType(subject.type)}
                            disabled={selectedCategories.length > 0} // Disable if categories are selected
                        />
                        <label htmlFor={`subject-${subject.id}`}>{subject.type}</label>
                    </div>
                ))}
            </div>

            <h4>Choose Categories:</h4>
            <div>
                {subjectTypes
                    .filter((value, index, self) => 
                        index === self.findIndex((t) => (
                            t.category === value.category // Ensure categories are unique
                        ))
                    )
                    .map((subject) => (
                        <div key={subject.id}>
                            <input
                                type="checkbox"
                                id={`category-${subject.category}`}
                                value={subject.category}
                                checked={selectedCategories.includes(subject.category)}
                                onChange={() => toggleCategory(subject.category)}
                                disabled={selectedSubjectTypes.length > 0} // Disable if subject types are selected
                            />
                            <label htmlFor={`category-${subject.category}`}>{subject.category}</label>
                        </div>
                    ))}
            </div>

            <button onClick={handleSubmit}>Update Study Scope</button>
        </div>
    );
}

export default UpdateStudyScope;
