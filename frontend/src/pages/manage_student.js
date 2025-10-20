import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

const ManageStudent = () => {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]); // To display program names
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Fetch students
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  // Fetch programs
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/programs")
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.error("Error fetching programs:", err));
  }, []);

  // Get program name from code
  const getProgramName = (code) => {
    const program = programs.find((p) => p.code === code);
    return program ? program.name : code;
  };

  const handleRowClick = (id) => {
    setSelectedStudentId((prev) => (prev === id ? null : id));
  };

  const filteredStudents = students
    .filter((student) => {
      if (!searchTerm) return true;
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    })
    .filter((student) => {
      if (!filterBy) return true;
      if (filterBy === "gender") return student.gender;
      if (filterBy === "year_level") return student.year_level;
      if (filterBy === "course") return student.course;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "student_id") return a.student_id.localeCompare(b.student_id);
      if (sortBy === "first_name") return a.first_name.localeCompare(b.first_name);
      if (sortBy === "last_name") return a.last_name.localeCompare(b.last_name);
      return 0;
    });

  return (
    <div className="row vh-100">
      <Sidebar type="student" />

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Student Database</h2>

        {/* Search + Filter + Sort */}
        <div className="d-flex mb-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search Student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter dropdown */}
          <select
            className="form-select me-2"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="" disabled hidden>
              Filter By
            </option>
            <option value="gender">Gender</option>
            <option value="year_level">Year Level</option>
            <option value="course">Course</option>
          </select>

          {/* Sort dropdown */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => handleRowClick(student.id)}
                  className={selectedStudentId === student.id ? "table-primary" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <td>{student.student_id}</td>
                  <td>{student.first_name}</td>
                  <td>{student.last_name}</td>
                  <td>{student.gender}</td>
                  <td>{student.year_level}</td>
                  <td>{student.course}</td> {/* display program code */}
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

        {/* Pagination */}
        <div className="d-flex mt-2 justify-content-center">
          <ul className="pagination">
            <li className="page-item disabled">
              <a className="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li className="page-item active">
              <a className="page-link" href="#">1</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">2</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageStudent;
