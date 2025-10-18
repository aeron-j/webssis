import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = ({ type }) => {
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
          <button className="btn btn-danger w-100 mb-4">🗑 Delete Student</button>
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
          <button className="btn btn-danger w-100 mb-4">🗑 Delete College</button>
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
          <button className="btn btn-danger w-100 mb-4">🗑 Delete Program</button>
        </>
      );
    }
  };

  return (
    <div className="col-2 bg-dark p-4">
      {/* Sidebar Title */}
      <h4 className="text-center text-light mb-4">🎓 Student System</h4>

      {/* Section Links */}
      {renderLinks()}

      {/* Common Navigation */}
      <p className="text-light">Academic Setup</p>
      <Link to="/manage-student" className="btn btn-success w-100 mb-2">
        👩‍🎓 Manage Student
      </Link>
      <Link to="/manage-college" className="btn btn-success w-100 mb-2">
        🏛 Manage College
      </Link>
      <Link to="/manage-program" className="btn btn-success w-100 mb-2">
        📚 Manage Program
      </Link>
    </div>
  );
};

export default Sidebar;
