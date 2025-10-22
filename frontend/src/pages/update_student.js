import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";

function UpdateStudent() {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");
  const [originalId, setOriginalId] = useState(""); // For PUT request
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true); // Wait until data is ready

  // Load colleges and programs first, THEN load student data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch colleges
        const collegesRes = await fetch("http://127.0.0.1:5000/api/colleges");
        const collegesData = await collegesRes.json();
        setColleges(collegesData);

        // Fetch programs
        const programsRes = await fetch("http://127.0.0.1:5000/api/programs");
        const programsData = await programsRes.json();
        setPrograms(programsData);

        // Now load the selected student
        const storedStudent = JSON.parse(localStorage.getItem("selectedStudent"));

        if (!storedStudent) {
          alert("❌ Please select a student to update!");
          navigate("/manage-student");
          return;
        }

        // Set all student data
        setStudentId(storedStudent.student_id);
        setOriginalId(storedStudent.student_id);
        setFirstName(storedStudent.first_name);
        setLastName(storedStudent.last_name);
        setGender(storedStudent.gender);
        setCollege(storedStudent.college || "");
        setProgram(storedStudent.course || "");

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        alert("Failed to load data");
        navigate("/manage-student");
      }
    };

    loadData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      student_id: studentId,
      first_name: firstName,
      last_name: lastName,
      gender,
      year_level: "1st Year",
      course: program,
      college: college,
    };

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/students/${originalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        alert(result.message);
        localStorage.removeItem("selectedStudent");
        navigate("/manage-student");
      } else {
        alert("❌ Failed to update student. Check backend logs.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Could not connect to backend.");
    }
  };

  if (loading) {
    return (
      <div className="row information-frame">
        <Sidebar type="student" />
        <div className="col-10 p-4">
          <h2 className="fw-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="row information-frame">
      <Sidebar type="student" />

      <div className="col-10 p-4">
        <h2 className="fw-bold mb-4">Update Student</h2>

        <div className="card shadow-lg p-4">
          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <h5 className="fw-bold">Personal Information</h5>
            <hr />
            <div className="mb-3">
              <label className="form-label">Student ID</label>
              <input
                type="text"
                className="form-control"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label d-block">Gender</label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={gender === "Male"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <label className="form-check-label">Male</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={gender === "Female"}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <label className="form-check-label">Female</label>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <h5 className="fw-bold mt-4">Academic Information</h5>
            <hr />
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">College</label>
                <select
                  className="form-select"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Choose college...
                  </option>
                  {colleges.map((c) => (
                    <option key={c.college_code} value={c.college_code}>
                      {c.college_code} - {c.college_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Program</label>
                <select
                  className="form-select"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Choose program...
                  </option>
                  {programs
                    .filter((p) => p.college === college)
                    .map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="text-end mt-4">
              <button type="submit" className="btn btn-warning">
                ✏ Update Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateStudent;