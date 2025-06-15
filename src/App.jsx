import { Routes, Route } from "react-router-dom";
import Login from "./pages/Logins";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Pay from "./pages/Pay";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={
          <Home />
      } />
      <Route path="/pay" element={
        <ProtectedRoute>
          <Pay />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
