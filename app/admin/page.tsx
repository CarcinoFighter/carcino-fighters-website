"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

const ADMIN_PASS_HASH =
  "$2b$10$ZuLF7PXKUjtwZ.anjjg7G.dnwB5Hbm3LroRUcgf3Iv8k1DXb1zFzK";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  type CancerDoc = {
    id: string;
    slug: string;
    title: string;
    content: string;
    author: string;
    position: string;
    profilePicture?: string | null; // public URL
  };
  const [docs, setDocs] = useState<CancerDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    slug: "",
    title: "",
    content: "",
    author: "",
    position: ""
  });
  const [adding, setAdding] = useState(false);
  const [addData, setAddData] = useState({
    slug: "",
    title: "",
    content: "",
    author: "",
    position: ""
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [lastResponseDebug, setLastResponseDebug] = useState<string | null>(null);

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
  // Password check
  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Input password:", input);
    console.log("Hash used:", ADMIN_PASS_HASH);
    const match = await bcrypt.compare(input, ADMIN_PASS_HASH);
    console.log("Bcrypt compare result:", match);
    if (match) {
      setUnlocked(true);
      await fetchDocsWithPictures();
    } else {
      setError("Incorrect password");
    }
    setLoading(false);
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

  // Fetch docs + associated profile pictures (if any) and attach accessible URL
  async function fetchDocsWithPictures() {
    setLoading(true);
    const docsRes = await supabase.from("cancer_docs").select("*");
    console.log("fetchDocsWithPictures docsRes:", docsRes);
    setLastResponseDebug((prev) => `${prev || ''}\nDOCS_RES:\n${JSON.stringify(docsRes, null, 2)}`);

    if (docsRes.error || !docsRes.data) {
      console.error("fetchDocsWithPictures docs error:", docsRes.error);
      setError(`Fetch docs failed: ${formatSbError(docsRes.error) || 'unknown'}`);
      setDocs([]);
      setLoading(false);
      return;
    }

    // Use the declared CancerDoc type instead of `any`
    const docsData = docsRes.data as CancerDoc[];
    const ids = docsData.map((d) => d.id);

    const picsRes = await supabase
      .from("profile_pictures")
      .select("author_id, object_key")
      .in("author_id", ids as string[]);
    console.log("fetchDocsWithPictures picsRes:", picsRes);
    setLastResponseDebug((prev) => `${prev}\nPICS_RES:\n${JSON.stringify(picsRes, null, 2)}`);

    if (picsRes.error) {
      console.error("profile_pictures fetch error:", picsRes.error);
    }

    type PicRow = { author_id: string; object_key: string };
    const pics = (picsRes.data as PicRow[]) || [];

    const picMap: Record<string, string> = {};
    for (const p of pics) {
      try {
        // Prefer a signed URL so images load even if the bucket is private
        const signed = await supabase.storage
          .from("profile-picture")
          .createSignedUrl(p.object_key, 60 * 60 * 24 * 7); // 7 days
        if (signed.error) {
          console.error("createSignedUrl error", signed.error);
          setLastResponseDebug((prev) => `${prev}\nSIGNED_URL_ERR(${p.object_key}):\n${JSON.stringify(signed.error, null, 2)}`);
        } else if (signed.data?.signedUrl) {
          picMap[p.author_id] = signed.data.signedUrl;
        }
      } catch (e) {
        console.error("createSignedUrl throw", e);
      }
    }

    const enriched = docsData.map((d) => ({
      ...d,
      profilePicture: picMap[d.id] ?? null,
    }));

    setDocs(enriched);
    setLoading(false);
  }

  async function handleEditSave(id: string) {
    setLoading(true);
    const res = await supabase.from("cancer_docs").update(editData).eq("id", id);
    console.log("handleEditSave response:", res);
    setLastResponseDebug(JSON.stringify(res, null, 2));
    if (res.error) {
      setError(`Update failed: ${formatSbError(res.error)}`);
    }
    setEditing(null);
    await fetchDocsWithPictures();
    setLoading(false);
  }

  async function handleAddSave() {
    setLoading(true);
    const res = await supabase.from("cancer_docs").insert([addData]);
    console.log("handleAddSave response:", res);
    setLastResponseDebug(JSON.stringify(res, null, 2));
    if (res.error) {
      setError(`Insert failed: ${formatSbError(res.error)}`);
    }
    setAdding(false);
    setAddData({ slug: "", title: "", content: "", author: "", position: "" });
    await fetchDocsWithPictures();
    setLoading(false);
  }

  async function handleUpload(file: File, docId: string) {
    try {
      setUploading((s) => ({ ...s, [docId]: true }));

      const ext = file.name.split('.').pop();
      const path = `authors/${docId}/avatar.${ext}`;
      const user = await supabase.auth.getUser(); 
      console.log("User: ", user);
      // upload to storage (upsert)
      const upRes = await supabase.storage
        .from('profile-picture')
        .upload(path, file, { upsert: true });
      console.log('upload response', upRes);
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
      console.log('meta upsert res', metaRes);
      setLastResponseDebug((p) => `${p}\nMETA_RES:\n${JSON.stringify(metaRes, null, 2)}`);
      if (metaRes.error) throw metaRes.error;

      // get a signed url so it loads reliably if bucket is private
      const signed = await supabase.storage
        .from('profile-picture')
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
      console.log('createSignedUrl after upload', signed);
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

  const res = await supabase.from("cancer_docs").delete().eq("id", id);
  console.log("handleDelete response:", res);
  setLastResponseDebug(JSON.stringify(res, null, 2));

  if (res.error) {
    setError(`Delete failed: ${formatSbError(res.error)}`);
  }

  await fetchDocsWithPictures();
  setLoading(false);
}

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <form
          onSubmit={handleUnlock}
          className="flex flex-col gap-4 p-8 rounded-xl bg-card border w-full max-w-xs"
        >
          <h1 className="text-xl font-bold mb-2">Admin Portal</h1>
          <input
            type="password"
            className="border rounded px-3 py-2 bg-background"
            placeholder="Enter password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-primary text-white rounded px-4 py-2 font-semibold"
            disabled={loading}
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 pt-[68px] min-w-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cancer Docs Table</h1>
        <button
          className="mb-4 bg-primary text-white px-4 py-2 rounded font-semibold"
          onClick={() => setAdding(true)}
        >
          + Add New Article
        </button>
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
                  {editing === doc.id ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editData.author}
                      onChange={(e) =>
                        setEditData({ ...editData, author: e.target.value })
                      }
                    />
                  ) : (
                    doc.author
                  )}
                </td>
                <td className="p-2 align-top">
                  {editing === doc.id ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editData.position}
                      onChange={(e) =>
                        setEditData({ ...editData, position: e.target.value })
                      }
                    />
                  ) : (
                    doc.position
                  )}
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
    <button
      className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
      onClick={() => {
        setEditing(doc.id);
        setEditData({
          slug: doc.slug,
          title: doc.title,
          content: doc.content,
          author: doc.author,
          position: doc.position
        });
      }}
    >
      Edit
    </button>

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
    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 
       0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
  />
</svg>
    </button>
  </>
)}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lastResponseDebug && (
          <pre className="mt-4 p-3 bg-black/5 text-xs whitespace-pre-wrap overflow-auto max-h-40">{lastResponseDebug}</pre>
        )}
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
