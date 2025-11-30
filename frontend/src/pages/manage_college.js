import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

const ManageCollege = () => {
  const [colleges, setColleges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedCollegeCode, setSelectedCollegeCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const collegesPerPage = 10;

  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const { isOpen, modalConfig, openModal, closeModal } = useModal();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { "Authorization": `Bearer ${token}` };
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges", {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        if (res.status === 401) {
          addToast("Session expired. Please login again", "error");
          localStorage.clear();
          navigate("/");
          return;
        }
        throw new Error("Failed to fetch colleges");
      }

      const data = await res.json();
      setColleges(data);
    } catch (err) {
      console.error("Error fetching colleges:", err);
      addToast("Failed to load colleges", "error");
    }
  };

  useEffect(() => {
    fetchColleges();
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
      if (!sortConfig.key || !sortConfig.direction) return 0;
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

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
      addToast("Please select a college to delete", "warning");
      return;
    }

    const selectedCollege = colleges.find(c => c.college_code === selectedCollegeCode);

    openModal({
      title: "Delete College?",
      message: `Are you sure you want to delete "${selectedCollege?.college_name}" (${selectedCollegeCode})? This will also delete all programs under this college.`,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:5000/api/colleges/${selectedCollegeCode}`,
            { 
              method: "DELETE",
              headers: getAuthHeaders()
            }
          );

          const result = await res.json();

          if (res.ok) {
            addToast(result.message || "College deleted successfully", "success");
            setColleges((prev) =>
              prev.filter((c) => c.college_code !== selectedCollegeCode)
            );
            setSelectedCollegeCode(null);
            localStorage.removeItem("selectedCollege");
          } else {
            if (res.status === 401) {
              addToast("Session expired. Please login again", "error");
              localStorage.clear();
              navigate("/");
            } else {
              addToast(result.error || "Failed to delete college", "error");
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
        <Sidebar type="college" onDelete={handleDelete} collegeCount={colleges.length}/>

        <div className="col-10 bg-gradient p-4">
          <h2 className="fw-bold mb-4">Manage College</h2>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="input-group w-50">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search College..."
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
                    onClick={() => handleSort('college_code')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    College Code {getSortIcon('college_code')}
                  </th>
                  <th 
                    onClick={() => handleSort('college_name')} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    College Name {getSortIcon('college_name')}
                  </th>
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
                      <td>{college.college_code}</td>
                      <td>{college.college_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">
                      No colleges found.
                    </td>
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

export default ManageCollege;