import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../components/Toast";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await fetch("http://127.0.0.1:5000/api/check-auth", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          navigate("/manage-student", { replace: true });
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      addToast("Please enter both username and password", "warning");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username);
        localStorage.setItem("authToken", data.token);

        addToast("Login successful! Redirecting...", "success");
        
        setTimeout(() => {
          navigate("/manage-student", { replace: true });
        }, 1000);
      } else {
        addToast(data.error || "Invalid username or password", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Failed to connect to the server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="information-frame d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow-lg bg-dark text-white" style={{ width: "400px" }}>
          <h3 className="text-center mb-4"> Student Management System</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your username"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
          
        </div>
      </div>
    </>
  );
};

export default Login;