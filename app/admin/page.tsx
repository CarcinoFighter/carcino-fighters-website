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
    description?: string | null;
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

  type SubmissionRow = {
    id: string;
    doc_id: string | null;
    slug: string;
    title: string;
    content: string;
    author_user_id: string;
    status: "pending" | "approved" | "rejected";
    reviewer_user_id?: string | null;
    reviewer_note?: string | null;
    created_at?: string;
    updated_at?: string;
    author?: {
      name: string | null;
      username: string | null;
      email: string | null;
      position: string | null;
    } | null;
  };

  const [docs, setDocs] = useState<CancerDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [lastResponseDebug, setLastResponseDebug] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selfForm, setSelfForm] = useState({ username: "", email: "", name: "", password: "", description: "" });
  const [userEdits, setUserEdits] = useState<Record<string, { username: string; email: string; name: string; password: string; admin_access: boolean; position: string; description: string }>>({});
  const [savingSelf, setSavingSelf] = useState(false);
  const [savingUser, setSavingUser] = useState<Record<string, boolean>>({});
  const [selfEditing, setSelfEditing] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [newUser, setNewUser] = useState({ username: "", email: "", name: "", password: "", position: "", description: "" });
  const [usersOpen, setUsersOpen] = useState(false);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [reviewing, setReviewing] = useState<Record<string, boolean>>({});

  const cardClass = "rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl";
  const inputClass = "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#6D54B5]";
  const textareaClass = `${inputClass} min-h-[100px]`;
  const primaryButton = "bg-[#6D54B5] hover:bg-[#5a45a0] text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-[#6D54B5]/30 transition hover:cursor-pointer disabled:opacity-60";
  const subtleButton = "border border-white/15 bg-white/5 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition hover:cursor-pointer disabled:opacity-60";
  const ghostButton = "text-sm text-white/80 hover:text-white underline underline-offset-4 hover:cursor-pointer disabled:opacity-60";

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
              description: data.user.description ?? "",
            });
          }
          const tasks: Array<Promise<unknown>> = [fetchSelfProfilePicture(), fetchDocsWithPictures({ silent: true })];
          const submissionsStatus = data.user?.admin_access ? "pending" : "all";
          tasks.push(fetchSubmissions(submissionsStatus));
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

  async function fetchSubmissions(status?: "pending" | "approved" | "rejected" | "all") {
    setSubmissionsLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_doc_submissions", status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error("fetchSubmissions error", err);
    } finally {
      setSubmissionsLoading(false);
    }
  }

  // Article creation now happens in the markdown editor screen (/admin/docs/new)

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

  async function handleReviewSubmission(submissionId: string, decision: "approve" | "reject") {
    setReviewing((s) => ({ ...s, [submissionId]: true }));
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review_doc_submission", submissionId, decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Review failed");
      } else {
        setSubmissions((subs) => subs.filter((s) => s.id !== submissionId));
        await fetchDocsWithPictures({ silent: true });
      }
    } catch (err) {
      console.error("review submission error", err);
      setError("Review failed");
    } finally {
      setReviewing((s) => ({ ...s, [submissionId]: false }));
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
        const initialEdits: Record<string, { username: string; email: string; name: string; password: string; admin_access: boolean; position: string; description: string }> = {};
        data.users.forEach((u: UserRow) => {
          initialEdits[u.id] = {
            username: u.username ?? "",
            email: u.email ?? "",
            name: u.name ?? "",
            password: "",
            admin_access: Boolean(u.admin_access),
            position: u.position ?? "",
            description: u.description ?? "",
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
        description: selfForm.description,
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
          description: data.user?.description ?? "",
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
        description: edit.description,
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
          description: newUser.description || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Create user failed");
      } else {
        setNewUser({ username: "", email: "", name: "", password: "", position: "", description: "" });
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
      <div className="min-h-screen flex items-center justify-center bg-[#0b0816] text-white">
        <div className="flex items-center gap-3 text-sm text-white/70">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
          Verifying session...
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0816] text-white">
        <div className="flex items-center gap-3 text-sm text-white/70">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
          Redirecting to admin login...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-w-screen overflow-hidden bg-[#0b0816] text-white">

      <Image
        src="/leadership-bg-new-2.jpg"
        alt="Admin background"
        fill
        className="absolute inset-0 object-cover opacity-30"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0816]/95 via-[#120d23]/90 to-[#0b0816]/96" />

      <div className="relative z-10 px-4 py-10 pt-[72px]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Carcino Fighters • Admin</p>
              <h1 className="text-3xl font-bold leading-tight">Command Center</h1>
              <p className="text-sm text-white/70">Manage articles, submissions, and your author profile in one glassy workspace.</p>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              {currentUser && (
                <div className="text-sm text-white/80 px-3 py-2 rounded-full border border-white/10 bg-white/5">{currentUser.email || currentUser.username || "user"}</div>
              )}
              <button
                className={subtleButton}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-lg shadow-red-900/30">
              {error}
            </div>
          )}

          <section className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${cardClass} p-6 flex flex-col gap-3`}>
              <div>
                <h2 className="font-semibold text-lg">Survivor Stories</h2>
                <p className="text-sm text-white/70">Publish and edit survivor stories as a society member.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  className={primaryButton}
                  onClick={() => router.push("/admin/survivor-stories")}
                >
                  Open survivor stories
                </button>
                <button
                  className={subtleButton}
                  onClick={() => router.push("/survivorstories")}
                >
                  View public stories
                </button>
              </div>
            </div>
          </section>

          <section className="mb-8 gap-4 flex flex-col">
            <div className={`${cardClass} p-6`}>
              <h2 className="font-semibold mb-3 text-lg">Your Account</h2>
              {!selfEditing ? (
                <div className="flex flex-col gap-3 text-sm text-white/80">
                  <div className="flex items-center gap-3">
                    {currentUser?.profilePicture ? (
                      <Image
                        src={currentUser.profilePicture}
                        alt="Your avatar"
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-white/20"
                        unoptimized
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-white/10" />
                    )}
                    {currentUser && (
                      <div className="flex flex-col text-xs text-white/70">
                        <label htmlFor="self-avatar" className="underline underline-offset-4 hover:text-white hover:cursor-pointer">Change photo</label>
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
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" aria-label="Uploading" />
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-white/50">Username</div>
                    <div className="font-medium break-words">{currentUser?.username || "—"}</div>
                  </div>
                  <div>
                    <div className="text-white/50">Email</div>
                    <div className="font-medium break-words">{currentUser?.email || "—"}</div>
                  </div>
                  <div>
                    <div className="text-white/50">Name</div>
                    <div className="font-medium break-words">{currentUser?.name || "—"}</div>
                  </div>
                  <div>
                    <div className="text-white/50">Author Description</div>
                    <div className="font-medium break-words whitespace-pre-wrap">{currentUser?.description || "—"}</div>
                  </div>
                  <button
                    className={`${primaryButton} mt-2 w-full sm:w-auto`}
                    onClick={() => setSelfEditing(true)}
                  >
                    Edit profile
                  </button>
                </div>
              ) : (
                <form className="flex flex-col gap-3" onSubmit={handleUpdateSelf}>
                  <input
                    className={inputClass}
                    placeholder="Username"
                    value={selfForm.username}
                    onChange={(e) => setSelfForm((s) => ({ ...s, username: e.target.value }))}
                  />
                  <input
                    className={inputClass}
                    placeholder="Email"
                    value={selfForm.email}
                    onChange={(e) => setSelfForm((s) => ({ ...s, email: e.target.value }))}
                  />
                  <input
                    className={inputClass}
                    placeholder="Name"
                    value={selfForm.name}
                    onChange={(e) => setSelfForm((s) => ({ ...s, name: e.target.value }))}
                  />
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="New password (optional)"
                    value={selfForm.password}
                    onChange={(e) => setSelfForm((s) => ({ ...s, password: e.target.value }))}
                  />
                  <textarea
                    className={textareaClass}
                    placeholder="Author Description"
                    value={selfForm.description}
                    onChange={(e) => setSelfForm((s) => ({ ...s, description: e.target.value }))}
                  />
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="submit"
                      className={primaryButton}
                      disabled={savingSelf}
                    >
                      {savingSelf ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      className={subtleButton}
                      onClick={() => {
                        if (currentUser) {
                          setSelfForm({
                            username: currentUser.username ?? "",
                            email: currentUser.email ?? "",
                            name: currentUser.name ?? "",
                            password: "",
                            description: currentUser.description ?? "",
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

            {currentUser && (
              <div className={`${cardClass} p-6`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg">Your submissions</h2>
                    <p className="text-sm text-white/70">Track article drafts and edits awaiting review.</p>
                  </div>
                  <button
                    className={ghostButton}
                    onClick={() => fetchSubmissions(currentUser.admin_access ? "pending" : "all")}
                    disabled={submissionsLoading}
                  >
                    {submissionsLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {submissionsLoading && submissions.length === 0 ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
                    Loading submissions...
                  </div>
                ) : submissions.filter(s => s.author_user_id === currentUser.id).length === 0 ? (
                  <div className="mt-3 text-sm text-white/60">No submissions yet.</div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {submissions
                      .filter(s => s.author_user_id === currentUser.id)
                      .map((s) => {
                        const statusColor = s.status === "approved" ? "bg-green-100 text-green-800" : s.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800";
                        const kind = s.doc_id ? "Edit" : "New";
                        const submittedAt = s.created_at ? new Date(s.created_at).toLocaleString() : "";
                        return (
                          <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>{s.status}</span>
                                  <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{kind}</span>
                                </div>
                                <div className="text-base font-semibold leading-snug">{s.title}</div>
                                <div className="text-sm text-muted-foreground">Slug: {s.slug}</div>
                                {submittedAt && <div className="text-xs text-muted-foreground">Submitted {submittedAt}</div>}
                              </div>
                              <div className="text-right text-sm text-white/70">
                                {s.author?.name || s.author?.username || s.author?.email || "You"}
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-white/70 line-clamp-3 whitespace-pre-line">{s.content}</div>
                            {s.status === "rejected" && s.reviewer_note && (
                              <div className="mt-2 rounded border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                                Rejected: {s.reviewer_note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {currentUser?.admin_access && (
              <div className={`${cardClass} p-6`}>
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
                    <h2 className="font-semibold text-lg">Users</h2>
                  </div>
                  <span className="text-sm text-white/70">{usersOpen ? "Hide" : "Show"}</span>
                </button>

                {usersOpen && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <input
                        className={inputClass}
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className={ghostButton}
                          onClick={fetchUsers}
                          disabled={loading}
                        >
                          Refresh
                        </button>
                      </div>
                    </div>

                    <div className="w-full overflow-auto">
                      <table className="w-full text-sm border border-white/10 rounded-2xl overflow-hidden bg-white/5 text-white/80">
                        <thead className="bg-white/10 text-white">
                          <tr>
                            <th className="p-3 text-left">Avatar</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Username</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Position</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-left">Admin</th>
                            <th className="p-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-white/10 bg-white/5">
                            <td className="p-3 align-top">
                              <div className="h-12 w-12 rounded-full bg-white/10" />
                            </td>
                            <td className="p-3 align-top">
                              <input
                                className={inputClass}
                                placeholder="Name"
                                value={newUser.name}
                                onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))}
                              />
                            </td>
                            <td className="p-3 align-top">
                              <input
                                className={inputClass}
                                placeholder="Username"
                                value={newUser.username}
                                onChange={(e) => setNewUser((s) => ({ ...s, username: e.target.value }))}
                              />
                            </td>
                            <td className="p-3 align-top">
                              <input
                                className={inputClass}
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                              />
                            </td>
                            <td className="p-3 align-top">
                              <input
                                className={inputClass}
                                placeholder="Position"
                                value={newUser.position}
                                onChange={(e) => setNewUser((s) => ({ ...s, position: e.target.value }))}
                              />
                            </td>
                            <td className="p-3 align-top">
                              <textarea
                                className={`${inputClass} min-h-[60px] text-xs`}
                                placeholder="Description"
                                value={newUser.description}
                                onChange={(e) => setNewUser((s) => ({ ...s, description: e.target.value }))}
                              />
                            </td>
                            <td className="p-3 align-top text-sm text-white/60">—</td>
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-2">
                                <input
                                  type="password"
                                  className={inputClass}
                                  placeholder="Password"
                                  value={newUser.password}
                                  onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                                />
                                <button
                                  className={primaryButton}
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
                              <tr key={u.id} className="border-t border-white/10">
                                <td className="p-3 align-top">
                                  <div className="flex items-center gap-3">
                                    {u.profilePicture ? (
                                      <Image src={u.profilePicture} alt="avatar" width={48} height={48} className="h-12 w-12 rounded-full object-cover ring-2 ring-white/15" unoptimized />
                                    ) : (
                                      <div className="h-12 w-12 rounded-full bg-white/10" />
                                    )}
                                    <div className="flex flex-col gap-1 text-xs text-white/70">
                                      <label htmlFor={`upload-${u.id}`} className="underline underline-offset-4 hover:text-white hover:cursor-pointer">Change photo</label>
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
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" aria-label="Uploading" />
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 align-top">
                                  <input
                                    className={inputClass}
                                    placeholder="Name"
                                    value={edit.name}
                                    onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, name: e.target.value } }))}
                                  />
                                </td>
                                <td className="p-3 align-top">
                                  <input
                                    className={inputClass}
                                    placeholder="Username"
                                    value={edit.username}
                                    onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, username: e.target.value } }))}
                                  />
                                </td>
                                <td className="p-3 align-top">
                                  <input
                                    className={inputClass}
                                    placeholder="Email"
                                    value={edit.email}
                                    onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, email: e.target.value } }))}
                                  />
                                </td>
                                <td className="p-3 align-top">
                                  <input
                                    className={inputClass}
                                    placeholder="Position"
                                    value={edit.position}
                                    onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, position: e.target.value } }))}
                                  />
                                </td>
                                <td className="p-3 align-top">
                                  <textarea
                                    className={`${inputClass} min-h-[60px] text-xs`}
                                    placeholder="Description"
                                    value={edit.description}
                                    onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, description: e.target.value } }))}
                                  />
                                </td>
                                <td className="p-3 align-top">
                                  <label className="flex items-center gap-2 text-sm text-white/80">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 accent-[#6D54B5]"
                                      checked={edit.admin_access}
                                      onChange={(e) => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, admin_access: e.target.checked } }))}
                                    />
                                    Admin
                                  </label>
                                </td>
                                <td className="p-3 align-top whitespace-nowrap text-white/90">
                                  <div className="flex gap-2 flex-wrap">
                                    <button
                                      className={primaryButton}
                                      onClick={() => handleUpdateUser(u.id)}
                                      disabled={savingUser[u.id]}
                                    >
                                      {savingUser[u.id] ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                      className={ghostButton}
                                      onClick={() => setUserEdits((s) => ({ ...s, [u.id]: { ...edit, password: "" } }))}
                                    >
                                      Clear password
                                    </button>
                                    <button
                                      className="text-sm text-red-300 underline underline-offset-4 hover:text-red-200"
                                      onClick={() => handleDeleteUser(u.id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                  <div className="mt-2">
                                    <input
                                      type="password"
                                      className={inputClass}
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
                              <td className="p-3 text-sm text-muted-foreground" colSpan={8}>No users found.</td>
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

          {currentUser?.admin_access && (
            <section className="mb-8 flex flex-col gap-3">
              <div className={`${cardClass} p-6`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg">Pending submissions</h2>
                    <p className="text-sm text-white/70">Approve or reject article edits and new drafts.</p>
                  </div>
                  <button
                    className={ghostButton}
                    onClick={() => fetchSubmissions()}
                    disabled={submissionsLoading}
                  >
                    {submissionsLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {submissionsLoading && submissions.length === 0 ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
                    Loading submissions...
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="mt-3 text-sm text-white/60">No pending submissions.</div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {submissions.map((s) => {
                      const authorLabel = s.author?.name || s.author?.username || s.author?.email || "Unknown";
                      const submittedAt = s.created_at ? new Date(s.created_at).toLocaleString() : "";
                      const kind = s.doc_id ? "Edit" : "New";
                      const isOwn = s.author_user_id === currentUser?.id;
                      return (
                        <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="text-xs uppercase tracking-[0.12em] text-white/60">{kind} submission</div>
                              <div className="text-base font-semibold leading-snug">{s.title}</div>
                              <div className="text-sm text-white/70">Slug: {s.slug}</div>
                              <div className="text-xs text-white/60">From: {authorLabel}</div>
                              {submittedAt && <div className="text-xs text-white/60">Submitted {submittedAt}</div>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {isOwn ? (
                                <span className="text-xs text-white/50 italic self-center px-3">Cannot review own submission</span>
                              ) : (
                                <>
                                  <button
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-lg shadow-md hover:cursor-pointer disabled:opacity-60"
                                    onClick={() => handleReviewSubmission(s.id, "approve")}
                                    disabled={Boolean(reviewing[s.id])}
                                  >
                                    {reviewing[s.id] ? "Approving..." : "Approve"}
                                  </button>
                                  <button
                                    className={subtleButton}
                                    onClick={() => handleReviewSubmission(s.id, "reject")}
                                    disabled={Boolean(reviewing[s.id])}
                                  >
                                    {reviewing[s.id] ? "Working..." : "Reject"}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-white/70 line-clamp-3 whitespace-pre-line">{s.content}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          <CancerDocsPanel
            docs={docs}
            currentUser={currentUser}
            onDelete={handleDelete}
            users={users}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
