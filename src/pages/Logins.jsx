import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-lg w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <input type="email" placeholder="Email" required value={email}
          onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" />
        <input type="password" placeholder="Password" required value={password}
          onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
          Login
        </button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{" "}
        <a href="/signup" className="text-purple-600 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

export default Login;
