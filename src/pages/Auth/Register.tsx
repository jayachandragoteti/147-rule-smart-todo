import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerThunk } from "../../features/auth/authThunks";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const result = await dispatch(registerThunk({ email, password }));

    if (registerThunk.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Register</h2>

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
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Register"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <Link to="/login" className="text-blue-600 mt-2">
        Already have an account? Login
      </Link>
    </div>
  );
}
