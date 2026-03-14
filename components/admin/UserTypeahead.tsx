"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, User } from "lucide-react";

interface UserTypeaheadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  placeholder?: string;
}

export default function UserTypeahead({ value, onChange, label, id, placeholder }: UserTypeaheadProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search_users", query: searchTerm }),
      });
      const data = await res.json();
      if (data.users && data.users.length > 0) {
        setResults(data.users);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("search users error", err);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const segments = newValue.split(",").map(s => s.trim());
    const lastSegment = segments[segments.length - 1];
    
    if (lastSegment) {
      triggerSearch(lastSegment);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (user: any) => {
    const segments = value.split(",").map(s => s.trim());
    // Replace the last segment with the selected username
    segments[segments.length - 1] = user.username;
    
    // Check for duplicates
    const uniqueSegments = Array.from(new Set(segments));
    onChange(uniqueSegments.join(", "));
    
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && (
        <label className="text-xs uppercase tracking-widest text-white/40 font-medium ml-1" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-2xl h-12 px-4 transition-all text-white outline-none"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-white/20" />
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user)}
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-none"
            >
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <User className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{user.name || user.username}</span>
                <span className="text-xs text-white/40">@{user.username}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
