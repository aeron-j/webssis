import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const AddProgram = () => {
  const navigate = useNavigate();
  const [programCode, setProgramCode] = useState("");
  const [programName, setProgramName] = useState("");
  const [college, setCollege] = useState("");
  const [colleges, setColleges] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/colleges")
      .then((res) => res.json())
      .then((data) => setColleges(data))
      .catch((err) => console.error("Error fetching colleges:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programCode || !programName || !college) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_code: programCode,
          program_name: programName,
          college: college,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setProgramCode("");
        setProgramName("");
        setCollege("");
        setTimeout(() => navigate("/manage-program"), 1000);
      } else {
        setMessage(data.message || "❌ Failed to add program.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Could not connect to backend.");
    }
  };

  return (
    <div className="row information-frame">
      <Sidebar type="program" />

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Add Program</h2>

        <div className="card p-4 bg-transparent text-light">
          <h5>Program Information</h5>
          <hr />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="program_code" className="form-label">
                Program Code
              </label>
              <input
                type="text"
                className="form-control"
                id="program_code"
                value={programCode}
                onChange={(e) => setProgramCode(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="program_name" className="form-label">
                Program Name
              </label>
              <input
                type="text"
                className="form-control"
                id="program_name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="college" className="form-label">
                College
              </label>
              <select
                className="form-select"
                id="college"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                required
              >
                <option value="" disabled hidden>Select College</option>
                {colleges.map((c) => (
                  <option key={c.college_code} value={c.college_code}>
                    {c.college_code} - {c.college_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-end">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate("/manage-program")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                + Add Program
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

export default AddProgram;
