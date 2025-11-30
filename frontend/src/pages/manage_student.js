import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

const ManageStudent = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const studentsPerPage = 10;
  
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const { isOpen, modalConfig, openModal, closeModal } = useModal();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { "Authorization": `Bearer ${token}` };
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/students", {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        if (res.status === 401) {
          addToast("Session expired. Please login again", "error");
          localStorage.clear();
          navigate("/");
          return;
        }
        throw new Error("Failed to fetch students");
      }

      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
      addToast("Failed to load students", "error");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRowClick = (student) => {
    if (selectedStudentId === student.id) {
      setSelectedStudentId(null);
      setSelectedStudentDetails(null);
      localStorage.removeItem("selectedStudent");
    } else {
      setSelectedStudentId(student.id);
      setSelectedStudentDetails(student);
      localStorage.setItem(
        "selectedStudent",
        JSON.stringify({
          id: student.id,
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          gender: student.gender,
          year_level: student.year_level,
          college: student.college,
          course: student.course,
          avatar_url: student.avatar_url,
        })
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedStudentId) {
      addToast("Please select a student to delete", "warning");
      return;
    }

    openModal({
      title: "Delete Student?",
      message: `Are you sure you want to delete ${selectedStudentDetails?.first_name} ${selectedStudentDetails?.last_name}? This action cannot be undone and will also remove their profile photo.`,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:5000/api/students/${selectedStudentId}`,
            { 
              method: "DELETE",
              headers: getAuthHeaders()
            }
          );

          const result = await res.json();

          if (res.ok) {
            addToast(result.message || "Student deleted successfully", "success");
            setSelectedStudentId(null);
            setSelectedStudentDetails(null);
            localStorage.removeItem("selectedStudent");
            fetchStudents();
          } else {
            if (res.status === 401) {
              addToast("Session expired. Please login again", "error");
              localStorage.clear();
              navigate("/");
            } else {
              addToast(result.error || "Failed to delete student", "error");
            }
          }
        } catch (err) {
          console.error(err);
          addToast("Could not connect to server", "error");
        }
      }
    });
  };

  const filteredStudents = students.filter((student) => {
    if (!searchTerm) return true;
    const search = searchTerm.toUpperCase();
    return (
      (student.student_id || "").toUpperCase().includes(search) ||
      (student.first_name || "").toUpperCase().includes(search) ||
      (student.last_name || "").toUpperCase().includes(search) ||
      (student.gender || "").toUpperCase().includes(search) ||
      (student.year_level
        ? student.year_level.toString().toUpperCase().includes(search)
        : false) ||
      (student.course || "").toUpperCase().includes(search)
    );
  })
  .sort((a, b) => {
    if (sortBy === "student_id") return a.student_id.localeCompare(b.student_id);
    if (sortBy === "first_name") return a.first_name.localeCompare(b.first_name);
    if (sortBy === "last_name") return a.last_name.localeCompare(b.last_name);
    return 0;
  });

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
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

      <div className="row information-frame">
        <Sidebar type="student" onDelete={handleDelete} studentCount={students.length} />

        <div className="col-10 bg-gradient p-4">
          <h2 className="fw-bold mb-4">Student Database</h2>

          {/* Search + Sort */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              className="form-control w-50"
              placeholder="🔍 Search Student..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="form-select w-25"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="" disabled hidden>
                Sort By
              </option>
              <option value="student_id">Student ID</option>
              <option value="first_name">First Name</option>
              <option value="last_name">Last Name</option>
            </select>
          </div>

          {/* Student Details Card - Show when a student is selected */}
          {selectedStudentDetails && (
            <div className="card mb-3 shadow-sm">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-auto">
                    {selectedStudentDetails.avatar_url ? (
                      <img
                        src={selectedStudentDetails.avatar_url}
                        alt={`${selectedStudentDetails.first_name} ${selectedStudentDetails.last_name}`}
                        className="rounded-circle"
                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                        style={{ width: "80px", height: "80px" }}
                      >
                        <i className="bi bi-person-fill text-white" style={{ fontSize: "40px" }}></i>
                      </div>
                    )}
                  </div>
                  <div className="col">
                    <h5 className="mb-1">
                      {selectedStudentDetails.first_name.toUpperCase()} {selectedStudentDetails.last_name.toUpperCase()}
                    </h5>
                    <p className="mb-1">
                      <strong>Student ID:</strong> {selectedStudentDetails.student_id}
                    </p>
                    <p className="mb-1">
                      <strong>Gender:</strong> {selectedStudentDetails.gender} | 
                      <strong> Year Level:</strong> {selectedStudentDetails.year_level} | 
                      <strong> Course:</strong> {selectedStudentDetails.course?.toUpperCase() || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="table-responsive position-relative table-wrapper" style={{ minHeight: "500px" }}>
            <table className="table table-dark table-striped mb-0">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Photo</th>
                  <th>Student ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Gender</th>
                  <th>Year Level</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody style={{ minHeight: "400px" }}>
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => handleRowClick(student)}
                      className={selectedStudentId === student.id ? "table-primary" : ""}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt={student.first_name}
                            className="rounded-circle"
                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <i className="bi bi-person-fill text-white" style={{ fontSize: "20px" }}></i>
                          </div>
                        )}
                      </td>
                      <td>{student.student_id}</td>
                      <td>{student.first_name.toUpperCase()}</td>
                      <td>{student.last_name.toUpperCase()}</td>
                      <td>{student.gender}</td>
                      <td>{student.year_level}</td>
                      <td>{student.course ? student.course.toUpperCase() : ""}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination inside table frame */}
            <div
              className="d-flex justify-content-center align-items-center py-3 bg-transparent position-absolute w-100"
              style={{ bottom: 0, left: 0 }}
            >
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                    &laquo;
                  </button>
                </li>

                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                      {index + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                    &raquo;
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageStudent;