import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

const ManageProgram = () => {
  return (
    <div className="row vh-100">
      {/* Sidebar */}
      <Sidebar type = "program" />

      {/* Main content */}
      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Manage Program</h2>

        {/* Search and Sort Controls */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Search filter */}
          <input
            type="text"
            className="form-control w-50"
            placeholder="🔍 Search Program..."
          />

          {/* Sort By */}
          <select className="form-select w-25">
            <option selected disabled>
              Sort By
            </option>
            <option value="code">Program Code</option>
            <option value="name">Program</option>
            <option value="college">College</option>
          </select>
        </div>

        {/* Table */}
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>Program Code</th>
              <th>Program</th>
              <th>College</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BSCS</td>
              <td>Bachelor of Science in Computer Science</td>
              <td>CIT</td>
            </tr>
            <tr>
              <td>BSA</td>
              <td>Bachelor of Science in Accountancy</td>
              <td>CAS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProgram;
