import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

const ManageStudent = () => {
  return (
    <div className="row vh-100">
      {/* Sidebar (Reusable Component) */}
      <Sidebar type = "student" />

      {/* Main Content */}
      <div className="col-10 bg-gradient p-4">
        <h2 className="fw-bold mb-4">Student Database</h2>

        {/* Search + Filter */}
        <div className="d-flex mb-3">
          <input type="text" className="form-control me-2" placeholder="Search" />
          <select className="form-select me-2">
            <option>Filter By</option>
          </select>
          <select className="form-select">
            <option>Sort By</option>
          </select>
        </div>

        {/* Table */}
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Gender</th>
              <th>Year Level</th>
              <th>Course</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2021-2023</td>
              <td>Anya</td>
              <td>Monta</td>
              <td>Female</td>
              <td>3rd Year</td>
              <td>BSCA</td>
            </tr>
          </tbody>
        </table>

        {/* Pagination */}
        <div className="d-flex mt-2 justify-content-center">
          <ul className="pagination">
            <li className="page-item disabled">
              <a className="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li className="page-item active">
              <a className="page-link" href="#">1</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">2</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageStudent;
