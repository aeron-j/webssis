import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

const AddProgram = () => {
  return (
    <div className="row vh-100">
      {/* Sidebar */}
      <Sidebar type="program" />

      {/* Main content */}
      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Add Program</h2>

        {/* Form Frame */}
        <div className="card p-4 bg-dark text-light">
          <h5>Program Information</h5>
          <hr />

          <form>
            <div className="mb-3">
              <label htmlFor="program_code" className="form-label">
                Program Code
              </label>
              <input
                type="text"
                className="form-control"
                id="program_code"
                name="program_code"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="program_name" className="form-label">
                Program Name
              </label>
              <input
                type="text"
                className="form-control"
                id="program_name"
                name="program_name"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="college" className="form-label">
                College
              </label>
              <select className="form-select" id="college" name="college" required>
                <option value="">Select College</option>
                <option value="CIT">CIT - College of Information Technology</option>
                <option value="CAS">CAS - College of Arts and Sciences</option>
                <option value="COE">COE - College of Engineering</option>
                <option value="CBA">CBA - College of Business Administration</option>
              </select>
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-success">
                + Add Program
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProgram;
