import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const ManageCollege = () => {
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const collegesPerPage = 10;

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges");
      const data = await res.json();
      setColleges(data);
    } catch (err) {
      console.error("Error fetching colleges:", err);
    }
  };

  const filteredColleges = colleges
    .filter((college) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        college.college_name?.toLowerCase().includes(search) ||
        college.college_code?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === "code") return a.college_code.localeCompare(b.college_code);
      if (sortBy === "name") return a.college_name.localeCompare(b.college_name);
      return 0;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredColleges.length / collegesPerPage);
  const indexOfLastCollege = currentPage * collegesPerPage;
  const indexOfFirstCollege = indexOfLastCollege - collegesPerPage;
  const currentColleges = filteredColleges.slice(indexOfFirstCollege, indexOfLastCollege);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRowClick = (college) => {
    setSelectedCollegeCode((prev) =>
      prev === college.college_code ? null : college.college_code
    );
    localStorage.setItem("selectedCollege", JSON.stringify(college));
  };

  const handleDelete = async () => {
    if (!selectedCollegeCode) {
      alert("Please select a college first!");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this college?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/colleges/${selectedCollegeCode}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setColleges((prev) =>
          prev.filter((c) => c.college_code !== selectedCollegeCode)
        );
        setSelectedCollegeCode(null);
        localStorage.removeItem("selectedCollege");
        alert("College deleted successfully!");
      } else {
        alert("Failed to delete college.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to backend.");
    }
  };

  return (
    <div className="row information-frame">
      <Sidebar type="college" onDelete={handleDelete} collegeCount={colleges.length}/>

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Manage College</h2>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            className="form-control w-50"
            placeholder="🔍 Search College..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />

          <select
            className="form-select w-25"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1); // Reset to first page on sort
            }}
          >
            <option value="" disabled hidden>
              Sort By
            </option>
            <option value="code">College Code</option>
            <option value="name">College Name</option>
          </select>
        </div>
        
        <div className="table-responsive position-relative table-wrapper" style={{ minHeight: "500px" }}>
          <table className="table table-dark table-striped mb-0">
            <thead>
              <tr>
                <th>College Code</th>
                <th>College Name</th>
              </tr>
            </thead>
            <tbody style={{ minHeight: "400px" }}>
              {currentColleges.length > 0 ? (
                currentColleges.map((college, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(college)}
                    className={
                      selectedCollegeCode === college.college_code
                        ? "table-primary"
                        : ""
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td>{college.college_code?.toUpperCase()}</td>
                    <td>{college.college_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center text-muted">
                    No colleges found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
  );
};

export default ManageCollege;