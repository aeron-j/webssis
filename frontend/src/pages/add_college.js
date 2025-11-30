import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

const AddCollege = () => {
  const [collegeCode, setCollegeCode] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const { isOpen, modalConfig, openModal, closeModal } = useModal();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = { 
      college_code: collegeCode.toUpperCase(), 
      college_name: collegeName 
    };

    try {
      const res = await fetch("http://127.0.0.1:5000/api/colleges", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        addToast(result.message || "College added successfully", "success");
        setCollegeCode("");
        setCollegeName("");
        
        setTimeout(() => {
          navigate("/manage-college");
        }, 1500);
      } else {
        if (res.status === 401) {
          addToast("Session expired. Please login again", "error");
          localStorage.clear();
          navigate("/");
        } else {
          addToast(result.error || "Failed to add college", "error");
        }
      }
    } catch (error) {
      console.error("Error adding college:", error);
      addToast("Could not connect to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (collegeCode || collegeName) {
      openModal({
        title: "Discard Changes?",
        message: "Are you sure you want to cancel? All unsaved changes will be lost.",
        confirmText: "Yes, Discard",
        cancelText: "No, Keep Editing",
        type: "warning",
        onConfirm: () => navigate("/manage-college")
      });
    } else {
      navigate("/manage-college");
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
      />

      <div className="row information-frame">
        <Sidebar type="college" />

        <div className="col-10 bg-gradient p-4">
          <h2 className="fw-bold mb-4">Add College</h2>

          <div className="card p-4 bg-transparent text-light shadow-lg">
            <h5>College Information</h5>
            <hr />

            <form onSubmit={handleSubmit}>
              {/* College Code */}
              <div className="mb-3">
                <label className="form-label">College Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter college code"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* College Name */}
              <div className="mb-3">
                <label className="form-label">College Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter college name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-end mt-3">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding...
                    </>
                  ) : (
                    "+ Add College"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCollege;