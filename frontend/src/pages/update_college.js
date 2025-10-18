import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

const UpdateCollege = () => {
  return (
    <div className="row vh-100">
      {/* Sidebar */}
      <Sidebar type="college" />

      {/* Main Content */}
      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Update College</h2>

        {/* Form Frame */}
        <div className="card p-4 bg-dark text-light shadow-lg">
          <h5>College Information</h5>
          <hr />

          <form>
            {/* College Code */}
            <div className="mb-3">
              <label htmlFor="collegeCode" className="form-label">
                College Code
              </label>
              <input
                type="text"
                className="form-control"
                id="collegeCode"
                placeholder="Enter college code"
                required
              />
            </div>

            {/* College Name */}
            <div className="mb-3">
              <label htmlFor="collegeName" className="form-label">
                College Name
              </label>
              <input
                type="text"
                className="form-control"
                id="collegeName"
                placeholder="Enter college name"
                required
              />
            </div>

            {/* Update College Button */}
            <div className="text-end">
              <button type="submit" className="btn btn-warning">
                ✏ Update College
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCollege;
