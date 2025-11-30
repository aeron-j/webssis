import React, { useState, useEffect, useRef } from "react";
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
  const [yearLevel, setYearLevel] = useState("");
  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState(null);
  const hasChecked = useRef(false);
  const navigate = useNavigate();

  // Year level options
  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5+ Year"];

  // Check if student is selected on mount
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const storedStudent = localStorage.getItem("selectedStudent");
    
    if (!storedStudent) {
      alert("⚠️ Please select a student from the table first!");
      navigate("/manage-student", { replace: true });
      return;
    }

    try {
      const student = JSON.parse(storedStudent);
      setStudentId(student.student_id);
      setOriginalId(student.id); 
      setFirstName(student.first_name);
      setLastName(student.last_name);
      setGender(student.gender);
      setYearLevel(student.year_level || "");
      setCollege(student.college || "");
      setProgram(student.course || "");
      setExistingAvatarUrl(student.avatar_url || null);
      setAvatarPreview(student.avatar_url || null);
    } catch (error) {
      console.error("Error parsing student data:", error);
      alert("⚠️ Invalid student data. Please select a student again.");
      navigate("/manage-student", { replace: true });
    }
  }, [navigate]);

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("❌ Please upload a valid image file (PNG, JPG, GIF, WEBP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Image size must be less than 5MB");
        return;
      }

      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalId) {
      setMessage("⚠️ No student selected for update.");
      return;
    }

    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("gender", gender);
    formData.append("year_level", yearLevel);
    formData.append("course", program);
    formData.append("college", college);
    
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/students/${originalId}`, 
        {
          method: "PUT",
          body: formData,
        }
      );

      if (res.ok) {
        const result = await res.json();
        setMessage(result.message);
        localStorage.removeItem("selectedStudent");
        
        setTimeout(() => {
          navigate("/manage-student");
        }, 1500);
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || "❌ Failed to update student.");
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
            {/* Avatar Upload */}
            <div className="text-center mb-4">
              <div className="mb-3">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="rounded-circle"
                    style={{ width: "150px", height: "150px", objectFit: "cover", border: "3px solid #dee2e6" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: "150px", height: "150px", border: "3px solid #dee2e6" }}
                  >
                    <i className="bi bi-person-fill text-white" style={{ fontSize: "80px" }}></i>
                  </div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="btn btn-outline-warning btn-sm">
                📷 Change Photo
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <small className="d-block text-muted mt-2">Max size: 5MB (PNG, JPG, GIF, WEBP)</small>
            </div>

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
                <label className="form-label">Year Level</label>
                <select
                  className="form-select"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  required
                >
                  <option value="" disabled hidden>
                    Select year level...
                  </option>
                  {yearLevels.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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