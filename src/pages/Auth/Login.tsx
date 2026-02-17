import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginThunk } from "../../features/auth/authThunks";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
const navigate = useNavigate();

const handleLogin = async () => {
  const result = await dispatch(loginThunk({ email, password }));
  if (loginThunk.fulfilled.match(result)) {
    navigate("/");
  }
};


  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <input
        className="border p-2 mb-2"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 mb-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Loading..." : "Login"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      <Link to="/register" className="text-blue-600 mt-2">Create an account</Link>

    </div>
  );
}
