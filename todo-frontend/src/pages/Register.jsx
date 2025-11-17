import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await register(username.trim(), password);
      navigate("/login");
    } catch (e) {
      setErr(e?.response?.data?.message || "Đăng ký thất bại");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-inner">
          <h2 className="auth-title">Create account</h2>
          <form onSubmit={submit} className="auth-form">
            <input className="auth-input" placeholder="Username"
              value={username} onChange={e=>setUsername(e.target.value)} />
            <input className="auth-input" placeholder="Password" type="password"
              value={password} onChange={e=>setPassword(e.target.value)} />
            {err && <div className="auth-error">{err}</div>}
            <button className="auth-button" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>
            <div className="auth-foot">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
