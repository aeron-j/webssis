import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";

const UpdateCollege = () => {
  const [collegeCode, setCollegeCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedCollege = JSON.parse(localStorage.getItem("selectedCollege"));
    if (!storedCollege) {
      alert("⚠️ No college selected!");
      navigate("/manage-college");
      return;
    }
    setCollegeCode(storedCollege.college_code);
    setOriginalCode(storedCollege.college_code);
    setCollegeName(storedCollege.college_name);
  }, [navigate]);

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
            college_code: collegeCode.toUpperCase(), 
            college_name: collegeName 
          }),
        }
      );
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem("collegeMessage", result.message);
        navigate("/manage-college");
      } else {
        setMessage(result.message || "❌ Failed to update college.");
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
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>

            {/* Buttons: Cancel and Update College */}
            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate("/manage-college")}
              >
                Cancel
              </button>

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