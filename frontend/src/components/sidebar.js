import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ type, onDelete, studentCount, collegeCount, programCount }) => {
  const renderLinks = () => {
    if (type === "student") {
      return (
        <>
          <p className="text-light">Student Operations</p>
          <Link to="/add-student" className="btn btn-success w-100 mb-2">
            + Add Student
          </Link>
          <Link to="/update-student" className="btn btn-warning w-100 mb-2">
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
          <Link to="/add-college" className="btn btn-success w-100 mb-2">
            + Add College
          </Link>
          <Link to="/update-college" className="btn btn-warning w-100 mb-2">
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
          <Link to="/add-program" className="btn btn-success w-100 mb-2">
            + Add Program
          </Link>
          <Link to="/update-program" className="btn btn-warning w-100 mb-2">
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
      <Link to="/manage-student" className="btn btn-success w-100 mb-2">
        👩‍🎓 Manage Student
      </Link>
      <Link to="/manage-college" className="btn btn-success w-100 mb-2">
        🏛 Manage College
      </Link>
      <Link to="/manage-program" className="btn btn-success w-100 mb-2">
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
            <h5 className="card-title" style={{ fontSize : "1rem", marginBottom: "rem" }}>Total Students</h5>
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
            <h5 className="card-title" style={{ fontSize : "1rem", marginBottom: "0"}}>Total Colleges</h5>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
