import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const UpdateProgram = () => {
  const navigate = useNavigate();
  const [programCode, setProgramCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [programName, setProgramName] = useState("");
  const [college, setCollege] = useState("");
  const [colleges, setColleges] = useState([]);
  const [message, setMessage] = useState("");
  const hasChecked = useRef(false); 

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    
    const storedProgram = localStorage.getItem("selectedProgram");
    
    if (!storedProgram) {
      alert("⚠️ Please select a program from the table first!");
      navigate("/manage-program", { replace: true });
      return;
    }

    try {
      const program = JSON.parse(storedProgram);
      setProgramCode(program.code);
      setOriginalCode(program.code);
      setProgramName(program.name);
      setCollege(program.college);
    } catch (error) {
      console.error("Error parsing program data:", error);
      alert("⚠️ Invalid program data. Please select a program again.");
      navigate("/manage-program", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/colleges")
      .then((res) => res.json())
      .then((data) => setColleges(data))
      .catch((err) => console.error("Error fetching colleges:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programCode) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/programs/${originalCode}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            program_code: programCode,
            program_name: programName,
            college: college,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        localStorage.removeItem("selectedProgram");
        alert("✅ Program updated successfully!");
        navigate("/manage-program");
      } else {
        setMessage(result.message || "❌ Failed to update program.");
      }
    } catch (error) {
      console.error(error);
      setMessage("⚠️ Could not connect to backend.");
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("selectedProgram");
    navigate("/manage-program");
  };

  return (
    <div className="row information-frame">
      <Sidebar type="program" />

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Update Program</h2>

        <div className="card p-4 bg-transparent text-light shadow-lg">
          <h5>Program Information</h5>
          <hr />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Program Code</label>
              <input
                type="text"
                className="form-control"
                value={programCode}
                onChange={(e) => setProgramCode(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Program Name</label>
              <input
                type="text"
                className="form-control"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">College</label>
              <select
                className="form-select"
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
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-warning">
                ✏ Update Program
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

export default UpdateProgram;