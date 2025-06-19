import Header from "./components/Header";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Logins";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import UserPage from "./pages/UserPage";
import Pay from "./pages/Pay";
import Transactions from "./pages/Transactions";
import Admin from "./pages/AdminPage";
import Cards from "./pages/Cards";
import Customer from "./pages/Customers";
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
  return <UserPage />;
}

function App() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<RoleBasedHome />} />
          <Route
            path="/pay"
            element={
              <ProtectedRoute requiredRole="user">
                <Pay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <ProtectedRoute requiredRole="user">
                <Cards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute requiredRole="admin">
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute requiredRole="admin">
                <Customer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/terms"
            element={<div className="text-center text-2xl">Terms of Service</div>}
          />
          <Route
            path="/privacy"
            element={<div className="text-center text-2xl">Privacy Policy</div>}
          />
          <Route
            path="*"
            element={<div className="text-center text-2xl">404 - Page Not Found</div>}
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;