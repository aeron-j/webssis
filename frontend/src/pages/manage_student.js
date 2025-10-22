import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const ManageStudent = () => {
  const [students, setStudents] = useState([]);
  //eslint-disable-next-line no-unused-vars
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Show success message after add/update
  useEffect(() => {
    const msg = localStorage.getItem("studentMessage");
    if (msg) {
      alert(msg);
      localStorage.removeItem("studentMessage");
    }
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Fetch students
  const fetchStudents = () => {
    fetch("http://127.0.0.1:5000/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch programs
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/programs")
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);

  const handleRowClick = (student) => {
    if (selectedStudentId === student.id) {
      setSelectedStudentId(null);
      localStorage.removeItem("selectedStudent");
    } else {
      setSelectedStudentId(student.id);
      localStorage.setItem(
        "selectedStudent",
        JSON.stringify({
          id: student.id,
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          gender: student.gender,
          college: student.college, // must match college_code
          course: student.course    // must match program code
        })
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedStudentId) {
      alert("⚠️ Please select a student to delete!");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this student?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/students/${selectedStudentId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        alert("Student deleted successfully!");
        setSelectedStudentId(null);
        fetchStudents();
      } else {
        alert("Failed to delete student.");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Could not connect to backend.");
    }
  };

  // Filtering
  const filteredStudents = students
    .filter((student) => {
      if (!searchTerm) return true;
      const search = searchTerm.toUpperCase();
      return (
        student.student_id.toUpperCase().includes(search) ||
        student.first_name.toUpperCase().includes(search) ||
        student.last_name.toUpperCase().includes(search) ||
        student.gender.toUpperCase().includes(search) ||
        student.year_level.toString().toUpperCase().includes(search) ||
        student.course.toUpperCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === "student_id") return a.student_id.localeCompare(b.student_id);
      if (sortBy === "first_name") return a.first_name.localeCompare(b.first_name);
      if (sortBy === "last_name") return a.last_name.localeCompare(b.last_name);
      return 0;
    });

  // Pagination
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
    <div className="row information-frame">
      <Sidebar type="student" onDelete={handleDelete} studentCount={students.length} />

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Student Database</h2>

        {/* Search + Sort */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search Student..."
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

        {/* Table */}
        <div className="table-responsive mb-5 table-wrapper">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Gender</th>
                <th>Year Level</th>
                <th>Course</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => handleRowClick(student)}
                    className={selectedStudentId === student.id ? "table-primary" : ""}
                    style={{ cursor: "pointer" }}
                  >
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
                  <td colSpan="6" className="text-center text-muted">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4 mb-2">
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
  );
};

export default ManageStudent;
