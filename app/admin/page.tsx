"use client";
import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { CancerDocsPanel } from "@/components/admin/cancer-docs-panel";
// Supabase client remains for storage (avatars). Data CRUD now goes through secured API.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export default function AdminPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");

  type UserRow = {
    id: string;
    username: string | null;
    email: string | null;
    name: string | null;
    admin_access?: boolean | null;
    position?: string | null;
    profilePicture?: string | null;
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
          const tasks: Array<Promise<unknown>> = [fetchSelfProfilePicture(), fetchDocsWithPictures({ silent: true })];
          if (data.user?.admin_access) {
            tasks.push(fetchUsers());
          }
          await Promise.all(tasks);
          setLoading(false);
        } else {
          setUnlocked(false);
          router.replace("/admin/login");
        }
      } catch (err) {
        console.error("checkSession error", err);
        setUnlocked(false);
        router.replace("/admin/login");
      } finally {
        setVerifying(false);
      }
    };
    checkSession();
  }, [router]);

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
  async function fetchDocsWithPictures(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
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
      if (!opts?.silent) setLoading(false);
    }
  }

  async function fetchSelfProfilePicture() {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_profile_picture" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCurrentUser((prev) => (prev ? { ...prev, profilePicture: data.url ?? null } : prev));
      }
    } catch (err) {
      console.error("fetchSelfProfilePicture error", err);
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

  async function handleUpload(file: File, userId: string | null | undefined) {
    if (!userId) {
      setError("Select a user before uploading a photo.");
      return;
    }
    try {
      setUploading((s) => ({ ...s, [userId]: true }));

      const ext = file.name.split(".").pop();
      const path = `authors/${userId}/avatar.${ext}`;
      await supabase.auth.getUser();

      const upRes = await supabase.storage.from("profile-picture").upload(path, file, { upsert: true });
      setLastResponseDebug((p) => `${p || ""}\nUPLOAD_RES:\n${JSON.stringify(upRes, null, 2)}`);
      if (upRes.error) throw upRes.error;

      const metaRes = await supabase.from("profile_pictures").upsert(
        {
          user_id: userId,
          object_key: path,
          content_type: file.type,
          size: file.size,
        },
        { onConflict: "user_id" },
      );
      setLastResponseDebug((p) => `${p}\nMETA_RES:\n${JSON.stringify(metaRes, null, 2)}`);
      if (metaRes.error) throw metaRes.error;

      const signed = await supabase.storage.from("profile-picture").createSignedUrl(path, 60 * 60 * 24 * 7);
      setLastResponseDebug((p) => `${p}\nSIGNED_URL_AFTER_UPLOAD:\n${JSON.stringify(signed, null, 2)}`);
      const url = signed.data?.signedUrl || null;

      setDocs((prev) => prev.map((d) => (d.author_user_id === userId ? { ...d, profilePicture: url || d.profilePicture || null } : d)));
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, profilePicture: url || u.profilePicture || null } : u)));
      setCurrentUser((prev) => (prev && prev.id === userId ? { ...prev, profilePicture: url || prev.profilePicture || null } : prev));
    } catch (err) {
      console.error("Upload error", err);
      setError("Failed to upload image");
    } finally {
      setUploading((s) => ({ ...s, [userId]: false }));
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
      setSelfEditing(false);
      setLoggingOut(false);
      router.replace("/admin/login");
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

  async function handleUpdateSelf(e: FormEvent) {
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
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Redirecting to admin login...
        </div>
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

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 gap-4 flex flex-col">
          <div className="p-4 rounded-xl border bg-card">
            <h2 className="font-semibold mb-3">Your Account</h2>
            {!selfEditing ? (
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-3">
                  {currentUser?.profilePicture ? (
                    <Image
                      src={currentUser.profilePicture}
                      alt="Your avatar"
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted" />
                  )}
                  {currentUser && (
                    <div className="flex flex-col text-xs">
                      <label htmlFor="self-avatar" className="underline cursor-pointer hover:cursor-pointer">Change photo</label>
                      <input
                        id="self-avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(f, currentUser.id);
                        }}
                      />
                      {uploading[currentUser.id] && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Uploading" />
                      )}
                    </div>
                  )}
                </div>
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
                          <th className="p-2 text-left">Avatar</th>
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
                            <div className="h-12 w-12 rounded-full bg-muted" />
                          </td>
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
                                <div className="flex items-center gap-3">
                                  {u.profilePicture ? (
                                    <Image src={u.profilePicture} alt="avatar" width={48} height={48} className="h-12 w-12 rounded-full object-cover" unoptimized />
                                  ) : (
                                    <div className="h-12 w-12 rounded-full bg-muted" />
                                  )}
                                  <div className="flex flex-col gap-1 text-xs">
                                    <label htmlFor={`upload-${u.id}`} className="underline cursor-pointer hover:cursor-pointer">Change photo</label>
                                    <input
                                      id={`upload-${u.id}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUpload(f, u.id);
                                      }}
                                    />
                                    {uploading[u.id] && (
                                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Uploading" />
                                    )}
                                  </div>
                                </div>
                              </td>
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
                            <td className="p-3 text-sm text-muted-foreground" colSpan={7}>No users found.</td>
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

        <CancerDocsPanel
          docs={docs}
          currentUser={currentUser}
          editingId={editing}
          editData={editData}
          setEditData={setEditData}
          setEditing={setEditing}
          onSave={handleEditSave}
          onDelete={handleDelete}
          users={users}
          authorSearch={authorSearch}
          setAuthorSearch={setAuthorSearch}
          loading={loading}
          adding={adding}
          onAddOpen={() => setAdding(true)}
          onAddClose={() => {
            setAdding(false);
            setAddData({ slug: "", title: "", content: "" });
          }}
          addData={addData}
          setAddData={setAddData}
          onAddSubmit={handleAddSave}
        />
      </div>
    </div>
  );
}
