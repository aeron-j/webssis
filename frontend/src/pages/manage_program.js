import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";

const ManageProgram = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedProgramCode, setSelectedProgramCode] = useState(null);

  // Fetch programs
  const fetchPrograms = () => {
    fetch("http://127.0.0.1:5000/api/programs")
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.error("Error fetching programs:", err));
  };

  useEffect(() => {
    fetchPrograms();
    const handleStorageChange = () => fetchPrograms();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const filteredPrograms = programs
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.code?.toLowerCase().includes(term) ||
        p.name?.toLowerCase().includes(term) ||
        p.college?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === "code") return a.code.localeCompare(b.code);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "college") return a.college.localeCompare(b.college);
      return 0;
    });

  const handleRowClick = (program_code) => {
    setSelectedProgramCode((prev) => (prev === program_code ? null : program_code));
    const selected = programs.find((p) => p.code === program_code);
    if (selected) localStorage.setItem("selectedProgram", JSON.stringify(selected));
  };

  // 🔹 Delete Program
  const handleDelete = async () => {
    if (!selectedProgramCode) {
      alert("Please select a program to delete!");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete program "${selectedProgramCode}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/programs/${selectedProgramCode}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        alert("Program deleted successfully!");
        setSelectedProgramCode(null);
        localStorage.removeItem("selectedProgram");
        fetchPrograms(); // refresh table
      } else {
        alert("Failed to delete program.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to backend.");
    }
  };

  return (
    <div className="row information-frame">
      <Sidebar type="program" onDelete={handleDelete} programCount={programs.length} />

      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Manage Program</h2>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            className="form-control w-50"
            placeholder="🔍 Search Program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select w-25"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="" disabled>Sort By</option>
            <option value="code">Program Code</option>
            <option value="name">Program</option>
            <option value="college">College</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Program Code</th>
                <th>Program</th>
                <th>College</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((program) => (
                  <tr
                    key={program.code}
                    onClick={() => handleRowClick(program.code)}
                    className={selectedProgramCode === program.code ? "table-primary" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{program.code?.toUpperCase()}</td>
                    <td>{program.name}</td>
                    <td>{program.college}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted">No programs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProgram;
