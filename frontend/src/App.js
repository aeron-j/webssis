import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// import pages
import Login from "./pages/login";
import AddStudent from "./pages/add_student";
import AddProgram from "./pages/add_program";
import AddCollege from "./pages/add_college";
import ManageStudent from "./pages/manage_student";
import ManageProgram from "./pages/manage_program";
import ManageCollege from "./pages/manage_college";
import UpdateStudent from "./pages/update_student";
import UpdateProgram from "./pages/update_program";
import UpdateCollege from "./pages/update_college";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route - Login */}
        <Route path="/" element={<Login />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/add-student"
          element={
            <ProtectedRoute>
              <AddStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-program"
          element={
            <ProtectedRoute>
              <AddProgram />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-college"
          element={
            <ProtectedRoute>
              <AddCollege />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-student"
          element={
            <ProtectedRoute>
              <ManageStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-program"
          element={
            <ProtectedRoute>
              <ManageProgram />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-college"
          element={
            <ProtectedRoute>
              <ManageCollege />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-student"
          element={
            <ProtectedRoute>
              <UpdateStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-program"
          element={
            <ProtectedRoute>
              <UpdateProgram />
            </ProtectedRoute>
          }
        />
        <Route
          path="/update-college"
          element={
            <ProtectedRoute>
              <UpdateCollege />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;