import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/css/HeaderFooter.css"
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

function Header() {
    const { user } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = "/"; 
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Failed to log out. Please try again.");
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    ZPay Portal
                </Link>
                <nav className="header-nav">
                    <Link to="/">Home</Link>
                    {user ? (
                        <>
                            <Link to="/pay">Pay</Link>
                            <Link to="/cards">Cards</Link>
                            <Link to="/transactions">Transactions</Link>
                            <Link to="/customers">Customers</Link>
                            <Link to="/refund">Refund</Link>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                    )}
                </nav>

            </div>
        </header>
    );
}

export default Header;