import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

const ManageStudent = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
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

  // Handle column sorting
  const handleSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <i className="bi bi-arrow-down-up ms-2" style={{fontSize: "0.8rem"}}></i>;
    }
    
    if (sortConfig.direction === 'asc') {
      return <i className="bi bi-arrow-up ms-2" style={{fontSize: "0.8rem"}}></i>;
    } else if (sortConfig.direction === 'desc') {
      return <i className="bi bi-arrow-down ms-2" style={{fontSize: "0.8rem"}}></i>;
    }
    
    return <i className="bi bi-arrow-down-up ms-2" style={{fontSize: "0.8rem"}}></i>;
  };

  const filteredStudents = students
    .filter((student) => {
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
      if (!sortConfig.key || !sortConfig.direction) return 0;
      
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
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

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        pages.push(2, 3, 4);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('...');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

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

          {/* Search */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="input-group w-50">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search Student..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
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
          <div className="table-responsive position-relative table-wrapper" style={{ minHeight: "500px", paddingBottom: "70px" }}>
            <table className="table table-dark table-striped mb-0">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Photo</th>
                  <th 
                    onClick={() => handleSort('student_id')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Student ID {getSortIcon('student_id')}
                  </th>
                  <th 
                    onClick={() => handleSort('first_name')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    First Name {getSortIcon('first_name')}
                  </th>
                  <th 
                    onClick={() => handleSort('last_name')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Last Name {getSortIcon('last_name')}
                  </th>
                  <th 
                    onClick={() => handleSort('gender')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Gender {getSortIcon('gender')}
                  </th>
                  <th 
                    onClick={() => handleSort('year_level')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Year Level {getSortIcon('year_level')}
                  </th>
                  <th 
                    onClick={() => handleSort('course')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Course {getSortIcon('course')}
                  </th>
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
                    <td colSpan="7" className="text-center">
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
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>

                {pageNumbers.map((page, index) => {
                  if (page === '...') {
                    return (
                      <li key={`ellipsis-${index}`} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={page}
                      className={`page-item ${currentPage === page ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => handlePageChange(page)}>
                        {page}
                      </button>
                    </li>
                  );
                })}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                    <i className="bi bi-chevron-right"></i>
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