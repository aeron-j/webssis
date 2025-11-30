import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

const ManageProgram = () => {
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

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
      if (!sortConfig.key || !sortConfig.direction) return 0;
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

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
        <Sidebar type="program" onDelete={handleDelete} programCount={programs.length} />

        <div className="col-10 bg-gradient p-4">
          <h2 className="fw-bold mb-4">Manage Program</h2>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="input-group w-50">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search Program..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="table-responsive position-relative table-wrapper" style={{ minHeight: "500px", paddingBottom: "70px" }}>
            <table className="table table-dark table-striped mb-0">
              <thead>
                <tr>
                  <th 
                    onClick={() => handleSort('code')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Program Code {getSortIcon('code')}
                  </th>
                  <th 
                    onClick={() => handleSort('name')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    Program {getSortIcon('name')}
                  </th>
                  <th 
                    onClick={() => handleSort('college')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    College {getSortIcon('college')}
                  </th>
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
                    <td colSpan="3" className="text-center">No programs found.</td>
                  </tr>
                )}
              </tbody>
            </table>

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

export default ManageProgram;