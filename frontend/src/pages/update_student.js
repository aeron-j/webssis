import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/add_student.css"; 
import { useNavigate } from "react-router-dom";

function UpdateStudent() {
  const [studentId, setStudentId] = useState("");
  const [originalId, setOriginalId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/colleges")
      .then((res) => res.json())
      .then((data) => setColleges(data))
      .catch((err) => console.error("Error fetching colleges:", err));

    fetch("http://127.0.0.1:5000/api/programs")
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);


  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem("selectedStudent"));
    if (storedStudent) {
      setStudentId(storedStudent.student_id);
      setOriginalId(storedStudent.id); 
      setFirstName(storedStudent.first_name);
      setLastName(storedStudent.last_name);
      setGender(storedStudent.gender);
      setCollege(storedStudent.college || "");
      setProgram(storedStudent.course || "");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalId) {
      setMessage("⚠️ No student selected for update.");
      return;
    }

    const payload = {
      student_id: studentId,
      first_name: firstName,
      last_name: lastName,
      gender: gender,
      year_level: "1st Year",
      course: program,
      college: college,
    };

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/students/${originalId}`, 
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const result = await res.json();
        setMessage(result.message);
        localStorage.removeItem("selectedStudent");
        navigate("/manage-student");
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || "❌ Failed to add student. Check backend logs.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Could not connect to backend.");
    }
  };

  
  const handleCancel = () => {
    localStorage.removeItem("selectedStudent");
    navigate("/manage-student");
  };

  return (
    <div className="row vh-row information-frame">
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
                placeholder="YYYY-NNNN (e.g., 2025-0001)"
                value={studentId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[0-9-]*$/.test(value) && value.length <= 9) {
                    setStudentId(value);
                  }
                }}
                onBlur={() => {
                  if (studentId && !/^\d{4}-\d{4}$/.test(studentId)) {
                    alert("❌ Invalid format! Use YYYY-NNNN (numbers only).");
                    setStudentId("");
                  }
                }}
                required
              />
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter first name"
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
                  placeholder="Enter last name"
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
                    required
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
                  onChange={(e) => {
                    setCollege(e.target.value);
                    setProgram("");
                  }}
                  required
                >
                  <option value="" disabled hidden>
                    Select college...
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
                  <option value="" disabled hidden>
                    Select program...
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

            {/*  Buttons */}
            <div className="text-end mt-4">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-warning">
                ✏ Update Student
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
}

export default UpdateStudent;
