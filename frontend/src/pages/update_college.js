import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

const UpdateCollege = () => {
  const [collegeCode, setCollegeCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasChecked = useRef(false);
  
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

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const storedCollege = JSON.parse(localStorage.getItem("selectedCollege"));
    if (!storedCollege) {
      addToast("Please select a college from the table first", "warning");
      navigate("/manage-college");
      return;
    }
    setCollegeCode(storedCollege.college_code);
    setOriginalCode(storedCollege.college_code);
    setCollegeName(storedCollege.college_name);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collegeCode) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/colleges/${originalCode}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            college_code: collegeCode.toUpperCase(), 
            college_name: collegeName 
          }),
        }
      );
      
      const result = await res.json();
      
      if (res.ok) {
        addToast(result.message || "College updated successfully", "success");
        localStorage.removeItem("selectedCollege");
        
        setTimeout(() => {
          navigate("/manage-college");
        }, 1500);
      } else {
        if (res.status === 401) {
          addToast("Session expired. Please login again", "error");
          localStorage.clear();
          navigate("/");
        } else {
          addToast(result.error || "Failed to update college", "error");
        }
      }
    } catch (error) {
      console.error(error);
      addToast("Could not connect to server", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    openModal({
      title: "Discard Changes?",
      message: "Are you sure you want to cancel? All unsaved changes will be lost.",
      confirmText: "Yes, Discard",
      cancelText: "No, Keep Editing",
      type: "warning",
      onConfirm: () => {
        localStorage.removeItem("selectedCollege");
        navigate("/manage-college");
      }
    });
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
          <h2 className="fw-bold mb-4">Update College</h2>

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
                  className="btn btn-warning"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    "✏ Update College"
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

export default UpdateCollege;