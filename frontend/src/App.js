import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
        <Route path="/" element={<Login />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/add-program" element={<AddProgram />} />
        <Route path="/add-college" element={<AddCollege />} />
        <Route path="/manage-student" element={<ManageStudent />} />
        <Route path="/manage-program" element={<ManageProgram />} />
        <Route path="/manage-college" element={<ManageCollege />} />
        <Route path="/update-student" element={<UpdateStudent />} />
        <Route path="/update-program" element={<UpdateProgram />} />
        <Route path="/update-college" element={<UpdateCollege />} />
      </Routes>
    </Router>
  );
}

export default App;