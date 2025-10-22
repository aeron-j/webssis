import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const AddCollege = () => {
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      college_code: collegeCode,
      college_name: collegeName,
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setMessage(result.message);
        setCollegeCode("");
        setCollegeName("");
      } else {
        setMessage("❌ Failed to add college. Please check backend logs.");
      }
    } catch (error) {
      console.error("Error adding college:", error);
      setMessage("⚠️ Error: Could not connect to backend.");
    }
  };

  return (
    <div className="row information-frame">
      {/* Sidebar */}
      <Sidebar type="college" />

      {/* Main Content */}
      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Add College</h2>

        {/* Form Frame */}
        <div className="card p-4 bg-transparent text-light shadow-lg">
          <h5>College Information</h5>
          <hr />

          <form onSubmit={handleSubmit}>
            {/* College Code */}
            <div className="mb-3">
              <label htmlFor="collegeCode" className="form-label">
                College Code
              </label>
              <input
                type="text"
                className="form-control"
                id="collegeCode"
                placeholder="Enter college code"
                value={collegeCode}
                onChange={(e) => setCollegeCode(e.target.value)}
                required
              />
            </div>

            {/* College Name */}
            <div className="mb-3">
              <label htmlFor="collegeName" className="form-label">
                College Name
              </label>
              <input
                type="text"
                className="form-control"
                id="collegeName"
                placeholder="Enter college name"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>

            {/* Add College Button */}
            <div className="text-end">
              <button type="submit" className="btn btn-success">
                + Add College
              </button>
            </div>
          </form>

          {/* Feedback Message */}
          {message && (
            <div className="alert alert-info mt-3 text-center">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCollege;
