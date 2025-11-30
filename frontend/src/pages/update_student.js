import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/add_student.css"; 
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasChecked = useRef(false);
  const navigate = useNavigate();

  const { toasts, addToast, removeToast } = useToast();
  const { isOpen, modalConfig, openModal, closeModal } = useModal();

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5+ Year"];

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { "Authorization": `Bearer ${token}` };
  };

  // Check if student is selected on mount
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const storedStudent = localStorage.getItem("selectedStudent");
    
    if (!storedStudent) {
      addToast("Please select a student from the table first", "warning");
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
      addToast("Invalid student data. Please select again", "error");
      navigate("/manage-student", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collegesRes, programsRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/api/colleges", { 
            headers: getAuthHeaders() 
          }),
          fetch("http://127.0.0.1:5000/api/programs", { 
            headers: getAuthHeaders() 
          })
        ]);

        if (!collegesRes.ok || !programsRes.ok) {
          if (collegesRes.status === 401 || programsRes.status === 401) {
            addToast("Session expired. Please login again", "error");
            localStorage.clear();
            navigate("/");
            return;
          }
          throw new Error("Failed to fetch data");
        }

        const [collegesData, programsData] = await Promise.all([
          collegesRes.json(),
          programsRes.json()
        ]);

        setColleges(collegesData);
        setPrograms(programsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        addToast("Failed to load colleges and programs", "error");
      }
    };

    fetchData();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addToast("Please upload a valid image file (PNG, JPG, GIF, WEBP)", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size must be less than 5MB", "error");
      return;
    }

    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    addToast("New photo selected", "success", 2000);
  };

  const handleRemoveAvatar = async () => {
    openModal({
      title: "Remove Profile Photo?",
      message: "Are you sure you want to remove this student's profile photo? This action cannot be undone.",
      confirmText: "Yes, Remove",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch(
            `http://127.0.0.1:5000/api/students/${originalId}/remove-avatar`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`
              }
            }
          );

          const result = await res.json();

          if (res.ok) {
            setAvatarPreview(null);
            setExistingAvatarUrl(null);
            setAvatarFile(null);
            addToast(result.message || "Avatar removed successfully", "success");
          } else {
            if (res.status === 401) {
              addToast("Session expired. Please login again", "error");
              localStorage.clear();
              navigate("/");
            } else {
              addToast(result.error || "Failed to remove avatar", "error");
            }
          }
        } catch (err) {
          console.error(err);
          addToast("Could not connect to server", "error");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalId) {
      addToast("No student selected for update", "error");
      return;
    }

    setIsSubmitting(true);

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
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://127.0.0.1:5000/api/students/${originalId}`, 
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (res.ok) {
        addToast(result.message || "Student updated successfully", "success");
        localStorage.removeItem("selectedStudent");
        
        setTimeout(() => {
          navigate("/manage-student");
        }, 1500);
      } else {
        if (res.status === 401) {
          addToast("Session expired. Please login again", "error");
          localStorage.clear();
          navigate("/");
        } else {
          addToast(result.error || "Failed to update student", "error");
        }
      }
    } catch (err) {
      console.error(err);
      addToast("Could not connect to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    openModal({
      title: "Discard Changes?",
      message: "Are you sure you want to cancel? All unsaved changes will be lost.",
      confirmText: "Yes, Discard",
      cancelText: "No, Keep Editing",
      type: "warning",
      onConfirm: () => {
        localStorage.removeItem("selectedStudent");
        navigate("/manage-student");
      }
    });
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
      />
      
      <div className="row vh-row information-frame">
        <Sidebar type="student" />

        <div className="col-10 p-4">
          <h2 className="fw-bold mb-4">Update Student</h2>

          <div className="card shadow-lg p-4">
            <form onSubmit={handleSubmit}>
              {/* Avatar Upload/Remove */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar Preview"
                      className="rounded-circle"
                      style={{ 
                        width: "150px", 
                        height: "150px", 
                        objectFit: "cover", 
                        border: "3px solid #dee2e6" 
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
                      style={{ 
                        width: "150px", 
                        height: "150px", 
                        border: "3px solid #dee2e6" 
                      }}
                    >
                      <i className="bi bi-person-fill text-white" style={{ fontSize: "80px" }}></i>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="avatar-upload" className="btn btn-outline-warning btn-sm me-2">
                    📷 Change Photo
                  </label>
                  {(avatarPreview || existingAvatarUrl) && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleRemoveAvatar}
                      disabled={isSubmitting}
                    >
                      🗑️ Remove Photo
                    </button>
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                  disabled={isSubmitting}
                />
                <small className="d-block text-muted mt-2">
                  Max size: 5MB (PNG, JPG, GIF, WEBP)
                </small>
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
                      addToast("Invalid format! Use YYYY-NNNN (numbers only)", "warning");
                    }
                  }}
                  required
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting || !college}
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

              {/* Buttons */}
              <div className="text-end mt-4">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-warning"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    "✏ Update Student"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpdateStudent;