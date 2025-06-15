import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Save user role in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email,
                role: role || "user", // Default to 'user' if no role selected
                createdAt: new Date(),
            });
            navigate("/");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-lg w-96 space-y-4">
                <h2 className="text-2xl font-bold text-center">Sign Up</h2>
                <input type="email" placeholder="Email" required value={email}
                    onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
                <input type="password" placeholder="Password" required value={password}
                    onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" />
                <select className="w-full border p-2 rounded" onChange={(e) => setRole(e.target.value)} value={role}>
                    <option value="" disabled>Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a href="/login" className="text-purple-600 hover:underline">
                        Login
                    </a>
                </p>
                <p className="text-sm text-gray-600">
                    By signing up, you agree to our{" "}
                    <a href="/terms" className="text-purple-600 hover:underline">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-purple-600 hover:underline">
                        Privacy Policy
                    </a>.
                </p>
                <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
                    Sign Up
                </button>
            </form>
        </div>
    );
}

export default Signup;
