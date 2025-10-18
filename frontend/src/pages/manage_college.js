import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

const ManageCollege = () => {
  return (
    <div className="row vh-100">
      {/* Sidebar */}
      <Sidebar type = "college" />

      {/* Main content */}
      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Manage College</h2>

        {/* Search and Sort Controls */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Search filter */}
          <input
            type="text"
            className="form-control w-50"
            placeholder="🔍 Search College..."
          />

          {/* Sort By */}
          <select className="form-select w-25">
            <option selected disabled>
              Sort By
            </option>
            <option value="code">College Code</option>
            <option value="name">College Name</option>
          </select>
        </div>

        {/* Table */}
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>College Code</th>
              <th>College Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CIT</td>
              <td>College of Information Technology</td>
            </tr>
            <tr>
              <td>CAS</td>
              <td>College of Arts and Sciences</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCollege;
