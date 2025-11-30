import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Modal, { useModal } from "./Modal";

const Sidebar = ({ type, onDelete, studentCount, collegeCount, programCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, modalConfig, openModal, closeModal } = useModal();

  const handleLogout = () => {
    openModal({
      title: "Logout?",
      message: "Are you sure you want to logout? You will need to login again to access the system.",
      confirmText: "Yes, Logout",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: () => {
        // Clear all localStorage data
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("authToken");
        localStorage.removeItem("selectedStudent");
        localStorage.removeItem("selectedCollege");
        localStorage.removeItem("selectedProgram");
        
        // Redirect to login
        navigate("/", { replace: true });
      }
    });
  };

  // Helper function to check if current path matches
  const isActive = (path) => location.pathname === path;

  const renderLinks = () => {
    if (type === "student") {
      return (
        <>
          <p className="text-light">Student Operations</p>
          <Link
            to="/add-student"
            className={`btn w-100 mb-2 ${isActive("/add-student") ? "btn-success" : "btn-outline-success"}`}
          >
            <i className="bi bi-plus-circle me-2"></i>Add Student
          </Link>
          <Link
            to="/update-student"
            className={`btn w-100 mb-2 ${isActive("/update-student") ? "btn-warning" : "btn-outline-warning"}`}
          >
            <i className="bi bi-pencil-square me-2"></i>Update Student
          </Link>
          <button
            className="btn btn-danger w-100 mb-4"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            <i className="bi bi-trash3 me-2"></i>Delete Student
          </button>
        </>
      );
    } else if (type === "college") {
      return (
        <>
          <p className="text-light">College Operations</p>
          <Link
            to="/add-college"
            className={`btn w-100 mb-2 ${isActive("/add-college") ? "btn-success" : "btn-outline-success"}`}
          >
            <i className="bi bi-plus-circle me-2"></i>Add College
          </Link>
          <Link
            to="/update-college"
            className={`btn w-100 mb-2 ${isActive("/update-college") ? "btn-warning" : "btn-outline-warning"}`}
          >
            <i className="bi bi-pencil-square me-2"></i>Update College
          </Link>
          <button
            className="btn btn-danger w-100 mb-4"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            <i className="bi bi-trash3 me-2"></i>Delete College
          </button>
        </>
      );
    } else if (type === "program") {
      return (
        <>
          <p className="text-light">Program Operations</p>
          <Link
            to="/add-program"
            className={`btn w-100 mb-2 ${isActive("/add-program") ? "btn-success" : "btn-outline-success"}`}
          >
            <i className="bi bi-plus-circle me-2"></i>Add Program
          </Link>
          <Link
            to="/update-program"
            className={`btn w-100 mb-2 ${isActive("/update-program") ? "btn-warning" : "btn-outline-warning"}`}
          >
            <i className="bi bi-pencil-square me-2"></i>Update Program
          </Link>
          <button
            className="btn btn-danger w-100 mb-4"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            <i className="bi bi-trash3 me-2"></i>Delete Program
          </button>
        </>
      );
    }
  };

  return (
    <>
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

      <div className="col-2 bg-dark p-4">
        {/* Sidebar Title */}
        <h4 className="text-center text-light mb-4">
          <i className="bi bi-mortarboard-fill me-2"></i>
          Student System
        </h4>

        {/* Section Links */}
        {renderLinks()}

        {/* Common Navigation */}
        <p className="text-light mt-4">Academic Setup</p>
        <Link
          to="/manage-student"
          className={`btn w-100 mb-2 ${isActive("/manage-student") ? "btn-success" : "btn-outline-success"}`}
        >
          <i className="bi bi-people-fill me-2"></i>Manage Student
        </Link>
        <Link
          to="/manage-college"
          className={`btn w-100 mb-2 ${isActive("/manage-college") ? "btn-success" : "btn-outline-success"}`}
        >
          <i className="bi bi-building me-2"></i>Manage College
        </Link>
        <Link
          to="/manage-program"
          className={`btn w-100 mb-2 ${isActive("/manage-program") ? "btn-success" : "btn-outline-success"}`}
        >
          <i className="bi bi-book-half me-2"></i>Manage Program
        </Link>

        
        
        {/* Total Students Card */}
        {type === "student" && studentCount !== undefined && (
          <div className="card text-white bg-info mx-auto" style={{
             maxWidth: "10rem",
             maxHeight: "7rem",
            textAlign: "center",
            marginTop: "20px" 
           }}>
            <div className="card-body">
              <p className="card-text fs-3" style={{ fontSize : "1rem"}}>{studentCount}</p>
              <h5 className="card-title" style={{ fontSize : "1rem", marginBottom: "0"}}>Total Students</h5>
            </div>
          </div>
        )}
        
        {type === "college" && collegeCount !== undefined && (
          <div className="card text-white bg-info mx-auto" style={{
            maxWidth: "10rem",
            maxHeight: "7rem",
            textAlign: "center",
            marginTop: "20px"
          }}>
            <div className="card-body">
              <p className="card-text fs-3" style={{ fontSize : "1rem"}}>{collegeCount}</p>
              <h5 className="card-title" style={{ fontSize : "1rem", marginBottom: "0"}}>Total Colleges</h5>
            </div>
          </div>
        )}

        {type === "program" && programCount !== undefined && (
          <div className="card text-white bg-info mx-auto" style={{
            maxWidth: "10rem",
            maxHeight: "7rem",
            textAlign: "center",
            marginTop: "20px"
          }}>
            <div className="card-body">
              <p className="card-text fs-3" style={{ fontSize : "1rem"}}>{programCount}</p>
              <h5 className="card-title" style={{ fontSize : "1rem", marginBottom: "0"}}>Total Programs</h5>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 mt-4"
        >
          <i className="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;