import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", { username, password });
      // Lưu token
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      // Điều hướng vào app
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
    }
  };

  return (
    <div className="auth-wrap">
      <form onSubmit={onSubmit} className="auth-card">
        <h1>Đăng nhập</h1>
        <p>Chào mừng đến với TAP.app</p>

        <input
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Ghi nhớ đăng nhập
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="primary">Đăng nhập</button>

        <div className="oauth">
          <button type="button">Google</button>
          <button type="button">GitHub</button>
        </div>

        <div className="signup">
          Mới dùng lần đầu? <Link to="/register">Tạo tài khoản</Link>
        </div>
      </form>
    </div>
  );
}
