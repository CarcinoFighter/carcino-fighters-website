"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";
import { ProfilePictureEditor } from "@/components/admin/pfp-cropper";
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

  type PublicUserRow = {
    id: string;
    username: string | null;
    email: string | null;
    name: string | null;
    bio: string | null;
    avatar_url: string | null;
    is_employee?: boolean;
    employee_id?: string;
    created_at?: string;
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
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [croppingUserId, setCroppingUserId] = useState<string | null>(null);
  const [lastResponseDebug, setLastResponseDebug] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [publicUsers, setPublicUsers] = useState<PublicUserRow[]>([]);
  const [publicUsersOpen, setPublicUsersOpen] = useState(false);
  const [publicUsersLoading, setPublicUsersLoading] = useState(false);
  const [selfForm, setSelfForm] = useState({ username: "", email: "", name: "", password: "", description: "" });
  const [userEdits, setUserEdits] = useState<Record<string, { username: string; email: string; name: string; password: string; admin_access: boolean; position: string; description: string }>>({});
  const [publicUserEdits, setPublicUserEdits] = useState<Record<string, { username: string; email: string; name: string; bio: string; password: string }>>({});
  const [savingSelf, setSavingSelf] = useState(false);
  const [savingUser, setSavingUser] = useState<Record<string, boolean>>({});
  const [savingPublicUser, setSavingPublicUser] = useState<Record<string, boolean>>({});
  const [selfEditing, setSelfEditing] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [publicUserSearch, setPublicUserSearch] = useState("");
  const [newUser, setNewUser] = useState({ username: "", email: "", name: "", password: "", position: "", description: "" });
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [reviewing, setReviewing] = useState<Record<string, boolean>>({});
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedPublicUserId, setExpandedPublicUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"action-centre" | "articles" | "survivors">("articles");

  const cardClass = "rounded-[44px] border border-white/10 bg-white/0 backdrop-blur shadow-2xl";
  const inputClass = "bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#6D54B5]";
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
            setActiveTab(data.user.admin_access ? "action-centre" : "articles");
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
            tasks.push(fetchPublicUsers());
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

      // Use server-side API to update metadata to avoid RLS issues on metadata table
      const metaRes = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_pfp",
          targetUserId: userId,
          object_key: path,
          content_type: file.type,
          size: file.size,
        }),
      });
      const metaData = await metaRes.json().catch(() => ({}));
      setLastResponseDebug((p) => `${p}\nMETA_RES:\n${JSON.stringify(metaData, null, 2)}`);
      if (!metaRes.ok) throw new Error(metaData.error || "Failed to update metadata");

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

  async function fetchPublicUsers() {
    setPublicUsersLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_public_users" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.users)) {
        setPublicUsers(data.users);
        const initialEdits: Record<string, { username: string; email: string; name: string; bio: string; password: string }> = {};
        data.users.forEach((u: PublicUserRow) => {
          initialEdits[u.id] = {
            username: u.username ?? "",
            email: u.email ?? "",
            name: u.name ?? "",
            bio: u.bio ?? "",
            password: "",
          };
        });
        setPublicUserEdits(initialEdits);
      } else if (!res.ok) {
        setError(data?.error || "Failed to load public users");
      }
    } catch (err) {
      console.error("fetchPublicUsers error", err);
      setError("Failed to load public users");
    } finally {
      setPublicUsersLoading(false);
    }
  }

  async function handleUpdatePublicUser(userId: string) {
    setSavingPublicUser((s) => ({ ...s, [userId]: true }));
    setError("");
    const edit = publicUserEdits[userId];
    if (!edit) {
      setSavingPublicUser((s) => ({ ...s, [userId]: false }));
      return;
    }
    try {
      const body: Record<string, unknown> = {
        action: "update_public_user",
        targetUserId: userId,
        username: edit.username,
        email: edit.email,
        name: edit.name,
        bio: edit.bio,
      };
      if (edit.password) body.password = edit.password;

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Update failed");
      } else {
        await fetchPublicUsers();
      }
    } catch (err) {
      console.error("update public user error", err);
      setError("Update failed");
    } finally {
      setSavingPublicUser((s) => ({ ...s, [userId]: false }));
    }
  }

  async function handleDeletePublicUser(userId: string) {
    setError("");
    if (!confirm("Delete this public user?")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_public_user", targetUserId: userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Delete failed");
      } else {
        await fetchPublicUsers();
      }
    } catch (err) {
      setError("Delete failed");
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

  const filteredPublicUsers = useMemo(() => {
    const term = publicUserSearch.toLowerCase().trim();
    if (!term) return publicUsers;
    return publicUsers.filter((u) =>
      [u.name, u.username, u.email, u.bio]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [publicUserSearch, publicUsers]);

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
    <div className="relative min-h-screen min-w-screen overflow-hidden bg-[#2A292F] text-white">
      {/* Blog-style Radial Gradients */}
      <div
        style={{
          position: "absolute",
          left: -800,
          top: -700,
          width: 1600,
          height: 1600,
          borderRadius: "50%",
          background: `radial-gradient(circle, #D5B0FF26 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="max-md:hidden"
        style={{
          position: "absolute",
          right: -900,
          top: -300,
          width: 1800,
          height: 1800,
          borderRadius: "50%",
          background: `radial-gradient(circle, #D5B0FF26 0%, transparent 50%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -600,
          bottom: -1200,
          width: 1800,
          height: 1800,
          borderRadius: "50%",
          background: `radial-gradient(circle, #471F7733 0%, transparent 60%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 px-4 py-10 pt-[72px]">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Center-aligned Premium Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold leading-tight font-wintersolace text-white py-2">
                Admin Dashboard
              </h1>
              <p className="text-xl text-white/50 font-dmsans max-w-2xl mx-auto">
                The place where <span className="text-white font-semibold">YOU</span> can bring a change through research and storytelling.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4"
            >
              <button
                className="relative px-6 py-2.5 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 font-medium group"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <span className="relative z-10 text-white/90 text-sm">
                  {loggingOut ? "Logging out..." : "Logout"}
                </span>
                <div className="absolute inset-0 border border-white/10 rounded-full group-hover:border-white/20 transition-colors" />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          </div>

          {error && (
            <div className="mb-6 rounded-[44px] border border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-200 backdrop-blur-xl">
              {error}
            </div>
          )}

          {/* GitHub Style Tabs */}
          <div className="flex items-center gap-1 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
            {currentUser?.admin_access && (
              <button
                onClick={() => setActiveTab("action-centre")}
                className={`relative px-4 py-3 text-sm font-medium transition-all ${activeTab === "action-centre" ? "text-white" : "text-white/50 hover:text-white/80"}`}
              >
                Action Centre
                {activeTab === "action-centre" && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            )}
            <button
              onClick={() => setActiveTab("articles")}
              className={`relative px-4 py-3 text-sm font-medium transition-all ${activeTab === "articles" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              Articles
              {activeTab === "articles" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("survivors")}
              className={`relative px-4 py-3 text-sm font-medium transition-all ${activeTab === "survivors" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              Survivors
              {activeTab === "survivors" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "action-centre" && currentUser?.admin_access && (
              <div className="space-y-8">
                {/* Pending Submissions */}
                <section className="flex flex-col gap-4">
                  <div className={`${cardClass} p-8 relative overflow-hidden`}>
                    <div className="glass-noise" />
                    <div className="cardGlass-borders" />
                    <div className="cardGlass-tint" />
                    <div className="cardGlass-shine pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold font-wintersolace">Pending Submissions</h2>
                          <p className="text-sm text-white/50 mt-1">Review and approve content from authors.</p>
                        </div>
                        <button
                          className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest font-bold"
                          onClick={() => fetchSubmissions()}
                          disabled={submissionsLoading}
                        >
                          {submissionsLoading ? "Refreshing..." : "Refresh"}
                        </button>
                      </div>

                      {submissionsLoading && submissions.length === 0 ? (
                        <div className="flex items-center gap-3 text-sm text-white/40 py-8 justify-center">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          Scanning database...
                        </div>
                      ) : submissions.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-white/30 italic text-sm">Action centre is clear. No pending reviews.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {submissions.map((s) => {
                            const authorLabel = s.author?.name || s.author?.username || s.author?.email || "Unknown";
                            const kind = s.doc_id ? "Edit" : "New";
                            const isOwn = s.author_user_id === currentUser?.id;
                            return (
                              <div key={s.id} className="relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold uppercase tracking-wider">{kind}</span>
                                      <span className="text-[10px] text-white/30 uppercase tracking-widest">Author: {authorLabel}</span>
                                    </div>
                                    <h3 className="text-lg font-bold">{s.title}</h3>
                                    <p className="text-sm text-white/50 line-clamp-1">{s.content}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {isOwn ? (
                                      <span className="text-xs text-white/30 italic">Self-review restricted</span>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => handleReviewSubmission(s.id, "approve")}
                                          disabled={Boolean(reviewing[s.id])}
                                          className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-all"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleReviewSubmission(s.id, "reject")}
                                          disabled={Boolean(reviewing[s.id])}
                                          className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Employee Management Section */}
                <div className={`${cardClass} p-8 relative overflow-hidden`}>
                  <div className="glass-noise" />
                  <div className="cardGlass-borders" />
                  <div className="cardGlass-tint" />
                  <div className="cardGlass-shine pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold font-wintersolace">Employee Management</h2>
                        <p className="text-sm text-white/50 mt-1">Manage society members and their administrative roles.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          className={`${inputClass} !rounded-full !px-6 !py-2.5 !bg-black/20 w-64`}
                          placeholder="Filter database..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex">
                          <button
                            className="relative px-5 py-2.5 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300"
                            onClick={() => setShowAddEmployee((v) => !v)}
                          >
                            <span className="relative z-10 flex items-center gap-2 text-white text-sm font-medium">
                              {showAddEmployee ? "Cancel" : "Add Employee"}
                            </span>
                            {/* Liquid glass layers */}
                            <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                            <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                          </button>
                        </motion.div>
                      </div>
                    </div>

                    {showAddEmployee && (
                      <div className="mb-10 p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Name</label><input className={`${inputClass} w-full`} placeholder="Full name" value={newUser.name} onChange={(e) => setNewUser(s => ({ ...s, name: e.target.value }))} /></div>
                          <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Username</label><input className={`${inputClass} w-full`} placeholder="@username" value={newUser.username} onChange={(e) => setNewUser(s => ({ ...s, username: e.target.value }))} /></div>
                          <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Email</label><input className={`${inputClass} w-full`} placeholder="email@example.com" value={newUser.email} onChange={(e) => setNewUser(s => ({ ...s, email: e.target.value }))} /></div>
                          <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Password</label><input type="password" className={`${inputClass} w-full`} placeholder="Password" value={newUser.password} onChange={(e) => setNewUser(s => ({ ...s, password: e.target.value }))} /></div>
                        </div>
                        <button className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all" onClick={async () => { await handleCreateUser(); setShowAddEmployee(false); }}>Register Employee</button>
                      </div>
                    )}

                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left py-4 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">Contributor</th>
                            <th className="text-left py-4 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">Role</th>
                            <th className="text-center py-4 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">Access</th>
                            <th className="text-right py-4 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u) => {
                            const isExpanded = expandedUserId === u.id;
                            const edit = userEdits[u.id] ?? {};
                            return (
                              <React.Fragment key={u.id}>
                                <tr className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${isExpanded ? 'bg-white/[0.02]' : ''}`} onClick={() => setExpandedUserId(isExpanded ? null : u.id)}>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-4">
                                      <div className="group/avatar relative h-10 w-10 rounded-full bg-white/5 border border-white/10 overflow-hidden ring-4 ring-white/[0.02] cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        {u.profilePicture ? (
                                          <img src={u.profilePicture} className="w-full h-full object-cover transition-transform group-hover/avatar:scale-110" alt="" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/20">
                                            {u.name?.[0] || u.username?.[0] || "?"}
                                          </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                              const f = e.target.files?.[0];
                                              if (f) {
                                                setCroppingUserId(u.id);
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                  setCroppingImage(ev.target?.result as string);
                                                };
                                                reader.readAsDataURL(f);
                                              }
                                            }}
                                          />
                                          <div className="text-[8px] font-black uppercase tracking-tighter text-white">Edit</div>
                                        </label>
                                      </div>
                                      <div>
                                        <div className="font-bold text-white/90">{u.name || u.username}</div>
                                        <div className="text-[10px] text-white/40 lowercase">{u.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-white/60">{u.position || "Staff"}</td>
                                  <td className="py-4 px-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${u.admin_access ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-white/30'}`}>
                                      {u.admin_access ? "Admin" : "Standard"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right group-hover:text-white transition-all text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                    {isExpanded ? "Close" : "Modify"}
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr>
                                    <td colSpan={4} className="p-6 bg-white/[0.01] border-b border-white/5">
                                      <div className="grid grid-cols-2 gap-6 max-w-4xl">
                                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Update Name</label><input className={`${inputClass} w-full`} value={edit.name} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, name: e.target.value } }))} /></div>
                                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Assign Position</label><input className={`${inputClass} w-full`} value={edit.position} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, position: e.target.value } }))} /></div>
                                        <div className="space-y-1.5 flex items-center gap-4 pb-2 pt-4">
                                          <input type="checkbox" id={`admin-${u.id}`} className="accent-purple-500 h-4 w-4" checked={edit.admin_access} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, admin_access: e.target.checked } }))} />
                                          <label htmlFor={`admin-${u.id}`} className="text-xs font-bold uppercase tracking-widest text-white/80 cursor-pointer">Grant Admin Authorization</label>
                                        </div>
                                        <div className="flex justify-end gap-3 items-center">
                                          <button onClick={() => handleDeleteUser(u.id)} className="text-xs font-bold text-red-400/60 hover:text-red-400 transition-colors uppercase tracking-widest mr-4">Purge User</button>
                                          <button onClick={() => handleUpdateUser(u.id)} disabled={Boolean(savingUser[u.id])} className="px-6 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-all">{savingUser[u.id] ? "Saving..." : "Apply Changes"}</button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Public Users Table */}
                <div className={`${cardClass} p-8 relative overflow-hidden`}>
                  <div className="glass-noise" />
                  <div className="cardGlass-borders" />
                  <div className="cardGlass-tint" />
                  <div className="cardGlass-shine pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold font-wintersolace">Public Community</h2>
                        <p className="text-sm text-white/50 mt-1">Monitor registered community members and subscribers.</p>
                      </div>
                      <input
                        className={`${inputClass} !rounded-full !px-6 !py-2.5 !bg-black/20 w-64`}
                        placeholder="Search community..."
                        value={publicUserSearch}
                        onChange={(e) => setPublicUserSearch(e.target.value)}
                      />
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left py-4 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">Display Profile</th>
                            <th className="text-center py-4 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">Community Role</th>
                            <th className="text-right py-4 px-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPublicUsers.map((u) => {
                            const isExpanded = expandedPublicUserId === u.id;
                            return (
                              <React.Fragment key={u.id}>
                                <tr className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${isExpanded ? 'bg-white/[0.02]' : ''}`} onClick={() => setExpandedPublicUserId(isExpanded ? null : u.id)}>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 overflow-hidden ring-4 ring-white/[0.02]">
                                        {u.avatar_url && <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />}
                                      </div>
                                      <div>
                                        <div className="font-bold text-white/90">{u.name || u.username || "Anonymous User"}</div>
                                        <div className="text-[10px] text-white/40 lowercase">{u.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    {u.is_employee ? (
                                      <span className="px-2 py-0.5 rounded text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black uppercase tracking-wider">Employee</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[8px] bg-white/5 text-white/30 font-black uppercase tracking-wider">Public</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-right group-hover:text-white transition-all text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                    {isExpanded ? "Close" : "Control"}
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr>
                                    <td colSpan={3} className="p-6 bg-white/[0.01] border-b border-white/5">
                                      <div className="flex justify-start gap-4">
                                        <button onClick={() => handleDeletePublicUser(u.id)} className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all uppercase tracking-widest">Suspend Account</button>
                                        <div className="flex-1" />
                                        <p className="text-[10px] text-white/20 italic self-center">Registered on {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown date'}</p>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "articles" && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold font-wintersolace">Research Articles</h2>
                    <p className="text-sm text-white/50 mt-1">Manage our growing database of cancer research and information.</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex"
                  >
                    <button
                      className="relative px-6 py-3 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 group"
                      onClick={() => router.push("/admin/docs/new")}
                    >
                      <span className="relative z-10 flex items-center gap-2 text-white font-medium">
                        + Add New Article
                      </span>
                      {/* Liquid glass layers */}
                      <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                      <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                    </button>
                  </motion.div>
                </div>

                <CancerDocsPanel
                  docs={currentUser?.admin_access ? docs : docs.filter(d => d.author_user_id === currentUser?.id)}
                  currentUser={currentUser}
                  onDelete={handleDelete}
                  users={users}
                  loading={loading}
                />
              </div>
            )}

            {activeTab === "survivors" && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold font-wintersolace">Survivor Stories</h2>
                    <p className="text-sm text-white/50 mt-1">Publish and manage narratives of resilience and hope.</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex"
                  >
                    <button
                      className="relative px-6 py-3 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300"
                      onClick={() => router.push("/admin/survivor-stories")}
                    >
                      <span className="relative z-10 flex items-center gap-2 text-white font-medium">
                        + Post Survivor Story
                      </span>
                      {/* Liquid glass layers */}
                      <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                      <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                    </button>
                  </motion.div>
                </div>

                {/* Survivor stories list simplified for the dashboard view */}
                <div className="grid grid-cols-1 gap-4">
                  <div className={`${cardClass} p-8 text-center py-20 relative overflow-hidden`}>
                    <div className="glass-noise" />
                    <div className="cardGlass-borders" />
                    <div className="cardGlass-tint" />
                    <div className="cardGlass-shine pointer-events-none" />

                    <div className="relative z-10 max-w-md mx-auto space-y-4">
                      <h3 className="text-xl font-bold font-wintersolace">Survivor Stories Hub</h3>
                      <p className="text-sm text-white/50">To manage the full collection of survivor stories, visit our dedicated storytelling workspace.</p>
                      <button
                        className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all uppercase tracking-widest"
                        onClick={() => router.push("/admin/survivor-stories")}
                      >
                        Enter Storytelling Lab
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {croppingImage && (
          <ProfilePictureEditor
            imageSrc={croppingImage}
            onCrop={(file) => {
              handleUpload(file, croppingUserId || currentUser?.id);
              setCroppingImage(null);
              setCroppingUserId(null);
            }}
            onCancel={() => {
              setCroppingImage(null);
              setCroppingUserId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
