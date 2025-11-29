import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";

const AddCollege = () => {
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert college code to uppercase before sending
    const data = { 
      college_code: collegeCode.toUpperCase(), 
      college_name: collegeName 
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("collegeMessage", result.message);
        navigate("/manage-college");
      } else {
        setMessage(result.message || "❌ Failed to add college. Please check backend logs.");
      }
    } catch (error) {
      console.error("Error adding college:", error);
      setMessage("⚠️ Error: Could not connect to backend.");
    }
  };

  return (
    <div className="row information-frame">
      <Sidebar type="college" />

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Add College</h2>

        <div className="card p-4 bg-transparent text-light shadow-lg">
          <h5>College Information</h5>
          <hr />

          <form onSubmit={handleSubmit}>
            {/* College Code */}
            <div className="mb-3">
              <label className="form-label">College Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter college code"
                value={collegeCode}
                onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            {/* College Name */}
            <div className="mb-3">
              <label className="form-label">College Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter college name"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>

            {/* Buttons: Cancel and Add College */}
            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate("/manage-college")}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-success">
                + Add College
              </button>
            </div>
          </form>

          {message && (
            <div className="alert alert-info mt-3 text-center">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCollege;