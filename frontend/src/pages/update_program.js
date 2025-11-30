import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "../components/sidebar";
import "../styles/background.css";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { useModal } from "../components/Modal";

const UpdateProgram = () => {
  const navigate = useNavigate();
  const [programCode, setProgramCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [programName, setProgramName] = useState("");
  const [college, setCollege] = useState("");
  const [colleges, setColleges] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasChecked = useRef(false); 

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
    
    const storedProgram = localStorage.getItem("selectedProgram");
    
    if (!storedProgram) {
      addToast("Please select a program from the table first", "warning");
      navigate("/manage-program", { replace: true });
      return;
    }

    try {
      const program = JSON.parse(storedProgram);
      setProgramCode(program.code);
      setOriginalCode(program.code);
      setProgramName(program.name);
      setCollege(program.college);
    } catch (error) {
      console.error("Error parsing program data:", error);
      addToast("Invalid program data. Please select a program again", "error");
      navigate("/manage-program", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/colleges", {
          headers: getAuthHeaders()
        });

        if (!res.ok) {
          if (res.status === 401) {
            addToast("Session expired. Please login again", "error");
            localStorage.clear();
            navigate("/");
            return;
          }
          throw new Error("Failed to fetch colleges");
        }

        const data = await res.json();
        setColleges(data);
      } catch (err) {
        console.error("Error fetching colleges:", err);
        addToast("Failed to load colleges", "error");
      }
    };

    fetchColleges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!programCode) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/programs/${originalCode}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            program_code: programCode,
            program_name: programName,
            college: college,
          }),
        }
      );

      const result = await res.json();
      
      if (res.ok) {
        localStorage.removeItem("selectedProgram");
        addToast(result.message || "Program updated successfully", "success");
        
        setTimeout(() => {
          navigate("/manage-program");
        }, 1500);
      } else {
        if (res.status === 401) {
          addToast("Session expired. Please login again", "error");
          localStorage.clear();
          navigate("/");
        } else {
          addToast(result.error || "Failed to update program", "error");
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
        localStorage.removeItem("selectedProgram");
        navigate("/manage-program");
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
        <Sidebar type="program" />

        <div className="col-10 bg-gradient p-4">
          <h2 className="fw-bold mb-4">Update Program</h2>

          <div className="card p-4 bg-transparent text-light shadow-lg">
            <h5>Program Information</h5>
            <hr />

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Program Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={programCode}
                  onChange={(e) => setProgramCode(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Program Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">College</label>
                <select
                  className="form-select"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="" disabled hidden>Select College</option>
                  {colleges.map((c) => (
                    <option key={c.college_code} value={c.college_code}>
                      {c.college_code} - {c.college_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-end">
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
                    "✏ Update Program"
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

export default UpdateProgram;