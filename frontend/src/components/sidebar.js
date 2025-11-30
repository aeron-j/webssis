import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ type, onDelete, studentCount, collegeCount, programCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
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
            + Add Student
          </Link>
          <Link
            to="/update-student"
            className={`btn w-100 mb-2 ${isActive("/update-student") ? "btn-warning" : "btn-outline-warning"}`}
          >
            ✏ Update Student
          </Link>
          <button
            className="btn btn-danger w-100 mb-4"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            🗑 Delete Student
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
            + Add College
          </Link>
          <Link
            to="/update-college"
            className={`btn w-100 mb-2 ${isActive("/update-college") ? "btn-warning" : "btn-outline-warning"}`}
          >
            ✏ Update College
          </Link>
          <button
            className="btn btn-danger w-100 mb-4"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            🗑 Delete College
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
            + Add Program
          </Link>
          <Link
            to="/update-program"
            className={`btn w-100 mb-2 ${isActive("/update-program") ? "btn-warning" : "btn-outline-warning"}`}
          >
            ✏ Update Program
          </Link>
          <button
            className="btn btn-danger w-100 mb-4"
            onClick={() => {
              if (onDelete) onDelete();
            }}
          >
            🗑 Delete Program
          </button>
        </>
      );
    }
  };

  return (
    <div className="col-2 bg-dark p-4">
      {/* Sidebar Title */}
      <h4 className="text-center text-light mb-4">Student System</h4>

      {/* Section Links */}
      {renderLinks()}

      {/* Common Navigation */}
      <p className="text-light mt-4">Academic Setup</p>
      <Link
        to="/manage-student"
        className={`btn w-100 mb-2 ${isActive("/manage-student") ? "btn-success" : "btn-outline-success"}`}
      >
        👩‍🎓 Manage Student
      </Link>
      <Link
        to="/manage-college"
        className={`btn w-100 mb-2 ${isActive("/manage-college") ? "btn-success" : "btn-outline-success"}`}
      >
        🏛 Manage College
      </Link>
      <Link
        to="/manage-program"
        className={`btn w-100 mb-2 ${isActive("/manage-program") ? "btn-success" : "btn-outline-success"}`}
      >
        📚 Manage Program
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
        🚪 Logout
      </button>
    </div>
  );
};

export default Sidebar;