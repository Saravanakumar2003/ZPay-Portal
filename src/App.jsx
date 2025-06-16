import { Routes, Route } from "react-router-dom";
import Login from "./pages/Logins";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Pay from "./pages/Pay";
import Transactions from "./pages/Transactions";
import Admin from "./pages/AdminPage";
import Cards from "./pages/Cards";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";


function RoleBasedHome() {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then((docSnap) => {
        setRole(docSnap.exists() ? docSnap.data().role : null);
      });
    } else {
      setRole(null);
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Home />;
  if (role === "admin") return <Admin />;
  return <Home />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<RoleBasedHome />} />
      <Route path="/pay" element={
        <ProtectedRoute requiredRole="user">
          <Pay />
        </ProtectedRoute>
      } />
      <Route path="/cards" element={
        <ProtectedRoute requiredRole="user">
          <Cards />
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute requiredRole="admin">
          <Transactions />
        </ProtectedRoute>
      } />
      <Route path="/terms" element={<div className="text-center text-2xl">Terms of Service</div>} />
      <Route path="/privacy" element={<div className="text-center text-2xl">Privacy Policy</div>} />
      <Route path="*" element={<div className="text-center text-2xl">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
