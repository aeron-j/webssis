import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

const ManageCollege = () => {
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/colleges")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched colleges:", data);
        setColleges(data);
      })
      .catch((err) => console.error("Error fetching colleges:", err));
  }, []);

  const filteredColleges = colleges
    .filter((college) =>
      college.college_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "code") return a.college_code.localeCompare(b.college_code);
      if (sortBy === "name") return a.college_name.localeCompare(b.college_name);
      return 0;
    });

  return (
    <div className="row vh-100">
      <Sidebar type="college" />

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
                <tr key={index}>
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
