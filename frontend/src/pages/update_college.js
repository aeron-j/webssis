import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const UpdateCollege = () => {
  const [collegeCode, setCollegeCode] = useState("");       // editable code
  const [originalCode, setOriginalCode] = useState("");     // tracks original code for backend
  const [collegeName, setCollegeName] = useState("");
  const [message, setMessage] = useState("");

  // Load the highlighted college from localStorage
  useEffect(() => {
    const storedCollege = JSON.parse(localStorage.getItem("selectedCollege"));
    if (storedCollege) {
      setCollegeCode(storedCollege.college_code);
      setOriginalCode(storedCollege.college_code); // keep original for backend
      setCollegeName(storedCollege.college_name);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collegeCode) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/colleges/${originalCode}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            college_code: collegeCode, 
            college_name: collegeName 
          }),
        }
      );

      if (res.ok) {
        const result = await res.json();
        setMessage(result.message);

        // Update originalCode so future edits work correctly
        setOriginalCode(collegeCode);
        // Update localStorage to match the edited college
        localStorage.setItem(
          "selectedCollege",
          JSON.stringify({ college_code: collegeCode, college_name: collegeName })
        );
      } else {
        setMessage("❌ Failed to update college.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Could not connect to backend.");
    }
  };

  return (
    <div className="row information-frame">
      <Sidebar type="college" />

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Update College</h2>

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
                value={collegeCode}
                onChange={(e) => setCollegeCode(e.target.value)}
                required
              />
            </div>

            {/* College Name */}
            <div className="mb-3">
              <label className="form-label">College Name</label>
              <input
                type="text"
                className="form-control"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-warning">
                ✏ Update College
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

export default UpdateCollege;
