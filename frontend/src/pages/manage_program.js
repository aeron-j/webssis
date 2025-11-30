import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

const ManageProgram = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [selectedProgramCode, setSelectedProgramCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const programsPerPage = 10;

  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const { isOpen, modalConfig, openModal, closeModal } = useModal();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { "Authorization": `Bearer ${token}` };
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/programs", {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        if (res.status === 401) {
          addToast("Session expired. Please login again", "error");
          localStorage.clear();
          navigate("/");
          return;
        }
        throw new Error("Failed to fetch programs");
      }

      const data = await res.json();
      setPrograms(data);
    } catch (err) {
      console.error("Error fetching programs:", err);
      addToast("Failed to load programs", "error");
    }
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

  // Pagination logic
  const totalPages = Math.ceil(filteredPrograms.length / programsPerPage);
  const indexOfLastProgram = currentPage * programsPerPage;
  const indexOfFirstProgram = indexOfLastProgram - programsPerPage;
  const currentPrograms = filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRowClick = (program_code) => {
    setSelectedProgramCode((prev) => (prev === program_code ? null : program_code));
    const selected = programs.find((p) => p.code === program_code);
    if (selected) localStorage.setItem("selectedProgram", JSON.stringify(selected));
  };

  const handleDelete = async () => {
    if (!selectedProgramCode) {
      addToast("Please select a program to delete", "warning");
      return;
    }

    const selectedProgram = programs.find(p => p.code === selectedProgramCode);

    openModal({
      title: "Delete Program?",
      message: `Are you sure you want to delete "${selectedProgram?.name}" (${selectedProgramCode})? This will affect all students enrolled in this program.`,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:5000/api/programs/${selectedProgramCode}`,
            { 
              method: "DELETE",
              headers: getAuthHeaders()
            }
          );

          const result = await res.json();

          if (res.ok) {
            addToast(result.message || "Program deleted successfully", "success");
            setSelectedProgramCode(null);
            localStorage.removeItem("selectedProgram");
            fetchPrograms(); 
          } else {
            if (res.status === 401) {
              addToast("Session expired. Please login again", "error");
              localStorage.clear();
              navigate("/");
            } else {
              addToast(result.error || "Failed to delete program", "error");
            }
          }
        } catch (error) {
          console.error(error);
          addToast("Could not connect to server", "error");
        }
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
              <option value="" disabled hidden>Sort By</option>
              <option value="code">Program Code</option>
              <option value="name">Program</option>
              <option value="college">College</option>
            </select>
          </div>

          <div className="table-responsive position-relative table-wrapper" style={{ minHeight: "500px" }}>
            <table className="table table-dark table-striped mb-0">
              <thead>
                <tr>
                  <th>Program Code</th>
                  <th>Program</th>
                  <th>College</th>
                </tr>
              </thead>
              <tbody style={{ minHeight: "400px" }}>
                {currentPrograms.length > 0 ? (
                  currentPrograms.map((program) => (
                    <tr
                      key={program.code}
                      onClick={() => handleRowClick(program.code)}
                      className={selectedProgramCode === program.code ? "table-primary" : ""}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{program.code}</td>
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
    </>
  );
};

export default ManageProgram;