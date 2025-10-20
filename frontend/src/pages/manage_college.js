import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

const ManageCollege = () => {
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(null);

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
    .filter((college) =>
      college.college_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "code") return a.college_code.localeCompare(b.college_code);
      if (sortBy === "name") return a.college_name.localeCompare(b.college_name);
      return 0;
    });

  // Highlight row and store selected college in localStorage
  const handleRowClick = (college) => {
    setSelectedCollegeCode((prev) =>
      prev === college.college_code ? null : college.college_code
    );
    localStorage.setItem("selectedCollege", JSON.stringify(college));
  };

  // Delete triggered by Sidebar button
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
    <div className="row vh-100">
      <Sidebar type="college" onDelete={handleDelete} />

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Manage College</h2>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            className="form-control w-50"
            placeholder="🔍 Search College..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="form-select w-25"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="code">College Code</option>
            <option value="name">College Name</option>
          </select>
        </div>

        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>College Code</th>
              <th>College Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredColleges.length > 0 ? (
              filteredColleges.map((college, index) => (
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
                  <td>{college.college_code}</td>
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
      </div>
    </div>
  );
};

export default ManageCollege;
