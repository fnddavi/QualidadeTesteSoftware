// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";

// =====================
// CONFIG
// =====================
const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:3001";

// =====================
// TYPES
// =====================
interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    message?: string;
    token: string;
    user: { id: string; username: string };
  };
  error?: string;
}

// =====================
// UTILS
// =====================
const phoneRegex = /^(\(\d{2}\)|\d{2})\d{4,5}-?\d{4}$/;

function useAuthToken() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));
  const save = (tk: string, user?: string) => {
    localStorage.setItem("token", tk);
    setToken(tk);
    if (user) {
      localStorage.setItem("username", user);
      setUsername(user);
    }
  };
  const clear = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  };
  return { token, username, save, clear };
}

async function api<T>(path: string, opts: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...headers, ...(opts.headers || {}) } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

// =====================
// MAIN APP
// =====================
export default function App() {
  const auth = useAuthToken();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // auth forms
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [logUser, setLogUser] = useState("");
  const [logPass, setLogPass] = useState("");

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const authorized = useMemo(() => !!auth.token, [auth.token]);

  useEffect(() => {
    if (authorized) refreshContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  async function refreshContacts() {
    try {
      setLoading(true);
      const data = await api<{ success: boolean; data: Contact[] | { contacts: Contact[] } }>(
        "/contacts",
        { method: "GET" },
        auth.token
      );
      const list = Array.isArray((data as any).data)
        ? ((data as any).data as Contact[])
        : ((data as any).data.contacts as Contact[]);
      setContacts(list);
    } catch (e: any) {
      alert("Falha ao carregar contatos: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/users", { method: "POST", body: JSON.stringify({ username: regUser, password: regPass }) });
      alert("Usuário criado! Faça login.");
    } catch (e: any) {
      alert("Erro no cadastro: " + e.message);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api<LoginResponse>("/users/login", {
        method: "POST",
        body: JSON.stringify({ username: logUser, password: logPass }),
      });
      const tk = res.data?.token!;
      const user = res.data?.user.username || logUser;
      auth.save(tk, user);
      await refreshContacts();
    } catch (e: any) {
      alert("Falha no login: " + e.message);
    }
  }

  async function handleLogout() {
    try {
      if (auth.token) {
        await fetch(`${API_BASE}/users/logout`, { method: "POST", headers: { Authorization: `Bearer ${auth.token}` } });
      }
    } catch {}
    auth.clear();
    setContacts([]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneRegex.test(phone)) {
      alert("Telefone inválido. Use DDD + número (ex: 11987654321).");
      return;
    }
    try {
      const res = await api<{ success: boolean; data: { contact: Contact } }>(
        "/contacts",
        { method: "POST", body: JSON.stringify({ name, phone }) },
        auth.token
      );
      setContacts((c) => [res.data.contact, ...c]);
      setName("");
      setPhone("");
    } catch (e: any) {
      alert("Erro ao criar: " + e.message);
    }
  }

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditPhone(c.phone);
  }

  async function saveEdit(id: string) {
    try {
      const res = await api<{ success: boolean; data: Contact | { contact: Contact } }>(
        `/contacts/${id}`,
        { method: "PUT", body: JSON.stringify({ name: editName, phone: editPhone }) },
        auth.token
      );
      const updated = (res as any).data.contact ?? (res as any).data;
      setContacts((list) => list.map((c) => (c.id === id ? (updated as Contact) : c)));
      setEditingId(null);
    } catch (e: any) {
      alert("Erro ao atualizar: " + e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir este contato?")) return;
    try {
      await api(`/contacts/${id}`, { method: "DELETE" }, auth.token);
      setContacts((list) => list.filter((c) => c.id !== id));
    } catch (e: any) {
      alert("Erro ao deletar: " + e.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", padding: 24, background: "#f8fafc" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>📇 Contacts CRUD</h1>
          {authorized && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#475569", fontSize: 14 }}>{auth.username}</span>
              <button data-testid="btn-refresh" onClick={refreshContacts} className="btn secondary">Atualizar</button>
              <button data-testid="btn-logout" onClick={handleLogout} className="btn danger">Sair</button>
            </div>
          )}
        </header>

        {!authorized ? (
          <div className="card">
            <div className="card-header">Acesse sua conta</div>
            <div className="card-content">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Login */}
                <form onSubmit={handleLogin} className="form" data-testid="form-login">
                  <h3>Login</h3>
                  <label>Usuário</label>
                  <input data-testid="login-username" value={logUser} onChange={(e) => setLogUser(e.target.value)} required />
                  <label>Senha</label>
                  <input data-testid="login-password" type="password" value={logPass} onChange={(e) => setLogPass(e.target.value)} required />
                  <div style={{ textAlign: "right" }}>
                    <button data-testid="login-submit" type="submit" className="btn">Entrar</button>
                  </div>
                </form>

                {/* Cadastro */}
                <form onSubmit={handleRegister} className="form" data-testid="form-register">
                  <h3>Cadastro</h3>
                  <label>Usuário</label>
                  <input data-testid="register-username" value={regUser} onChange={(e) => setRegUser(e.target.value)} minLength={3} required />
                  <label>Senha</label>
                  <input data-testid="register-password" type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} minLength={6} required />
                  <div style={{ textAlign: "right" }}>
                    <button data-testid="register-submit" type="submit" className="btn">Cadastrar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Criar novo contato */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">Novo contato</div>
              <div className="card-content">
                <form onSubmit={handleCreate} className="form row" data-testid="form-create">
                  <div>
                    <label>Nome</label>
                    <input data-testid="create-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
                  </div>
                  <div>
                    <label>Telefone</label>
                    <input data-testid="create-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="11999999999" required />
                    <small style={{ color: "#64748b" }}>Formato: DDD + número, com/sem hífen</small>
                  </div>
                  <div style={{ alignSelf: "end" }}>
                    <button data-testid="create-submit" type="submit" className="btn">Salvar</button>
                  </div>
                </form>
              </div>
            </div>

            {/* Lista de contatos */}
            <div className="card">
              <div className="card-header">Seus contatos</div>
              <div className="card-content">
                {loading ? (
                  <p style={{ color: "#475569" }}>Carregando…</p>
                ) : contacts.length === 0 ? (
                  <p style={{ color: "#475569" }}>Nenhum contato ainda.</p>
                ) : (
                  <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {contacts.map((c) => (
                      <li key={c.id} className="item" data-testid={`contact-${c.id}`}>
                        {editingId === c.id ? (
                          <div className="row">
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                            <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                            <div className="row gap">
                              <button data-testid={`cancel-edit-${c.id}`} className="btn secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                              <button data-testid={`save-${c.id}`} className="btn" onClick={() => saveEdit(c.id)}>Salvar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="row space-between">
                            <div>
                              <div className="title">{c.name}</div>
                              <div className="sub">{c.phone}</div>
                            </div>
                            <div className="row gap">
                              <button data-testid={`edit-${c.id}`} className="btn secondary" onClick={() => startEdit(c)}>Editar</button>
                              <button data-testid={`delete-${c.id}`} className="btn danger" onClick={() => handleDelete(c.id)}>Excluir</button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* estilos simples embutidos para não depender de libs */}
      <style>{`
        .btn { padding: 8px 12px; border-radius: 8px; background:#2563eb; color:white; border:none; cursor:pointer }
        .btn:hover { background:#1d4ed8 }
        .btn.secondary { background:#e2e8f0; color:#0f172a }
        .btn.secondary:hover { background:#cbd5e1 }
        .btn.danger { background:#dc2626 }
        .btn.danger:hover { background:#b91c1c }

        .card { background:white; border:1px solid #e2e8f0; border-radius:16px; box-shadow: 0 1px 3px rgba(0,0,0,.05) }
        .card-header { padding:16px 16px 0; font-weight:600 }
        .card-content { padding:16px }

        .form { display:grid; gap:8px }
        .form.row { grid-template-columns: 1fr 1fr auto; align-items: start }
        .row { display:flex; gap:8px; align-items:center }
        .row.gap { gap:8px }
        .row.space-between { justify-content: space-between }
        input { padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; width:100% }
        label { font-size:14px; color:#334155; display:block; margin-bottom:4px }
        .item { border:1px solid #e2e8f0; border-radius:12px; padding:12px; background:white }
        .title { font-weight:600 }
        .sub { color:#475569; font-size:14px }
      `}</style>
    </div>
  );
}
