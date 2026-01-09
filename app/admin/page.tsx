"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
// Supabase client remains for storage (avatars). Data CRUD now goes through secured API.
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  type UserRow = {
    id: string;
    username: string | null;
    email: string | null;
    name: string | null;
    admin_access?: boolean | null;
    position?: string | null;
  };
  type CancerDoc = {
    id: string;
    slug: string;
    title: string;
    content: string;
    position: string | null;
    author_user_id?: string | null;
    author_name?: string | null;
    author_username?: string | null;
    author_position?: string | null;
    profilePicture?: string | null; // public URL
  };
  const [docs, setDocs] = useState<CancerDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    slug: "",
    title: "",
    content: "",
    authorId: "",
  });
  const [adding, setAdding] = useState(false);
  const [addData, setAddData] = useState({
    slug: "",
    title: "",
    content: "",
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [lastResponseDebug, setLastResponseDebug] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selfForm, setSelfForm] = useState({ username: "", email: "", name: "", password: "" });
  const [userEdits, setUserEdits] = useState<Record<string, { username: string; email: string; name: string; password: string; admin_access: boolean; position: string }>>({});
  const [savingSelf, setSavingSelf] = useState(false);
  const [savingUser, setSavingUser] = useState<Record<string, boolean>>({});
  const [selfEditing, setSelfEditing] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [newUser, setNewUser] = useState({ username: "", email: "", name: "", password: "", position: "" });
  const [authorSearch, setAuthorSearch] = useState<Record<string, string>>({});
  const [usersOpen, setUsersOpen] = useState(false);

  // Force default cursor on admin page (global CSS hides it for the fancy cursor elsewhere)
  useEffect(() => {
    const body = document?.body;
    if (!body) return;
    const prevCursor = body.style.getPropertyValue("cursor");
    const prevPriority = body.style.getPropertyPriority("cursor");
    body.style.setProperty("cursor", "auto", "important");
    return () => {
      if (prevCursor) {
        body.style.setProperty("cursor", prevCursor, prevPriority);
      } else {
        body.style.removeProperty("cursor");
      }
    };
  }, []);

  function formatSbError(err: unknown) {
    if (err === null || err === undefined) return null;
    try {
      // Supabase errors often include message, details, hint, code
      if (err instanceof Error) {
        const { name, message, stack } = err;
        return JSON.stringify({ name, message, stack }, null, 2);
      }
      const useful: Record<string, unknown> = {};
      const eObj = err as Record<string, unknown>;
      ['message','details','hint','code','status','statusText'].forEach(k => {
        if (Object.prototype.hasOwnProperty.call(eObj, k) && eObj[k] !== undefined) useful[k] = eObj[k];
      });
      // include whole object fallback
      return JSON.stringify(useful, null, 2) || JSON.stringify(eObj, null, 2);
    } catch (e) {
      console.warn("Error formatting Supabase error:", e);
      return String(err);
    }
  }
  // Check existing session on load
  useEffect(() => {
    const checkSession = async () => {
      setVerifying(true);
      try {
        const res = await fetch("/api/admin", { method: "GET" });
        const data = await res.json().catch(() => ({}));
        setLastResponseDebug((prev) => `${prev || ''}\nCHECK_SESSION:\n${JSON.stringify(data, null, 2)}`);
        if (res.ok && data?.authenticated) {
          setUnlocked(true);
          if (data.user) {
            setCurrentUser(data.user);
            setSelfForm({
              username: data.user.username ?? "",
              email: data.user.email ?? "",
              name: data.user.name ?? "",
              password: "",
            });
          }
          if (data.user?.admin_access) {
            await fetchUsers();
          }
          await fetchDocsWithPictures();
        }
      } catch (err) {
        console.error("checkSession error", err);
      } finally {
        setVerifying(false);
      }
    };
    checkSession();
  }, []);

  // Login via API (sets JWT cookie server-side)
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", identifier, password }),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((prev) => `${prev || ''}\nLOGIN_RES:\n${JSON.stringify(data, null, 2)}`);

      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }

      setUnlocked(true);
      if (data.user) {
        setCurrentUser(data.user);
        setSelfForm({
          username: data.user.username ?? "",
          email: data.user.email ?? "",
          name: data.user.name ?? "",
          password: "",
        });
      }
      if (data.user?.admin_access) {
        await fetchUsers();
      }
      await fetchDocsWithPictures();
    } catch (err) {
      console.error("Login error", err);
      setError("Login failed");
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  }

  // async function fetchDocs() {
  //   setLoading(true);
  //   const res = await supabase
  //     .from("cancer_docs")
  //     .select("*");
  //   console.log("fetchDocs response:", res);
  //   setLastResponseDebug(JSON.stringify(res, null, 2));
  //   if (res.error) {
  //     console.error("fetchDocs error:", res.error);
  //     setError(`Fetch docs failed: ${res.error.message}`);
  //     setDocs([]);
  //   } else {
  //     setDocs(res.data || []);
  //   }
  //   setLoading(false);
  // }

  // Fetch docs via secured API (per-user filtering on server)
  async function fetchDocsWithPictures() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_docs" }),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((prev) => `${prev || ''}\nDOCS_RES:\n${JSON.stringify(data, null, 2)}`);

      if (!res.ok) {
        setError(data?.error || "Failed to load docs");
        setDocs([]);
        setLoading(false);
        return;
      }

      const docsData = (data.docs ?? []) as CancerDoc[];
      setDocs(docsData);
    } catch (err) {
      console.error("fetchDocs error", err);
      setError("Failed to load docs");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditSave(id: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_doc",
          docId: id,
          slug: editData.slug,
          title: editData.title,
          content: editData.content,
          authorId: editData.authorId || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((prev) => `${prev || ''}\nUPDATE_DOC:\n${JSON.stringify(data, null, 2)}`);
      if (!res.ok) {
        setError(data?.error || "Update failed");
      }
    } catch (err) {
      console.error("update doc error", err);
      setError("Update failed");
    } finally {
      setEditing(null);
      await fetchDocsWithPictures();
      setLoading(false);
    }
  }

  async function handleAddSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_doc", ...addData }),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((prev) => `${prev || ''}\nCREATE_DOC:\n${JSON.stringify(data, null, 2)}`);
      if (!res.ok) {
        setError(data?.error || "Insert failed");
      }
    } catch (err) {
      console.error("create doc error", err);
      setError("Insert failed");
    } finally {
      setAdding(false);
      setAddData({ slug: "", title: "", content: "" });
      await fetchDocsWithPictures();
      setLoading(false);
    }
  }

  async function handleUpload(file: File, docId: string) {
    try {
      setUploading((s) => ({ ...s, [docId]: true }));

      const ext = file.name.split('.').pop();
      const path = `authors/${docId}/avatar.${ext}`;
      await supabase.auth.getUser(); 
      // upload to storage (upsert)
      const upRes = await supabase.storage
        .from('profile-picture')
        .upload(path, file, { upsert: true });
      setLastResponseDebug((p) => `${p || ''}\nUPLOAD_RES:\n${JSON.stringify(upRes, null, 2)}`);
      if (upRes.error) throw upRes.error;
      
      // upsert metadata into profile_pictures table
      const metaRes = await supabase
        .from('profile_pictures')
        .upsert({
          author_id: docId,
          object_key: path,
          content_type: file.type,
          size: file.size
        }, { onConflict: 'author_id' });
      setLastResponseDebug((p) => `${p}\nMETA_RES:\n${JSON.stringify(metaRes, null, 2)}`);
      if (metaRes.error) throw metaRes.error;

      // get a signed url so it loads reliably if bucket is private
      const signed = await supabase.storage
        .from('profile-picture')
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
      setLastResponseDebug((p) => `${p}\nSIGNED_URL_AFTER_UPLOAD:\n${JSON.stringify(signed, null, 2)}`);
      const url = signed.data?.signedUrl || null;

      setDocs((prev) => prev.map(d => d.id === docId ? { ...d, profilePicture: url || d.profilePicture || null } : d));
    } catch (err) {
      console.error('Upload error', err);
      setError('Failed to upload image');
    } finally {
      setUploading((s) => ({ ...s, [docId]: false }));
    }
  }
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this article?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_doc", docId: id }),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((prev) => `${prev || ''}\nDELETE_DOC:\n${JSON.stringify(data, null, 2)}`);
      if (!res.ok) {
        setError(data?.error || "Delete failed");
      }
    } catch (err) {
      console.error("delete doc error", err);
      setError("Delete failed");
    } finally {
      await fetchDocsWithPictures();
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((prev) => `${prev || ''}\nLOGOUT:\n${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      console.error("logout error", err);
    } finally {
      setUnlocked(false);
      setCurrentUser(null);
      setUsers([]);
      setDocs([]);
      setIdentifier("");
      setPassword("");
      setSelfEditing(false);
      setLoggingOut(false);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_users" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.users)) {
        setUsers(data.users);
        const initialEdits: Record<string, { username: string; email: string; name: string; password: string; admin_access: boolean; position: string }> = {};
        data.users.forEach((u: UserRow) => {
          initialEdits[u.id] = {
            username: u.username ?? "",
            email: u.email ?? "",
            name: u.name ?? "",
            password: "",
            admin_access: Boolean(u.admin_access),
            position: u.position ?? "",
          };
        });
        setUserEdits(initialEdits);
      } else if (!res.ok) {
        setError(data?.error || "Failed to load users");
      }
    } catch (err) {
      console.error("fetchUsers error", err);
      setError("Failed to load users");
    }
  }

  async function handleUpdateSelf(e: React.FormEvent) {
    e.preventDefault();
    setSavingSelf(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        action: "update_self",
        username: selfForm.username,
        email: selfForm.email,
        name: selfForm.name,
      };
      if (selfForm.password) body.password = selfForm.password;

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((prev) => `${prev || ''}\nUPDATE_SELF:\n${JSON.stringify(data, null, 2)}`);
      if (!res.ok) {
        setError(data?.error || "Update failed");
      } else {
        setCurrentUser(data.user);
        setSelfForm({
          username: data.user?.username ?? "",
          email: data.user?.email ?? "",
          name: data.user?.name ?? "",
          password: "",
        });
        setSelfEditing(false);
      }
    } catch (err) {
      console.error("update self error", err);
      setError("Update failed");
    } finally {
      setSavingSelf(false);
    }
  }

  async function handleUpdateUser(userId: string) {
    setSavingUser((s) => ({ ...s, [userId]: true }));
    setError("");
    const edit = userEdits[userId];
    if (!edit) {
      setSavingUser((s) => ({ ...s, [userId]: false }));
      return;
    }
    try {
      const body: Record<string, unknown> = {
        action: "update_user",
        targetUserId: userId,
        username: edit.username,
        email: edit.email,
        name: edit.name,
        admin_access: edit.admin_access,
        position: edit.position,
      };
      if (edit.password) body.password = edit.password;

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((prev) => `${prev || ''}\nUPDATE_USER(${userId}):\n${JSON.stringify(data, null, 2)}`);
      if (!res.ok) {
        setError(data?.error || "Update failed");
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("update user error", err);
      setError("Update failed");
    } finally {
      setSavingUser((s) => ({ ...s, [userId]: false }));
    }
  }

  async function handleCreateUser() {
    setError("");
    if (!newUser.email || !newUser.password) {
      setError("Email and password are required");
      return;
    }
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          username: newUser.username || undefined,
          email: newUser.email,
          name: newUser.name || undefined,
          password: newUser.password,
          position: newUser.position || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Create user failed");
      } else {
        setNewUser({ username: "", email: "", name: "", password: "", position: "" });
        await fetchUsers();
      }
    } catch (err) {
      console.error("create user error", err);
      setError("Create user failed");
    }
  }

  async function handleDeleteUser(userId: string) {
    setError("");
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_user", targetUserId: userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Delete failed");
      } else {
        await fetchUsers();
      }
    } catch (err) {
      setError("Delete failed");
    }
  }

  const filteredUsers = useMemo(() => {
    const term = userSearch.toLowerCase().trim();
    if (!term) return users;
    return users.filter((u) =>
      [u.name, u.username, u.email, u.position]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [userSearch, users]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Verifying session...
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 p-8 rounded-xl bg-card border w-full max-w-sm"
        >
          <h1 className="text-xl font-bold mb-2">Admin Portal</h1>
          <input
            type="text"
            className="border rounded px-3 py-2 bg-background"
            placeholder="Username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            className="border rounded px-3 py-2 bg-background"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-primary text-white rounded px-4 py-2 font-semibold"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 pt-[68px] min-w-screen">
      <div className="max-w-[85%] mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2 flex-wrap">
            {currentUser && (
              <div className="text-sm my-auto text-muted-foreground">Signed in as {currentUser.email || currentUser.username || "user"}</div>
            )}
            <button
              className="bg-gray-200 dark:bg-gray-800 text-sm px-3 py-2 rounded border"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        <section className="mb-8 gap-4 flex flex-col">
          <div className="p-4 rounded-xl border bg-card">
            <h2 className="font-semibold mb-3">Your Account</h2>
            {!selfEditing ? (
              <div className="flex flex-col gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Username</div>
                  <div className="font-medium break-words">{currentUser?.username || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium break-words">{currentUser?.email || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Name</div>
                  <div className="font-medium break-words">{currentUser?.name || "—"}</div>
                </div>
                <button
                  className="mt-3 bg-primary text-white rounded px-4 py-2 font-semibold w-full sm:w-auto"
                  onClick={() => setSelfEditing(true)}
                >
                  Edit profile
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={handleUpdateSelf}>
                <input
                  className="border rounded px-3 py-2 bg-background"
                  placeholder="Username"
                  value={selfForm.username}
                  onChange={(e) => setSelfForm((s) => ({ ...s, username: e.target.value }))}
                />
                <input
                  className="border rounded px-3 py-2 bg-background"
                  placeholder="Email"
                  value={selfForm.email}
                  onChange={(e) => setSelfForm((s) => ({ ...s, email: e.target.value }))}
                />
                <input
                  className="border rounded px-3 py-2 bg-background"
                  placeholder="Name"
                  value={selfForm.name}
                  onChange={(e) => setSelfForm((s) => ({ ...s, name: e.target.value }))}
                />
                <input
                  type="password"
                  className="border rounded px-3 py-2 bg-background"
                  placeholder="New password (optional)"
                  value={selfForm.password}
                  onChange={(e) => setSelfForm((s) => ({ ...s, password: e.target.value }))}
                />
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="submit"
                    className="bg-primary text-white rounded px-4 py-2 font-semibold"
                    disabled={savingSelf}
                  >
                    {savingSelf ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    className="border rounded px-4 py-2"
                    onClick={() => {
                      if (currentUser) {
                        setSelfForm({
                          username: currentUser.username ?? "",
                          email: currentUser.email ?? "",
                          name: currentUser.name ?? "",
                          password: "",
                        });
                      }
                      setSelfEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {currentUser?.admin_access && (
            <div className="p-4 rounded-xl border bg-card">
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => setUsersOpen((s) => !s)}
                aria-expanded={usersOpen}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`transition-transform ${usersOpen ? "rotate-90" : ""}`}
                    aria-hidden
                  >
                    &gt;
                  </span>
                  <h2 className="font-semibold">Users</h2>
                </div>
                <span className="text-sm text-muted-foreground">{usersOpen ? "Hide" : "Show"}</span>
              </button>

              {usersOpen && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <input
                      className="border rounded px-3 py-2 text-sm bg-background"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="text-sm underline"
                        onClick={fetchUsers}
                        disabled={loading}
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="w-full overflow-auto">
                    <table className="w-full text-sm border rounded-lg overflow-hidden">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Username</th>
                          <th className="p-2 text-left">Email</th>
                          <th className="p-2 text-left">Position</th>
                          <th className="p-2 text-left">Admin</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t bg-muted/30">
                          <td className="p-2 align-top">
                            <input
                              className="border rounded px-2 py-1 w-full"
                              placeholder="Name"
                              value={newUser.name}
                              onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              className="border rounded px-2 py-1 w-full"
                              placeholder="Username"
                              value={newUser.username}
                              onChange={(e) => setNewUser((s) => ({ ...s, username: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              className="border rounded px-2 py-1 w-full"
                              placeholder="Email"
                              value={newUser.email}
                              onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              className="border rounded px-2 py-1 w-full"
                              placeholder="Position"
                              value={newUser.position}
                              onChange={(e) => setNewUser((s) => ({ ...s, position: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 align-top text-sm text-muted-foreground">—</td>
                          <td className="p-2 align-top">
                            <div className="flex flex-col gap-2">
                              <input
                                type="password"
                                className="border rounded px-2 py-1 w-full"
                                placeholder="Password"
                                value={newUser.password}
                                onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                              />
                              <button
                                className="bg-green-600 text-white px-3 py-1 rounded"
                                onClick={handleCreateUser}
                                disabled={loading}
                              >
                                Add user
                              </button>
                            </div>
                          </td>
                        </tr>
                        {filteredUsers.map((u) => {
                      const edit = userEdits[u.id] ?? {
                        username: u.username ?? "",
                        email: u.email ?? "",
                        name: u.name ?? "",
                        password: "",
                            admin_access: Boolean(u.admin_access),
                            position: u.position ?? "",
                      };
                          return (
                            <tr key={u.id} className="border-t">
                              <td className="p-2 align-top">
                                <input
                                  className="border rounded px-2 py-1 w-full"
                                  placeholder="Name"
                                  value={edit.name}
                                  onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, name: e.target.value } }))}
                                />
                              </td>
                              <td className="p-2 align-top">
                                <input
                                  className="border rounded px-2 py-1 w-full"
                                  placeholder="Username"
                                  value={edit.username}
                                  onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, username: e.target.value } }))}
                                />
                              </td>
                              <td className="p-2 align-top">
                                <input
                                  className="border rounded px-2 py-1 w-full"
                                  placeholder="Email"
                                  value={edit.email}
                                  onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, email: e.target.value } }))}
                                />
                              </td>
                              <td className="p-2 align-top">
                                <input
                                  className="border rounded px-2 py-1 w-full"
                                  placeholder="Position"
                                  value={edit.position}
                                  onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, position: e.target.value } }))}
                                />
                              </td>
                              <td className="p-2 align-top">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={edit.admin_access}
                                    onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, admin_access: e.target.checked } }))}
                                  />
                                  Admin
                                </label>
                              </td>
                              <td className="p-2 align-top whitespace-nowrap">
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    className="bg-blue-600 text-white px-3 py-1 rounded"
                                    onClick={() => handleUpdateUser(u.id)}
                                    disabled={savingUser[u.id]}
                                  >
                                    {savingUser[u.id] ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    className="text-sm underline"
                                    onClick={() => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, password: "" } }))}
                                  >
                                    Clear password
                                  </button>
                                  <button
                                    className="text-sm text-red-600 underline"
                                    onClick={() => handleDeleteUser(u.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                                <div className="mt-2">
                                  <input
                                    type="password"
                                    className="border rounded px-2 py-1 w-full"
                                    placeholder="New password"
                                    value={edit.password}
                                    onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, password: e.target.value } }))}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td className="p-3 text-sm text-muted-foreground" colSpan={6}>No users found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

              <h2 className="text-xl font-bold mb-3">Cancer Docs Table</h2>
        {currentUser?.admin_access && (
          <button
            className="mb-4 bg-primary text-white px-4 py-2 rounded font-semibold"
            onClick={() => setAdding(true)}
          >
            + Add New Article
          </button>
        )}
        <table className="w-full border rounded-xl overflow-hidden">
          <thead className="bg-muted">
            <tr>
              <th className="p-2">Slug</th>
              <th className="p-2">Profile</th>
              <th className="p-2">Title</th>
              <th className="p-2">Content</th>
              <th className="p-2">Author</th>
              <th className="p-2">Position</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="p-2 align-top">
                  {editing === doc.id ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editData.slug}
                      onChange={(e) =>
                        setEditData({ ...editData, slug: e.target.value })
                      }
                    />
                  ) : (
                    doc.slug
                  )}
                </td>
                <td className="p-2 align-top">
                  <div className="flex items-center gap-3">
                    {doc.profilePicture ? (
                      <Image
                        src={doc.profilePicture}
                        width={48}
                        height={48}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover"
                        onError={() => {
                          console.warn('Avatar failed to load', doc.id, doc.profilePicture);
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted/40" />
                    )}
                    <label className="text-xs text-muted-foreground">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(f, doc.id);
                        }}
                        className="hidden"
                      />
                      <span className="ml-2 cursor-pointer text-primary underline">Upload</span>
                    </label>
                    {uploading[doc.id] && <div className="animate-spin h-4 w-4 border-b-2 border-primary" />}
                  </div>
                </td>
                <td className="p-2 align-top">
                  {editing === doc.id ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                    />
                  ) : (
                    doc.title
                  )}
                </td>
                <td className="p-2 align-top max-w-xs">
                  {editing === doc.id ? (
                    <textarea
                      className="border rounded px-2 py-1 w-full min-h-[80px]"
                      value={editData.content}
                      onChange={(e) =>
                        setEditData({ ...editData, content: e.target.value })
                      }
                    />
                  ) : (
                    <div className="whitespace-pre-line line-clamp-4 max-h-32 overflow-auto">
                      {doc.content}
                    </div>
                  )}
                </td>
                <td className="p-2 align-top">
                  {editing === doc.id && currentUser?.admin_access ? (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Current: {doc.author_name || doc.author_username || "—"}</div>
                      <div className="relative">
                        <input
                          className="border rounded px-2 py-1 w-full"
                          placeholder="Search authors..."
                          value={authorSearch[doc.id] ?? ""}
                          onChange={(e) => setAuthorSearch((s) => ({ ...s, [doc.id]: e.target.value }))}
                        />
                        <div className="absolute z-10 bg-popover border rounded shadow max-h-48 overflow-auto w-full mt-1">
                          {(users || [])
                            .filter((u) => {
                              const term = (authorSearch[doc.id] ?? "").toLowerCase();
                              if (!term) return true;
                              return [u.name, u.username, u.email, u.position]
                                .filter(Boolean)
                                .some((v) => String(v).toLowerCase().includes(term));
                            })
                            .slice(0, 15)
                            .map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                className={`w-full text-left px-3 py-1 text-sm hover:bg-muted ${editData.authorId === u.id ? "bg-muted" : ""}`}
                                onClick={() => setEditData((s) => ({ ...s, authorId: u.id }))}
                              >
                                <div className="font-medium">{u.name || u.username || u.email || "(no name)"}</div>
                                <div className="text-xs text-muted-foreground">{u.position || ""}</div>
                              </button>
                            ))}
                          <button
                            type="button"
                            className="w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-muted"
                            onClick={() => setEditData((s) => ({ ...s, authorId: "" }))}
                          >
                            Clear author
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">Selected: {(() => {
                        const u = users.find((usr) => usr.id === (editData.authorId || doc.author_user_id));
                        return u?.name || u?.username || u?.email || (editData.authorId || doc.author_user_id ? "Unknown" : "—");
                      })()}</div>
                    </div>
                  ) : (
                    <div className="text-sm font-medium">
                      {doc.author_user_id ? (doc.author_name || doc.author_username || "") : ""}
                    </div>
                  )}
                </td>
                <td className="p-2 align-top">
                  <div className="text-sm">
                    {doc.author_user_id ? (doc.author_position ?? "") : ""}
                  </div>
                </td>
                <td className="p-2 align-top">
                  {editing === doc.id ? (
                    <>
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                        onClick={() => handleEditSave(doc.id)}
                        disabled={loading}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white px-2 py-1 rounded"
                        onClick={() => setEditing(null)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {(currentUser?.admin_access || doc.author_user_id === currentUser?.id) && (
                        <button
                          className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                          onClick={() => {
                            setEditing(doc.id);
                            setEditData({
                              slug: doc.slug,
                              title: doc.title,
                              content: doc.content,
                              authorId: doc.author_user_id || "",
                            });
                          }}
                        >
                          Edit
                        </button>
                      )}

                      {currentUser?.admin_access && (
                        <button
                          className="bg-red-600 text-white mt-1.5 px-2 py-1 rounded"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {adding && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-background p-6 rounded-xl shadow-xl w-full max-w-lg flex flex-col gap-4">
              <h2 className="text-lg font-bold mb-2">Add New Article</h2>
              <input
                className="border rounded px-2 py-1"
                placeholder="Slug"
                value={addData.slug}
                onChange={(e) =>
                  setAddData({ ...addData, slug: e.target.value })
                }
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="Title"
                value={addData.title}
                onChange={(e) =>
                  setAddData({ ...addData, title: e.target.value })
                }
              />
              <textarea
                className="border rounded px-2 py-1 min-h-[80px]"
                placeholder="Content (Markdown supported)"
                value={addData.content}
                onChange={(e) =>
                  setAddData({ ...addData, content: e.target.value })
                }
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={handleAddSave}
                  disabled={loading}
                >
                  Add
                </button>
                <button
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  onClick={() => setAdding(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
