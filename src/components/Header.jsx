import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../assets/css/HeaderFooter.css"
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Header() {
    const { user } = useAuth();

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
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </>
                    )}
                    {user && (
                        <Link to="/" onClick={() => signOut(auth)}>
                            Logout
                        </Link>
                    )}

                </nav>
            </div>
        </header>
    );
}

export default Header;