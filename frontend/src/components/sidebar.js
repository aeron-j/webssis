import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="col-2 bg-dark p-4 vh-100">
      <h4 className="text-center mb-4 text-light">Student Manager</h4>

      <p className="text-light bg-dark">Student Operations</p>
      <button
        className="btn btn-success w-100 mb-2"
        onClick={() => navigate("/add-student")}
      >
        + Add Student
      </button>
      <button
        className="btn btn-warning w-100 mb-2"
        onClick={() => navigate("/update-student")}
      >
        ✏ Update Student
      </button>
      <button className="btn btn-danger w-100 mb-4">🗑 Delete Student</button>

      <p className="text-light bg-dark">Academic Setup</p>
      <button
        className="btn btn-success w-100 mb-2"
        onClick={() => navigate("/manage-student")}
      >
        👩‍🎓 Manage Student
      </button>
      <button
        className="btn btn-success w-100 mb-2"
        onClick={() => navigate("/manage-college")}
      >
        🏛 Manage College
      </button>
      <button
        className="btn btn-success w-100 mb-2"
        onClick={() => navigate("/manage-program")}
      >
        📚 Manage Program
      </button>

      <div className="card text-center mt-4 card-custom">
        <div className="card-body">
          <h5>100</h5>
          <small>Total Students</small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
