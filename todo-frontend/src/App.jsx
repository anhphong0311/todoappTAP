import { useEffect, useRef, useState } from "react";
import { api } from "./api/api";

import cheerImg from "./assets/meme-co-gang-2.webp";
import cheerSound from "./assets/co_len_co_len_sap_toi_roi_sap_toi_roi_ban_goc-www_tiengdong_com.mp3";


export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(""); // datetime-local value
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // popup khích lệ
  const [cheerVisible, setCheerVisible] = useState(false);
  const cheerAudioRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (e) {
      setError(e.message || "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // preload audio
  useEffect(() => {
    cheerAudioRef.current = new Audio(cheerSound);
    cheerAudioRef.current.volume = 0.7;
  }, []);

  const showCheer = () => {
    setCheerVisible(true);
    if (cheerAudioRef.current) {
      cheerAudioRef.current.currentTime = 0;
      cheerAudioRef.current.play().catch(() => {});
    }
    setTimeout(() => setCheerVisible(false), 2500);
  };

  const createTodo = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await api.post("/todos", {
      title: t,
      completed: false,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
    setTitle("");
    setDueDate("");
    await load();
  };

  // Giữ lại toggle nếu bạn muốn dùng ở chỗ khác
  const toggle = async (todo) => {
    await api.put(`/todos/${todo.id}`, {
      title: todo.title,
      completed: !todo.completed,
      dueDate: todo.dueDate ?? null,
    });
    await load();
  };

  const remove = async (id) => {
    await api.delete(`/todos/${id}`);
    await load();
  };

  // Đánh dấu hoàn thành -> ẩn khỏi danh sách ngay
  const markDone = async (todo) => {
    await api.put(`/todos/${todo.id}`, {
      title: todo.title,
      completed: true,
      dueDate: todo.dueDate ?? null,
    });
    setTodos((prev) => prev.filter((x) => x.id !== todo.id)); // ẩn ngay
  };

  // Đánh dấu chưa xong (nếu bạn cần khôi phục ở màn khác)
  const markUndone = async (todo) => {
    await api.put(`/todos/${todo.id}`, {
      title: todo.title,
      completed: false,
      dueDate: todo.dueDate ?? null,
    });
    setTodos((prev) =>
      prev.map((x) => (x.id === todo.id ? { ...x, completed: false } : x))
    );
  };

  // Bấm "Chưa xong" => (nếu đang completed thì đánh dấu chưa xong) + hiện popup & âm thanh
  const onCheerClick = async (t) => {
    if (t.completed) {
      await markUndone(t);
    }
    showCheer();
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditingTitle(t.title);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };
  const saveEdit = async (t) => {
    const newTitle = editingTitle.trim();
    if (!newTitle) return;
    await api.put(`/todos/${t.id}`, {
      title: newTitle,
      completed: t.completed,
      dueDate: t.dueDate ?? null,
    });
    setEditingId(null);
    setEditingTitle("");
    await load();
  };
  const onEditKeyDown = (e, t) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(t);
    }
    if (e.key === "Escape") {
      cancelEdit();
    }
  };

  // ======= SIDEBAR “TRONG THÁNG NÀY” =======
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Chỉ hiển thị việc có hạn trong tháng & CHƯA hoàn thành
  const monthlyTodos = todos
    .filter((t) => {
      if (!t.dueDate || t.completed) return false;
      const d = new Date(t.dueDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Danh sách HIỂN THỊ ở panel chính: chỉ việc CHƯA hoàn thành
  const visibleTodos = todos.filter((t) => !t.completed);

  // style nhỏ cho nút bút chì
  const ghostBtnStyle = {
    background: "transparent",
    border: "1px solid #e2e8f0",
    color: "#4a5568",
    borderRadius: 8,
    padding: "2px 6px",
    fontSize: "0.9rem",
    lineHeight: 1,
    cursor: "pointer",
  };

  // overlay styles cho popup
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };
  const popupStyle = {
    background: "white",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    padding: 16,
  };

  // ==========================================================

  return (
    <div className="app-wrap">
      <div className="card">
        <h1>To-Do App</h1>

        {/* Layout 2 cột: Sidebar trái + Main phải */}
        <div className="two-col">
          {/* ===== SIDEBAR: việc có hạn trong tháng ===== */}
          <aside className="sidebar">
            <h3>
              Trong tháng {thisMonth + 1}/{thisYear}
            </h3>

            {monthlyTodos.length === 0 ? (
              <p>Không có việc có hạn trong tháng.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {monthlyTodos.map((t) => {
                  const d = new Date(t.dueDate);
                  const overdue = d < new Date() && !t.completed;
                  return (
                    <li
                      key={`m-${t.id}`}
                      className={`month-item ${overdue ? "overdue" : ""}`}
                    >
                      <div className="datechip">{d.getDate()}</div>
                      <div className="title">
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        <div
                          style={{
                            fontSize: "0.85em",
                            color: overdue ? "#e53e3e" : "#718096",
                          }}
                        >
                          {d.toLocaleString("vi-VN")}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* ===== MAIN: form + danh sách ===== */}
          <div>
            <form
              onSubmit={createTodo}
              style={{ display: "flex", gap: 10, marginBottom: 20 }}
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập việc cần làm..."
                style={{ flex: 1 }}
              />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: 240 }}
              />
              <button type="submit">Thêm</button>
            </form>

            {error && (
              <div style={{ color: "#b00020", marginBottom: 12 }}>
                Lỗi: {error}
              </div>
            )}

            {loading ? (
              <p>Đang tải…</p>
            ) : visibleTodos.length === 0 ? (
              <p>Chưa có việc nào.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {visibleTodos.map((t) => {
                  const overdue =
                    t.dueDate && new Date(t.dueDate) < new Date() && !t.completed;

                  return (
                    <li
                      key={t.id}
                      className={`todo-item ${t.completed ? "completed" : ""}`}
                      style={{ marginTop: 10 }}
                    >
                      {editingId === t.id ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                          }}
                        >
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => onEditKeyDown(e, t)}
                            style={{ flex: 1 }}
                            placeholder="Nhập tiêu đề mới…"
                          />
                          <button onClick={() => saveEdit(t)}>Lưu</button>
                          <button
                            onClick={cancelEdit}
                            style={{ background: "#a0aec0" }}
                          >
                            Huỷ
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          {/* Khối tiêu đề + nút sửa ở cạnh */}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span style={{ fontWeight: 500 }}>{t.title}</span>
                              <button
                                style={ghostBtnStyle}
                                title="Sửa tiêu đề"
                                onClick={() => startEdit(t)}
                                aria-label="Sửa"
                              >
                                ✏️
                              </button>
                            </div>

                            <p
                              style={{
                                fontSize: "0.9em",
                                color: overdue ? "red" : "#666",
                                margin: "4px 0 0 0",
                              }}
                            >
                              {t.dueDate
                                ? `Hạn: ${new Date(t.dueDate).toLocaleString(
                                    "vi-VN"
                                  )}`
                                : "Không có hạn"}
                            </p>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            {/* Hai nút trạng thái */}
                            <button
                              onClick={() => markDone(t)}
                              style={{ background: "#48bb78", color: "white" }}
                            >
                              Hoàn thành
                            </button>
                            <button
                              onClick={() => onCheerClick(t)}
                              style={{ background: "#ed8936", color: "white" }}
                            >
                              Chưa xong
                            </button>

                            {/* Xóa */}
                            <button
                              onClick={() => remove(t.id)}
                              style={{ background: "#e53e3e", color: "white" }}
                            >
                              Xóa
                            </button>
                            <button onClick={() => { localStorage.removeItem("token"); location.href="/login"; }}
                                    style={{position:"absolute", top:16, right:16}}>
                              Đăng xuất
                            </button>

                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Popup khích lệ */}
      {cheerVisible && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <img
              src={cheerImg}
              alt="You can do it!"
              style={{ maxWidth: 280, maxHeight: 280, display: "block" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
