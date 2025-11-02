"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ADMIN_PASS_HASH = "$2a$12$hO6g3hvavdsyejG4ESJOueW/kZlrtmeizB0vRut5ArGv4dBZlNAyG";

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
  };
  const [docs, setDocs] = useState<CancerDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState({ slug: "", title: "", content: "", author: "" });
  const [adding, setAdding] = useState(false);
  const [addData, setAddData] = useState({ slug: "", title: "", content: "", author: "" });
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
      fetchDocs();
    } else {
      setError("Incorrect password");
    }
    setUnlocked(true);
    fetchDocs();
    setLoading(false);
  }

  async function fetchDocs() {
    setLoading(true);
    const { data, error } = await supabase.from("cancer_docs").select("id, slug, title, content, author");
    if (!error) setDocs(data || []);
    setLoading(false);
  }

  async function handleEditSave(id: string) {
    setLoading(true);
    await supabase.from("cancer_docs").update(editData).eq("id", id);
    setEditing(null);
    fetchDocs();
    setLoading(false);
  }

  async function handleAddSave() {
    setLoading(true);
    await supabase.from("cancer_docs").insert([addData]);
    setAdding(false);
    setAddData({ slug: "", title: "", content: "", author: "" });
    fetchDocs();
    setLoading(false);
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <form onSubmit={handleUnlock} className="flex flex-col gap-4 p-8 rounded-xl bg-card border w-full max-w-xs">
          <h1 className="text-xl font-bold mb-2">Admin Portal</h1>
          <input
            type="password"
            className="border rounded px-3 py-2 bg-background"
            placeholder="Enter password"
            value={input}
            onChange={e => setInput(e.target.value)}
            required
          />
          <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold" disabled={loading}>
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
              <th className="p-2">Title</th>
              <th className="p-2">Content</th>
              <th className="p-2">Author</th>
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
                      onChange={e => setEditData({ ...editData, slug: e.target.value })}
                    />
                  ) : (
                    doc.slug
                  )}
                </td>
                <td className="p-2 align-top">
                  {editing === doc.id ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editData.title}
                      onChange={e => setEditData({ ...editData, title: e.target.value })}
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
                      onChange={e => setEditData({ ...editData, content: e.target.value })}
                    />
                  ) : (
                    <div className="whitespace-pre-line line-clamp-4 max-h-32 overflow-auto">{doc.content}</div>
                  )}
                </td>
                <td className="p-2 align-top">
                  {editing === doc.id ? (
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={editData.author}
                      onChange={e => setEditData({ ...editData, author: e.target.value })}
                    />
                  ) : (
                    doc.author
                  )}
                </td>
                <td className="p-2 align-top">
                  {editing === doc.id ? (
                    <>
                      <button className="bg-green-600 text-white px-2 py-1 rounded mr-2" onClick={() => handleEditSave(doc.id)} disabled={loading}>Save</button>
                      <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditing(null)} disabled={loading}>Cancel</button>
                    </>
                  ) : (
                    <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={() => { setEditing(doc.id); setEditData({ slug: doc.slug, title: doc.title, content: doc.content, author: doc.author }); }}>Edit</button>
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
                onChange={e => setAddData({ ...addData, slug: e.target.value })}
              />
              <input
                className="border rounded px-2 py-1"
                placeholder="Title"
                value={addData.title}
                onChange={e => setAddData({ ...addData, title: e.target.value })}
              />
              <textarea
                className="border rounded px-2 py-1 min-h-[80px]"
                placeholder="Content (Markdown supported)"
                value={addData.content}
                onChange={e => setAddData({ ...addData, content: e.target.value })}
              />
              <div className="flex gap-2 mt-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleAddSave} disabled={loading}>Add</button>
                <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setAdding(false)} disabled={loading}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
