import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";

function AddStudent() {
  return (
    <div className="row vh-100">
      {/* Sidebar */}
      <Sidebar type = "student" />

      {/* Main Content */}
      <div className="col-10 p-4 bg-light">
        <h2 className="fw-bold mb-4">Add Student</h2>

        <div className="card shadow-lg p-4">
          {/* Personal Info */}
          <h5 className="fw-bold">Personal Information</h5>
          <hr />

          <div className="mb-3">
            <label htmlFor="studentId" className="form-label">
              Student ID
            </label>
            <input
              type="text"
              className="form-control"
              id="studentId"
              placeholder="Enter student ID"
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                placeholder="Enter first name"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label d-block">Gender</label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="male"
                  value="male"
                />
                <label className="form-check-label" htmlFor="male">
                  Male
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="female"
                  value="female"
                />
                <label className="form-check-label" htmlFor="female">
                  Female
                </label>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <h5 className="fw-bold mt-4">Academic Information</h5>
          <hr />

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="college" className="form-label">
                College
              </label>
              <select id="college" className="form-select">
                <option selected disabled>
                  Choose college...
                </option>
                <option value="1">College of Engineering</option>
                <option value="2">College of Arts</option>
                <option value="3">College of Business</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="program" className="form-label">
                Program
              </label>
              <select id="program" className="form-select">
                <option selected disabled>
                  Choose program...
                </option>
                <option value="1">BS Computer Science</option>
                <option value="2">BS Information Technology</option>
                <option value="3">BS Business Administration</option>
              </select>
            </div>
          </div>

          <div className="text-end mt-4">
            <button type="submit" className="btn btn-success">
              + Add Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddStudent;
