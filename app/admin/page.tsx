"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FileText,
  Heart,
  MessageSquare,
  Zap
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { ProfilePictureEditor } from "@/components/admin/pfp-cropper";
import { AdminContentPanel } from "@/components/admin/admin-content-panel";
import { DynamicBackgroundHues } from "@/components/ui/dynamic-background-hues";
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
    department?: string | null;
    description?: string | null;
    profilePicture?: string | null;
    is_legacy?: boolean | null;
    is_banned?: boolean | null;
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
    is_banned?: boolean;
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
    doc_id?: string | null;
    story_id?: string | null;
    blog_id?: string | null;
    slug: string;
    title: string;
    content: string | null;
    image_url?: string | null;
    colour?: string | null;
    tags?: any;
    author_user_id?: string;
    user_id?: string;
    status: "pending" | "approved" | "rejected";
    reviewer_user_id?: string | null;
    reviewer_note?: string | null;
    created_at?: string;
    updated_at?: string;
    contentType?: "articles" | "stories" | "blogs";
    author?: {
      name: string | null;
      username: string | null;
      email: string | null;
      position?: string | null;
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
  const [selfForm, setSelfForm] = useState({ username: "", email: "", name: "", password: "", description: "", department: "" });
  const [userEdits, setUserEdits] = useState<Record<string, { username: string; email: string; name: string; password: string; admin_access: boolean; position: string; description: string; department: string; is_legacy: boolean; is_banned: boolean }>>({});
  const [publicUserEdits, setPublicUserEdits] = useState<Record<string, { username: string; email: string; name: string; bio: string; password: string; is_banned: boolean }>>({});
  const [savingSelf, setSavingSelf] = useState(false);
  const [savingUser, setSavingUser] = useState<Record<string, boolean>>({});
  const [savingPublicUser, setSavingPublicUser] = useState<Record<string, boolean>>({});
  const [selfEditing, setSelfEditing] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [publicUserSearch, setPublicUserSearch] = useState("");
  const [newUser, setNewUser] = useState({ username: "", email: "", name: "", password: "", position: "", description: "", department: "" });
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [reviewing, setReviewing] = useState<Record<string, boolean>>({});
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedPublicUserId, setExpandedPublicUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "action-centre" | "articles" | "blogs" | "survivors" | "system"
  >("action-centre");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [systemCheckResults, setSystemCheckResults] = useState<any>(null);
  const [systemCheckLoading, setSystemCheckLoading] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState<"articles" | "stories" | "blogs">("articles"); // Keeping for internal logic if needed, but UI tabs are removed
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cardClass = "rounded-[44px] border border-white/10 shadow-2xl transition-all duration-500 overflow-hidden isolation-isolate group/card admin-card";
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
              department: data.user.department ?? "",
            });
          }
          const tasks: Array<Promise<unknown>> = [fetchSelfProfilePicture(), fetchDocsWithPictures({ silent: true })];
          const submissionsStatus = data.user?.admin_access ? "pending" : "all";
          tasks.push(fetchSubmissions(submissionsStatus));
          if (data.user?.admin_access) {
            tasks.push(fetchUsers());
            tasks.push(fetchPublicUsers());
            tasks.push(fetchSiteSettings());
          }
          await Promise.all(tasks);
          setLoading(false);
        } else {
          setUnlocked(false);
          router.replace("/sign-in?redirectTo=/admin");
        }
      } catch (err) {
        console.error("checkSession error", err);
        setUnlocked(false);
        router.replace("/sign-in?redirectTo=/admin");
      } finally {
        setVerifying(false);
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (activeTab === "articles") fetchDocsWithPictures({ silent: true });
    if (activeTab === "blogs") fetchBlogs({ silent: true });
    if (activeTab === "survivors") fetchStories({ silent: true });
    if (activeTab === "action-centre" && currentUser?.admin_access) fetchUsers();
  }, [activeTab]);

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

  async function fetchBlogs(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_blogs" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to load blogs");
        setBlogs([]);
        return;
      }
      setBlogs(data.blogs ?? []);
    } catch (err) {
      console.error("fetchBlogs error", err);
      setError("Failed to load blogs");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }

  async function fetchStories(opts?: { silent?: boolean }) {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_stories" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to load stories");
        setStories([]);
        return;
      }
      setStories(data.stories ?? []);
    } catch (err) {
      console.error("fetchStories error", err);
      setError("Failed to load stories");
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

  async function fetchSubmissions(status: "pending" | "approved" | "rejected" | "all" = "pending") {
    setSubmissionsLoading(true);
    try {
      const fetchType = async (type: "articles" | "stories" | "blogs") => {
        const actionMap = {
          articles: "list_doc_submissions",
          stories: "list_story_submissions",
          blogs: "list_blog_submissions"
        };
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: actionMap[type], status }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data.submissions)) {
          return data.submissions.map((s: any) => ({ ...s, contentType: type }));
        }
        return [];
      };

      const results = await Promise.all([
        fetchType("articles"),
        fetchType("stories"),
        fetchType("blogs")
      ]);

      const allSubmissions = results.flat().sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Newest first
      });

      setSubmissions(allSubmissions);
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

      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("targetUserId", userId);

      const res = await fetch("/api/admin", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      setLastResponseDebug((p) => `${p || ""}\nUPLOAD_RES:\n${JSON.stringify(data, null, 2)}`);

      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      const url = data.avatar_url || null;

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

  async function handleDeleteContent(id: string, type: "articles" | "blogs" | "survivors") {
    const labels = { articles: "article", blogs: "blog post", survivors: "survivor story" };
    if (!confirm(`Are you sure you want to hide this ${labels[type]}? It will no longer be visible to the public.`)) return;

    setLoading(true);
    try {
      const actionMap = {
        articles: "delete_doc",
        blogs: "delete_blog",
        survivors: "delete_story"
      };

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionMap[type],
          docId: type === "articles" ? id : undefined,
          blogId: type === "blogs" ? id : undefined,
          storyId: type === "survivors" ? id : undefined
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || `Delete failed for ${type}`);
      } else {
        if (type === "articles") await fetchDocsWithPictures({ silent: true });
        if (type === "blogs") await fetchBlogs({ silent: true });
        if (type === "survivors") await fetchStories({ silent: true });
      }
    } catch (err) {
      console.error(`delete ${type} error`, err);
      setError(`Delete failed for ${type}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewSubmission(type: "articles" | "stories" | "blogs", submissionId: string, decision: "approve" | "reject") {
    setReviewing((s) => ({ ...s, [submissionId]: true }));
    try {
      const actionMap = {
        articles: "review_doc_submission",
        stories: "review_story_submission",
        blogs: "review_blog_submission"
      };

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionMap[type], submissionId, decision }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Review failed");
      } else {
        setSubmissions((subs) => subs.filter((s) => s.id !== submissionId));
        if (type === "articles") {
          await fetchDocsWithPictures({ silent: true });
        }
      }
    } catch (err) {
      console.error("review submission error", err);
      setError("Review failed");
    } finally {
      setReviewing((s) => ({ ...s, [submissionId]: false }));
    }
  }

  async function fetchSiteSettings() {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_site_settings" }),
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        const maint = data.settings.find((s: any) => s.key === "maintenance_mode");
        if (maint) {
          setMaintenanceMode(maint.value?.enabled ?? false);
        }
      }
    } catch (err) {
      console.error("fetchSiteSettings error", err);
    }
  }

  async function toggleMaintenanceMode() {
    setMaintenanceLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_site_settings",
          key: "maintenance_mode",
          value: { enabled: !maintenanceMode }
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMaintenanceMode(!maintenanceMode);
      } else {
        setError(data.error || "Failed to update maintenance mode");
      }
    } catch (err) {
      console.error("toggleMaintenanceMode error", err);
      setError("Failed to update maintenance mode");
    } finally {
      setMaintenanceLoading(false);
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
      router.replace("/sign-in?redirectTo=/admin");
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
        const initialEdits: Record<string, { username: string; email: string; name: string; password: string; admin_access: boolean; position: string; description: string; department: string; is_legacy: boolean; is_banned: boolean }> = {};
        data.users.forEach((u: UserRow) => {
          initialEdits[u.id] = {
            username: u.username ?? "",
            email: u.email ?? "",
            name: u.name ?? "",
            password: "",
            admin_access: Boolean(u.admin_access),
            position: u.position ?? "",
            description: u.description ?? "",
            department: u.department ?? "",
            is_legacy: Boolean(u.is_legacy),
            is_banned: Boolean(u.is_banned),
          };
        });
        setUserEdits(initialEdits as any);
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
        const initialEdits: Record<string, { username: string; email: string; name: string; bio: string; password: string; is_banned: boolean }> = {};
        data.users.forEach((u: PublicUserRow) => {
          initialEdits[u.id] = {
            username: u.username ?? "",
            email: u.email ?? "",
            name: u.name ?? "",
            bio: u.bio ?? "",
            password: "",
            is_banned: Boolean(u.is_banned),
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
        is_banned: edit.is_banned,
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
        department: selfForm.department,
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
          department: data.user?.department ?? "",
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
        department: edit.department,
        is_banned: edit.is_banned,
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
          department: newUser.department || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Create user failed");
      } else {
        setNewUser({ username: "", email: "", name: "", password: "", position: "", description: "", department: "" });
        await fetchUsers();
      }
    } catch (err) {
      console.error("create user error", err);
      setError("Create user failed");
    }
  }

  async function handleDeleteUser(userId: string) {
    setError("");
    if (!confirm("Are you sure you want to purge this user? They will be moved to legacy writers and lose admin access.")) return;
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
      [u.name, u.username, u.email, u.position, u.department]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [userSearch, users]);

  const activeFilteredUsers = useMemo(() => filteredUsers.filter((u) => !u.is_legacy), [filteredUsers]);
  const legacyFilteredUsers = useMemo(() => filteredUsers.filter((u) => u.is_legacy), [filteredUsers]);

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
    <div ref={containerRef} className="relative min-h-screen min-w-screen overflow-hidden bg-[#2A292F] text-white">
      <DynamicBackgroundHues containerRef={containerRef} />

      <div className="relative z-10 px-4 py-10 pt-24 md:pt-36">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Center-aligned Premium Header */}
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl leading-tight font-wintersolace text-white py-4">
                Admin Dashboard
              </h1>
              <p className="text-lg md:text-xl text-white/50 font-dmsans max-w-2xl mx-auto">
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
              onClick={() => setActiveTab("blogs")}
              className={`relative px-4 py-3 text-sm font-medium transition-all ${activeTab === "blogs" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              Blogs
              {activeTab === "blogs" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("survivors")}
              className={`relative px-4 py-3 text-sm font-medium transition-all ${activeTab === "survivors" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              Stories
              {activeTab === "survivors" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
            {currentUser?.admin_access && (
              <button
                onClick={() => setActiveTab("system")}
                className={`relative px-4 py-3 text-sm font-medium transition-all ${activeTab === "system" ? "text-white" : "text-white/50 hover:text-white/80"}`}
              >
                System
                {activeTab === "system" && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "action-centre" && currentUser?.admin_access && (
                <div className="space-y-10">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        label: "Pending Reviews",
                        value: submissions.length,
                        icon: Clock,
                        color: "text-amber-400",
                        bg: "bg-amber-400/10",
                        description: "Awaiting administrative action"
                      },
                      {
                        label: "Society Members",
                        value: users.filter(u => !u.is_legacy).length,
                        icon: Users,
                        color: "text-purple-400",
                        bg: "bg-purple-400/10",
                        description: "Active employees & contributors"
                      },
                      {
                        label: "Community",
                        value: publicUsers.length,
                        icon: Globe,
                        color: "text-emerald-400",
                        bg: "bg-emerald-400/10",
                        description: "Registered public accounts"
                      }
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${cardClass} p-8 group relative`}
                      >
                        <div className="cardGlass-tint" />
                        <div className="glass-noise" />
                        <div className="cardGlass-borders pointer-events-none" />
                        <div className="cardGlass-shine pointer-events-none" />
                        <div className="relative z-10 flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{stat.label}</p>
                            <h3 className="text-4xl font-tttravelsnext font-bold">{stat.value}</h3>
                            <p className="text-xs text-white/30 font-dmsans mt-2">{stat.description}</p>
                          </div>
                          <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon size={24} strokeWidth={1.5} />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent group-hover:w-full transition-all duration-700" />
                      </motion.div>
                    ))}
                  </div>

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
                            <h2 className="text-xl font-wintersolace">Pending Submissions</h2>
                            <p className="text-sm text-white/50 mt-1">Review and approve content from authors.</p>
                          </div>
                        </div>
                        <button
                          className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest font-bold"
                          onClick={() => fetchSubmissions("pending")}
                          disabled={submissionsLoading}
                        >
                          {submissionsLoading ? "Refreshing..." : "Refresh"}
                        </button>
                      </div>



                      {submissionsLoading && submissions.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-16 justify-center">
                          <div className="relative">
                            <div className="h-16 w-16 animate-spin rounded-full border-2 border-white/5 border-t-purple-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Zap size={20} className="text-purple-400 animate-pulse" />
                            </div>
                          </div>
                          <div className="space-y-1 text-center">
                            <p className="text-sm font-bold text-white/80 uppercase tracking-widest">Scanning Data Vault</p>
                            <p className="text-xs text-white/30">Retrieving latest submissions from the network...</p>
                          </div>
                        </div>
                      ) : submissions.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-20 text-center">
                          <div className="h-16 w-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/10">
                            <ShieldCheck size={32} strokeWidth={1} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-white/60 uppercase tracking-widest">Safe & Secure</p>
                            <p className="text-xs text-white/40 italic">Action centre is clear. All pending reviews processed.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {submissions.map((s, idx) => {
                            const type = s.contentType || "articles";
                            const isNew = type === "articles" ? !s.doc_id : type === "stories" ? !s.story_id : !s.blog_id;
                            const kind = isNew ? "New Submission" : "Update Request";
                            const authorLabel = type === "articles" ? (s.author?.name || s.author?.username || "Researcher") : (s.author?.name || s.author?.username || "Contributor");
                            const isOwn = currentUser && (type === "articles" ? s.author_user_id === currentUser.id : s.user_id === currentUser.id);

                            const TabIcon = type === "articles" ? FileText : type === "stories" ? Heart : MessageSquare;

                            return (
                              <motion.div
                                layout
                                key={s.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group/card relative overflow-hidden rounded-[44px] border border-white/5 p-6 hover:bg-white/[0.04] transition-all duration-300 isolation-isolate admin-card"
                                style={{ "--card-radius": "44px" } as React.CSSProperties}
                            >
                                <div className="cardGlass-tint" />
                                <div className="glass-noise" />
                                <div className="cardGlass-borders pointer-events-none" />
                                <div className="cardGlass-shine pointer-events-none" />
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                  <div className="flex gap-5">
                                    <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center bg-white/5 text-white/40 border border-white/5 group-hover:bg-purple-500/10 group-hover:text-purple-400 group-hover:border-purple-500/20 transition-all duration-500`}>
                                      <TabIcon size={22} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-black uppercase tracking-wider ${isNew ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                          {kind}
                                        </span>
                                        <span className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-medium">By {authorLabel}</span>
                                        {s.created_at && (
                                          <span className="text-[10px] text-white/20">
                                            • {new Date(s.created_at).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                      <h3 
                                        className="text-lg font-bold text-white/90 transition-colors group-hover/card:text-[var(--hover-heading-color)]"
                                        style={type === "articles" ? { "--hover-heading-color": (s.colour || "#d8b4fe") } as React.CSSProperties : {}}
                                      >
                                        {s.title}
                                      </h3>
                                      <p className="text-sm text-white/40 line-clamp-1 group-hover:text-white/60 transition-colors">{s.content}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 self-end md:self-center">
                                    {isOwn ? (
                                      <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-white/20" />
                                        <span className="text-xs text-white/30 font-medium italic">Self-review restricted</span>
                                      </div>
                                    ) : (
                                      <>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleReviewSubmission(type, s.id, "reject")}
                                          disabled={Boolean(reviewing[s.id])}
                                          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400/60 hover:text-red-400 rounded-2xl text-sm font-bold transition-all duration-300 disabled:opacity-50"
                                        >
                                          <XCircle size={16} />
                                          Reject
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05, y: -2 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleReviewSubmission(type, s.id, "approve")}
                                          disabled={Boolean(reviewing[s.id])}
                                          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10 transition-all duration-300 disabled:opacity-50"
                                        >
                                          <CheckCircle2 size={16} />
                                          Approve
                                        </motion.button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowRight size={16} className="text-white/10" />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
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
                          <h2 className="text-xl font-wintersolace">Employee Management</h2>
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
                            </button>
                          </motion.div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showAddEmployee && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-8 rounded-[44px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl relative group" style={{ "--card-radius": "44px" } as React.CSSProperties}>
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Full Name</label>
                                  <input className={`${inputClass} w-full focus:ring-purple-500/50`} placeholder="E.g. Dr. John Doe" value={newUser.name} onChange={(e) => setNewUser(s => ({ ...s, name: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Username</label>
                                  <input className={`${inputClass} w-full focus:ring-purple-500/50`} placeholder="@username" value={newUser.username} onChange={(e) => setNewUser(s => ({ ...s, username: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Email Address</label>
                                  <input className={`${inputClass} w-full focus:ring-purple-500/50`} placeholder="email@example.com" value={newUser.email} onChange={(e) => setNewUser(s => ({ ...s, email: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Secure Password</label>
                                  <input type="password" className={`${inputClass} w-full focus:ring-purple-500/50`} placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser(s => ({ ...s, password: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Professional Role</label>
                                  <input className={`${inputClass} w-full focus:ring-purple-500/50`} placeholder="e.g. Research Lead" value={newUser.position} onChange={(e) => setNewUser(s => ({ ...s, position: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Department</label>
                                  <input className={`${inputClass} w-full focus:ring-purple-500/50`} placeholder="e.g. Writers' Block" value={newUser.department} onChange={(e) => setNewUser(s => ({ ...s, department: e.target.value }))} />
                                </div>
                                <div className="space-y-2 md:col-span-3">
                                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Contributor Bio</label>
                                  <textarea className={`${textareaClass} w-full !min-h-[100px] focus:ring-purple-500/50`} placeholder="Short biography for the research community..." value={newUser.description} onChange={(e) => setNewUser(s => ({ ...s, description: e.target.value }))} />
                                </div>
                              </div>
                              <div className="mt-8 flex justify-end relative z-10">
                                <button
                                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm font-bold shadow-xl shadow-purple-900/20 transition-all duration-300 transform active:scale-95"
                                  onClick={async () => { await handleCreateUser(); setShowAddEmployee(false); }}
                                >
                                  Authorize Contributor
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-12">
                        {/* Active Employees Table */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-tttravelsnext font-bold text-white/40 uppercase tracking-[0.2em] ml-2">Active Society Members</h3>
                          <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/5">
                                  <th className="text-left py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Contributor</th>
                                  <th className="text-left py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Role & Department</th>
                                  <th className="text-center py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Auth Level</th>
                                  <th className="text-right py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.02]">
                                {activeFilteredUsers.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="py-10 text-center text-white/20 italic font-medium">No active members found</td>
                                  </tr>
                                ) : activeFilteredUsers.map((u, i) => {
                                  const isExpanded = expandedUserId === u.id;
                                  const edit = userEdits[u.id] ?? {};
                                  return (
                                    <React.Fragment key={u.id}>
                                      <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className={`group hover:bg-white/[0.03] transition-all cursor-pointer ${isExpanded ? 'bg-white/[0.03]' : ''}`}
                                        onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                                      >
                                        <td className="py-5 px-6">
                                          <div className="flex items-center gap-4">
                                            <div className="relative h-11 w-11 rounded-full bg-white/5 border border-white/10 overflow-hidden ring-4 ring-white/[0.02] transition-transform group-hover:scale-105">
                                              {u.profilePicture ? (
                                                <img src={u.profilePicture} className="w-full h-full object-cover" alt="" />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-black text-white/20">
                                                  {u.name?.[0] || u.username?.[0] || "?"}
                                                </div>
                                              )}
                                            </div>
                                            <div>
                                              <div className="font-bold text-white/90 group-hover:text-white transition-colors">{u.name || u.username}</div>
                                              <div className="text-[10px] text-white/30 lowercase font-medium">{u.email}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-5 px-6">
                                          <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-white/70">{u.position || "Staff"}</div>
                                            <div className="text-[10px] text-white/30 uppercase tracking-widest font-black">{u.department || "Unassigned"}</div>
                                          </div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                          <div className="inline-flex">
                                            {u.admin_access ? (
                                              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                                <ShieldCheck size={10} />
                                                Administrator
                                              </span>
                                            ) : u.is_banned ? (
                                              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-300 border border-red-500/20">
                                                Banned Account
                                              </span>
                                            ) : (
                                              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/5 text-white/30 border border-white/5">
                                                Standard Access
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                          <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-all">
                                            {isExpanded ? "Close" : "Modify"}
                                            <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                          </div>
                                        </td>
                                      </motion.tr>
                                      {isExpanded && (
                                        <tr>
                                          <td colSpan={5} className="p-6 bg-white/[0.01] border-b border-white/5">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
                                              <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Full Name</label>
                                                <input className={`${inputClass} w-full`} placeholder="Full name" value={edit.name} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, name: e.target.value } }))} />
                                              </div>
                                              <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Username</label>
                                                <input className={`${inputClass} w-full`} placeholder="@username" value={edit.username} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, username: e.target.value } }))} />
                                              </div>
                                              <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Email</label>
                                                <input type="email" className={`${inputClass} w-full`} placeholder="email@example.com" value={edit.email} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, email: e.target.value } }))} />
                                              </div>
                                              <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Position / Role</label>
                                                <input className={`${inputClass} w-full`} placeholder="e.g. Research Lead" value={edit.position} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, position: e.target.value } }))} />
                                              </div>
                                              <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Department</label>
                                                <input className={`${inputClass} w-full`} placeholder="e.g. Biology" value={edit.department} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, department: e.target.value } }))} />
                                              </div>
                                              <div className="space-y-1.5 md:col-span-1">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Description / Bio</label>
                                                <textarea className={`${textareaClass} w-full !min-h-[80px]`} placeholder="Short bio or description..." value={edit.description} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, description: e.target.value } }))} />
                                              </div>
                                              <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">New Password</label>
                                                <input type="password" className={`${inputClass} w-full`} placeholder="Leave blank to keep current" value={edit.password} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, password: e.target.value } }))} />
                                              </div>
                                              <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Confirm Password</label>
                                                <input type="password" className={`${inputClass} w-full`} placeholder="Repeat new password" onChange={(e) => {/* confirm is local UI only – validated on save */ }} />
                                              </div>
                                              <div className="space-y-1.5 flex items-center gap-4 pb-2 pt-2">
                                                <input type="checkbox" id={`admin-${u.id}`} className="accent-purple-500 h-4 w-4" checked={edit.admin_access} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, admin_access: e.target.checked } }))} />
                                                <label htmlFor={`admin-${u.id}`} className="text-xs font-bold uppercase tracking-widest text-white/80 cursor-pointer">Grant Admin Authorization</label>
                                              </div>
                                              {(() => {
                                                const myPos = (currentUser?.position || "").toUpperCase();
                                                const canBan = myPos === "CEO" || myPos === "COO";
                                                const isSelf = u.id === currentUser?.id;
                                                
                                                if (!canBan || isSelf) return null;
                                                
                                                return (
                                                  <div className="space-y-1.5 flex items-center gap-4 pb-2 pt-2">
                                                    <input type="checkbox" id={`banned-${u.id}`} className="accent-red-500 h-4 w-4" checked={edit.is_banned} onChange={(e) => setUserEdits(s => ({ ...s, [u.id]: { ...edit, is_banned: e.target.checked } }))} />
                                                    <label htmlFor={`banned-${u.id}`} className="text-xs font-bold uppercase tracking-widest text-red-400 cursor-pointer">Restrict Account Access (BAN)</label>
                                                  </div>
                                                );
                                              })()}
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

                        {/* Legacy Employees Table */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 ml-2">
                            <h3 className="text-sm font-tttravelsnext font-bold text-white/40 uppercase tracking-[0.2em]">Archived Members</h3>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest">Read Only</span>
                          </div>
                          <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/5">
                                  <th className="text-left py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Contributor</th>
                                  <th className="text-left py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Role & Department</th>
                                  <th className="text-center py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Status</th>
                                  <th className="text-right py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/[0.02]">
                                {legacyFilteredUsers.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="py-10 text-center text-white/10 italic font-medium">No archived members found</td>
                                  </tr>
                                ) : legacyFilteredUsers.map((u, i) => {
                                  const isExpanded = expandedUserId === u.id;
                                  return (
                                    <React.Fragment key={u.id}>
                                      <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`group hover:bg-white/[0.02] transition-all cursor-pointer ${isExpanded ? 'bg-white/[0.02]' : ''}`}
                                        onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                                      >
                                        <td className="py-5 px-6 opacity-60">
                                          <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-full bg-white/5 border border-white/10 overflow-hidden grayscale opacity-50">
                                              {u.profilePicture && <img src={u.profilePicture} className="w-full h-full object-cover" alt="" />}
                                            </div>
                                            <div>
                                              <div className="font-bold text-white/80">{u.name || u.username}</div>
                                              <div className="text-[10px] text-white/30 lowercase font-medium">{u.email}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-5 px-6 opacity-60">
                                          <div className="space-y-0.5">
                                            <div className="text-sm font-bold text-white/60">{u.position || "Staff"}</div>
                                            <div className="text-[10px] text-white/30 uppercase tracking-widest font-black">{u.department || "Unassigned"}</div>
                                          </div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/10">
                                            Legacy Member
                                          </span>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                          <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-all">
                                            {isExpanded ? "Hide Details" : "View Record"}
                                            <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                          </div>
                                        </td>
                                      </motion.tr>
                                      {isExpanded && (
                                        <tr>
                                          <td colSpan={5} className="p-8 bg-black/10 border-b border-white/5">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl">
                                              <div className="space-y-1">
                                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">Full Name</p>
                                                <p className="text-sm text-white/60">{u.name || "N/A"}</p>
                                              </div>
                                              <div className="space-y-1">
                                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">Identity</p>
                                                <p className="text-sm text-white/60">@{u.username}</p>
                                              </div>
                                              <div className="space-y-1">
                                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">Primary Contact</p>
                                                <p className="text-sm text-white/60">{u.email}</p>
                                              </div>
                                              <div className="space-y-1">
                                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">Service Period</p>
                                                <p className="text-sm text-white/40 italic">Historical data preserved</p>
                                              </div>
                                              <div className="md:col-span-4 space-y-1">
                                                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">Archived Biography</p>
                                                <p className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap italic">"{u.description || "No bio available in archives."}"</p>
                                              </div>
                                              <div className="md:col-span-4 flex justify-end">
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border border-white/5 px-4 py-2 rounded-xl">Immutable Archive Record</span>
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
                          <h2 className="text-xl font-wintersolace">Public Community</h2>
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
                              <th className="text-left py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Community Profile</th>
                              <th className="text-center py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Access Level</th>
                              <th className="text-right py-5 px-6 text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.02]">
                            {filteredPublicUsers.map((u, i) => {
                              const isExpanded = expandedPublicUserId === u.id;
                              return (
                                <React.Fragment key={u.id}>
                                  <motion.tr
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={`group hover:bg-white/[0.03] transition-all cursor-pointer ${isExpanded ? 'bg-white/[0.03]' : ''}`}
                                    onClick={() => setExpandedPublicUserId(isExpanded ? null : u.id)}
                                  >
                                    <td className="py-5 px-6">
                                      <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-full bg-white/5 border border-white/10 overflow-hidden ring-4 ring-white/[0.02] transition-transform group-hover:scale-105">
                                          {u.avatar_url && <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <div className="font-bold text-white/90 group-hover:text-white transition-colors">{u.name || u.username || "Anonymous User"}</div>
                                              {u.is_banned && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-tighter border border-red-500/30">
                                                  Banned
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-[10px] text-white/30 lowercase font-medium">{u.email}</div>
                                          </div>
                                      </div>
                                    </td>
                                    <td className="py-5 px-6 text-center">
                                      <div className="inline-flex">
                                          {u.is_banned ? (
                                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                                              Banned Account
                                            </span>
                                          ) : u.is_employee ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                              Society Contributor
                                            </span>
                                          ) : (
                                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/5 text-white/30 border border-white/5">
                                              Public Member
                                            </span>
                                          )}
                                      </div>
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                      <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-all">
                                        {isExpanded ? "Close" : "Control"}
                                        <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                      </div>
                                    </td>
                                  </motion.tr>
                                  {isExpanded && (() => {
                                    const pubEdit = publicUserEdits[u.id] ?? { username: u.username ?? "", email: u.email ?? "", name: u.name ?? "", bio: u.bio ?? "", password: "", is_banned: Boolean(u.is_banned) };
                                    return (
                                      <tr>
                                        <td colSpan={3} className="p-6 bg-white/[0.01] border-b border-white/5">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mb-6">
                                            <div className="space-y-1.5">
                                              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Display Name</label>
                                              <input className={`${inputClass} w-full`} placeholder="Full name" value={pubEdit.name} onChange={(e) => setPublicUserEdits(s => ({ ...s, [u.id]: { ...pubEdit, name: e.target.value } }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Username</label>
                                              <input className={`${inputClass} w-full`} placeholder="@username" value={pubEdit.username} onChange={(e) => setPublicUserEdits(s => ({ ...s, [u.id]: { ...pubEdit, username: e.target.value } }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Email</label>
                                              <input type="email" className={`${inputClass} w-full`} placeholder="email@example.com" value={pubEdit.email} onChange={(e) => setPublicUserEdits(s => ({ ...s, [u.id]: { ...pubEdit, email: e.target.value } }))} />
                                            </div>
                                            <div className="space-y-1.5 md:col-span-2">
                                              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Bio</label>
                                              <textarea className={`${textareaClass} w-full !min-h-[80px]`} placeholder="Short bio..." value={pubEdit.bio} onChange={(e) => setPublicUserEdits(s => ({ ...s, [u.id]: { ...pubEdit, bio: e.target.value } }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                              <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">New Password</label>
                                              <input type="password" className={`${inputClass} w-full`} placeholder="Leave blank to keep current" value={pubEdit.password} onChange={(e) => setPublicUserEdits(s => ({ ...s, [u.id]: { ...pubEdit, password: e.target.value } }))} />
                                            </div>
                                            {(() => {
                                              const myPos = (currentUser?.position || "").toUpperCase();
                                              const canBan = myPos === "CEO" || myPos === "COO";
                                              // For public users, we check by email if it's the current employee
                                              const isSelf = u.email?.toLowerCase() === currentUser?.email?.toLowerCase();
                                              
                                              if (!canBan || isSelf) return null;
                                              
                                              return (
                                                <div className="space-y-1.5 md:col-span-2 flex items-center gap-4 py-4">
                                                  <div 
                                                    className={`flex items-center gap-3 px-6 py-4 rounded-[28px] border transition-all cursor-pointer select-none grow ${pubEdit.is_banned ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10 hover:bg-white/[0.08]"}`}
                                                    onClick={() => setPublicUserEdits(s => ({ ...s, [u.id]: { ...pubEdit, is_banned: !pubEdit.is_banned } }))}
                                                  >
                                                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-500 ${pubEdit.is_banned ? "bg-red-500" : "bg-white/10"}`}>
                                                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-500 ${pubEdit.is_banned ? "translate-x-7" : "translate-x-1"}`} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <span className={`text-xs font-black uppercase tracking-widest ${pubEdit.is_banned ? "text-red-400" : "text-white/60"}`}>
                                                        {pubEdit.is_banned ? "Banned Permanently" : "Active & Verified"}
                                                      </span>
                                                      <span className="text-[10px] text-white/30 font-medium">Restricts all write access, comments, likes and profile editing.</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })()}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <button onClick={() => handleDeletePublicUser(u.id)} className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all uppercase tracking-widest">Suspend Account</button>
                                              <p className="text-[10px] text-white/20 italic">Registered on {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown date'}</p>
                                            </div>
                                            <button onClick={() => handleUpdatePublicUser(u.id)} disabled={Boolean(savingPublicUser[u.id])} className="px-6 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-all">{savingPublicUser[u.id] ? "Saving..." : "Save Changes"}</button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })()}
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
                      <h2 className="text-2xl font-wintersolace">Research Articles</h2>
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

                  <AdminContentPanel
                    items={docs as any}
                    type="articles"
                    currentUser={currentUser}
                    onDelete={handleDeleteContent}
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === "blogs" && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-wintersolace">Blogger's Hub</h2>
                      <p className="text-sm text-white/50 mt-1">Manage community blog posts and updates.</p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex"
                    >
                      <button
                        className="relative px-6 py-3 rounded-full overflow-hidden backdrop-blur-sm font-dmsans transition-all duration-300 group"
                        onClick={() => router.push("/blogs/dashboard")}
                      >
                        <span className="relative z-10 flex items-center gap-2 text-white font-medium">
                          + Write New Post
                        </span>
                        <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                        <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                      </button>
                    </motion.div>
                  </div>

                  <AdminContentPanel
                    items={blogs}
                    type="blogs"
                    currentUser={currentUser}
                    onDelete={handleDeleteContent}
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === "survivors" && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <h2 className="text-2xl  font-wintersolace">Survivor Stories</h2>
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
                        <div className="absolute inset-0 liquidGlass-effect pointer-events-none"></div>
                        <div className="liquidGlass-shine relative w-[100.8%] h-[100%] !top-[0px] !left-[-1px]"></div>
                      </button>
                    </motion.div>
                  </div>

                  <AdminContentPanel
                    items={stories}
                    type="survivors"
                    currentUser={currentUser}
                    onDelete={handleDeleteContent}
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === "system" && currentUser?.admin_access && (
                <div className="space-y-8">
                  {/* Maintenance Mode Card */}
                  <section className={`${cardClass} p-8 relative overflow-hidden`}>
                    <div className="glass-noise" />
                    <div className="cardGlass-borders" />
                    <div className="cardGlass-tint" />
                    <div className="cardGlass-shine pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-wintersolace text-white">Maintenance Mode</h2>
                          <p className="text-sm text-white/50 mt-1">Restrict public access to the website while performing updates.</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {maintenanceLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />}
                          <button
                            onClick={toggleMaintenanceMode}
                            disabled={maintenanceLoading}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${maintenanceMode ? "bg-red-500" : "bg-white/10"}`}
                          >
                            <motion.div
                              animate={{ x: maintenanceMode ? 32 : 4 }}
                              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-xs text-white/40 leading-relaxed font-dmsans">
                          <span className="text-white font-bold uppercase tracking-wider block mb-1">Warning:</span>
                          When enabled, visitors will be redirected to the maintenance page. Admin panel and API will remain accessible.
                          Make sure to toggle it off once your work is complete.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className={`${cardClass} p-8 relative overflow-hidden`}>
                    <div className="glass-noise" />
                    <div className="cardGlass-borders" />
                    <div className="cardGlass-tint" />
                    <div className="cardGlass-shine pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-wintersolace text-white">System Verification</h2>
                        <button
                          onClick={async () => {
                            setSystemCheckLoading(true);
                            try {
                              const res = await fetch("/api/admin", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action: "system_check" }),
                              });
                              const data = await res.json();
                              setSystemCheckResults(data.results);
                            } catch (err) {
                              setError("Failed to run system check");
                            } finally {
                              setSystemCheckLoading(false);
                            }
                          }}
                          disabled={systemCheckLoading}
                          className={primaryButton}
                        >
                          {systemCheckLoading ? "Running..." : "Run System Check"}
                        </button>
                      </div>

                      {systemCheckResults && (
                        <div className="space-y-4">
                          <div className="rounded-2xl bg-black/40 p-4 font-mono text-xs overflow-auto max-h-[500px] border border-white/5">
                            <pre className="text-purple-300">
                              {JSON.stringify(systemCheckResults, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

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
      </div>
    </div>
  );
}
