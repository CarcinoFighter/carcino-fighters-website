import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Buffer } from "node:buffer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "node:fs/promises";
import path from "node:path";

type AuthBody = {
	action:
	| "register"
	| "login"
	| "upsert"
	| "get_profile_picture"
	| "list_users"
	| "update_user"
	| "update_self"
	| "list_docs"
	| "get_doc"
	| "update_doc"
	| "create_doc"
	| "delete_doc"
	| "submit_doc_change"
	| "list_doc_submissions"
	| "review_doc_submission"
	| "delete_user"
	| "get_leadership"
	| "logout"
	| "update_pfp"
	| "list_public_users"
	| "update_public_user"
	| "delete_public_user"
	| "system_check"
	| "get_site_settings"
	| "update_site_settings"
	| "list_story_submissions"
	| "review_story_submission"
	| "review_blog_submission"
	| "list_blogs"
	| "get_blog"
	| "update_blog"
	| "delete_blog"
	| "list_stories"
	| "get_story"
	| "update_story"
	| "delete_story"
	| "list_blog_submissions"
	| "search_users";
	username?: string;
	email?: string;
	password?: string;
	name?: string;
	avatar_url?: string;
	position?: string;
	identifier?: string;
	targetUserId?: string;
	admin_access?: boolean;
	docId?: string;
	slug?: string;
	title?: string;
	content?: string;
	color?: string;
	colour?: string;
	authorId?: string;
	authorIds?: string[];
	coAuthorUsernames?: string;
	overrideAuthors?: boolean;
	submissionId?: string;
	decision?: "approve" | "reject";
	reviewerNote?: string;
	status?: "pending" | "approved" | "rejected";
	description?: string;
	department?: string;
	bio?: string;
	forceOwn?: boolean;
	hidden?: boolean;
	blogId?: string;
	storyId?: string;
	tags?: string[];
	image_url?: string;
	query?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;
const COOKIE_NAME = "jwt";
const AUTH_VERBOSE = process.env.AUTH_VERBOSE === "true";

const sb = (supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null) as any;

type DocSubmissionRow = {
	id: string;
	doc_id: string | null;
	slug: string;
	title: string;
	content: string;
	color: string | null;
	author_user_id: string;
	author_user_ids?: string[];
	status: "pending" | "approved" | "rejected";
	reviewer_user_id?: string | null;
	reviewer_note?: string | null;
	created_at?: string;
	updated_at?: string;
};

type StorySubmissionRow = {
	id: string;
	story_id: string | null;
	user_id: string;
	slug: string;
	title: string;
	content: string | null;
	image_url: string | null;
	colour: string | null;
	tags: any;
	status: "pending" | "approved" | "rejected";
	reviewer_user_id?: string | null;
	reviewer_note?: string | null;
	created_at?: string;
	updated_at?: string;
};

type BlogSubmissionRow = {
	id: string;
	blog_id: string | null;
	user_id: string;
	slug: string;
	title: string;
	content: string | null;
	tags: any;
	status: "pending" | "approved" | "rejected";
	reviewer_user_id?: string | null;
	reviewer_note?: string | null;
	created_at?: string;
	updated_at?: string;
};

function vlog(step: string, meta?: Record<string, unknown>) {
	if (!AUTH_VERBOSE) return;
	const payload = meta ? { step, ...meta } : { step };
	console.info("[admin-auth]", JSON.stringify(payload));
}

async function ensureClient() {
	if (!supabaseUrl || !supabaseServiceKey || !sb) {
		throw new Error("Supabase credentials not configured");
	}
	return sb;
}

async function hashToken(token: string) {
	const crypto = await import("node:crypto");
	return crypto.createHash("sha256").update(token).digest("hex");
}

async function createSessionRow(userId: string, token: string, expiresAt: string | null, req: Request) {
	const client = await ensureClient();
	const tokenHash = await hashToken(token);

	const userAgent = req.headers.get("user-agent") ?? null;
	const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

	const { error } = await client
		.from("login_sessions")
		.insert({
			user_id: userId,
			token,
			token_hash: tokenHash,
			user_agent: userAgent,
			ip_address: ip,
			expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
			last_used_at: new Date().toISOString(),
		});

	if (error) throw error;
}

async function validateSessionFromToken(token: string) {
	if (!jwtSecret) throw new Error("JWT secret not configured");
	const client = await ensureClient();

	const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload & {
		sub: string;
		username?: string;
		email?: string;
		name?: string;
	};

	const tokenHash = await hashToken(token);
	const { data: session, error } = await (client
		.from("login_sessions")
		.select("user_id, expires_at")
		.eq("token_hash", tokenHash)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle() as any);

	if (error) throw error;
	if (!session) return null;

	// updateSessionLastUsed is now called inside getAuthenticatedUser for both branches

	if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
		return null;
	}

	if (session.user_id !== payload.sub) return null;

	const { data: userRow, error: userError } = await client
		.from("users")
		.select("id, username, email, name, admin_access, description, position, department, is_legacy")
		.eq("id", payload.sub)
		.limit(1)
		.maybeSingle();

	if (userError) throw userError;
	if (!userRow || userRow.is_legacy) return null;

	return {
		token,
		user: {
			id: userRow.id,
			username: userRow.username,
			email: userRow.email,
			name: userRow.name,
			admin_access: Boolean(userRow.admin_access),
			description: userRow.description,
			position: userRow.position,
			department: userRow.department,
			is_legacy: Boolean(userRow.is_legacy),
		},
	};
}

async function getAuthenticatedUser() {
	const cookieStore = await cookies();
	let token = cookieStore.get("jwt")?.value;
	let isPublicJwt = false;

	if (!token) {
		token = cookieStore.get("public_jwt")?.value;
		isPublicJwt = true;
	}

	if (!token) return null;

	if (isPublicJwt) {
		if (!jwtSecret) throw new Error("JWT secret not configured");
		try {
			const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload & { sub: string };
			const client = await ensureClient();

			// For public_jwt, we first find the user in users_public
			const { data: publicUser } = await client
				.from("users_public")
				.select("id, email, username, deleted")
				.eq("id", payload.sub)
				.maybeSingle();

			if (!publicUser || publicUser.deleted) return null;

			// Then check if they are an employee in the "users" table
			const { data: userRow } = await client
				.from("users")
				.select("id, username, email, name, admin_access, description, position, department, is_legacy")
				.eq("email", publicUser.email.toLowerCase())
				.limit(1)
				.maybeSingle();

			if (!userRow || userRow.is_legacy) return null; // Not an employee or legacy. Admin API is restricted.

			await updateSessionLastUsed(token);

			return {
				token,
				user: {
					id: userRow.id,
					username: userRow.username,
					email: userRow.email,
					name: userRow.name,
					admin_access: Boolean(userRow.admin_access),
					description: userRow.description,
					position: userRow.position,
					department: userRow.department,
					is_legacy: Boolean(userRow.is_legacy),
				},
			};
		} catch (e) {
			return null;
		}
	}

	// updateSessionLastUsed is called inside validateSessionFromToken if needed, 
	// but we'll call it once here to cover the jwt branch.
	await updateSessionLastUsed(token);
	return validateSessionFromToken(token);
}

/**
 * Updates the last_used_at column for a given session token in the login_sessions table.
 */
async function updateSessionLastUsed(token: string) {
	try {
		const client = await ensureClient();
		const tokenHash = await hashToken(token);
		const now = new Date().toISOString();

		const { error } = await client
			.from("login_sessions")
			.update({ last_used_at: now })
			.eq("token_hash", tokenHash);

		if (error) {
			console.info("[admin-auth] session update error:", error.message);
		} else {
			console.info("[admin-auth] session updated:", tokenHash);
		}
	} catch (e) {
		console.error("[admin-auth] unexpected error during session update:", e);
	}
}

async function applySubmissionToDocs(client: SupabaseClient<any, any, any>, submission: DocSubmissionRow, reviewerId: string | null) {
	const { doc_id, slug, title, content, color, author_user_id, author_user_ids } = submission;
	const payload = {
		slug,
		title,
		content,
		color,
		author_user_id,
		author_user_ids: author_user_ids && author_user_ids.length > 0 ? author_user_ids : (author_user_id ? [author_user_id] : []),
	};

	let applied;
	if (doc_id) {
		// Check for slug collision on update (exclude self)
		const { count } = await client
			.from("cancer_docs")
			.select("*", { count: "exact", head: true })
			.eq("slug", slug)
			.neq("id", doc_id);

		if (count && count > 0) {
			throw new Error(`A document with slug "${slug}" already exists. Please choose a unique slug.`);
		}

		const { data, error } = await client
			.from("cancer_docs")
			.update(payload)
			.eq("id", doc_id)
			.select("id, slug, title, content, position, author_user_id")
			.maybeSingle();
		if (error) throw error;
		applied = data;
	} else {
		// Check for slug collision
		const { count } = await client
			.from("cancer_docs")
			.select("*", { count: "exact", head: true })
			.eq("slug", slug);

		if (count && count > 0) {
			throw new Error(`A document with slug "${slug}" already exists. Please reject this submission or ask the author to change the slug.`);
		}

		// Omit position to let DB default handle it (if any) or leave it null if allowed
		const { data, error } = await client
			.from("cancer_docs")
			.insert({ ...payload })
			.select("id, slug, title, content, position, author_user_id")
			.maybeSingle();
		if (error) throw error;
		applied = data;
	}

	const { data: updatedSubmission, error: subErr } = await client
		.from("cancer_doc_submissions")
		.update({ status: "approved", reviewer_user_id: reviewerId, reviewer_note: null })
		.eq("id", submission.id)
		.select()
		.maybeSingle();
	if (subErr) throw subErr;

	return { applied, submission: updatedSubmission };
}

async function applyStorySubmission(client: SupabaseClient<any, any, any>, submission: StorySubmissionRow, reviewerId: string | null) {
	const { story_id, slug, title, content, image_url, colour, tags, user_id } = submission;
	const payload = {
		slug,
		title,
		content,
		image_url,
		colour,
		tags,
		user_id,
	};

	let applied;
	if (story_id) {
		const { data, error } = await client
			.from("survivorstories")
			.update(payload)
			.eq("id", story_id)
			.select()
			.maybeSingle();
		if (error) throw error;
		applied = data;
	} else {
		const { data, error } = await client
			.from("survivorstories")
			.insert({ ...payload })
			.select()
			.maybeSingle();
		if (error) throw error;
		applied = data;
	}

	const { data: updatedSubmission, error: subErr } = await client
		.from("survivor_story_submissions")
		.update({ status: "approved", reviewer_user_id: reviewerId, reviewer_note: null })
		.eq("id", submission.id)
		.select()
		.maybeSingle();
	if (subErr) throw subErr;

	return { applied, submission: updatedSubmission };
}

async function applyBlogSubmission(client: SupabaseClient<any, any, any>, submission: BlogSubmissionRow, reviewerId: string | null) {
	const { blog_id, slug, title, content, tags, user_id } = submission;
	const payload = {
		slug,
		title,
		content,
		tags,
		user_id,
	};

	let applied;
	if (blog_id) {
		const { data, error } = await client
			.from("blogs")
			.update(payload)
			.eq("id", blog_id)
			.select()
			.maybeSingle();
		if (error) throw error;
		applied = data;
	} else {
		const { data, error } = await client
			.from("blogs")
			.insert({ ...payload })
			.select()
			.maybeSingle();
		if (error) throw error;
		applied = data;
	}

	const { data: updatedSubmission, error: subErr } = await client
		.from("blog_submissions")
		.update({ status: "approved", reviewer_user_id: reviewerId, reviewer_note: null })
		.eq("id", submission.id)
		.select()
		.maybeSingle();
	if (subErr) throw subErr;

	return { applied, submission: updatedSubmission };
}



async function handleUploadAvatar(req: Request) {
	try {
		if (!supabaseUrl || !supabaseServiceKey) {
			return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
		}
		const session = await getAuthenticatedUser();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await req.formData();
		const file = formData.get("avatar");
		let targetUserId = formData.get("targetUserId") as string || session.user.id;

		// If the targetUserId is a public user ID (which it might be if the frontend uses the public session state),
		// we need to resolve it to the employee ID in the "users" table because profile_pictures references "users".
		const client = await ensureClient();

		if (targetUserId !== session.user.id) {
			// Check if targetUserId is a users_public ID, and if so, find the corresponding employee ID
			const { data: publicUser } = await client
				.from("users_public")
				.select("email")
				.eq("id", targetUserId)
				.maybeSingle();

			if (publicUser?.email) {
				const { data: empUser } = await client
					.from("users")
					.select("id")
					.eq("email", publicUser.email.toLowerCase())
					.maybeSingle();

				if (empUser) {
					targetUserId = empUser.id;
				}
			}
		}

		if (!session.user.admin_access && targetUserId !== session.user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		if (!(file instanceof File)) {
			return NextResponse.json({ error: "avatar file is required" }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const ext = file.name.split(".").pop() || "jpg";
		const path = `authors/${targetUserId}/avatar.${ext}`;

		const uploadRes = await client
			.storage
			.from("profile-picture")
			.upload(path, buffer, { upsert: true, contentType: file.type || "image/jpeg" });

		if (uploadRes.error) {
			return NextResponse.json({ error: uploadRes.error.message }, { status: 400 });
		}

		// Update profile_pictures table
		await client.from("profile_pictures").delete().eq("user_id", targetUserId);
		const { error: pfpError } = await client.from("profile_pictures").insert({
			user_id: targetUserId,
			object_key: path,
			content_type: file.type || "image/jpeg",
			size: file.size || 0,
		});

		if (pfpError) {
			return NextResponse.json({ error: pfpError.message }, { status: 500 });
		}

		const pub = await client.storage.from("profile-picture").createSignedUrl(path, 60 * 60 * 24 * 7);
		const avatar_url = pub.data?.signedUrl ?? null;

		return NextResponse.json({ avatar_url });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : String(e);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

export async function GET() {
	try {
		if (!jwtSecret) {
			return NextResponse.json({ error: "JWT secret not configured" }, { status: 500 });
		}

		const session = await getAuthenticatedUser();
		if (!session) {
			vlog("get.no_session");
			return NextResponse.json({ authenticated: false }, { status: 401 });
		}

		vlog("get.ok", { userId: session.user.id });
		return NextResponse.json(
			{ authenticated: true, user: session.user },
			{ headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate", "Pragma": "no-cache", "Expires": "0" } },
		);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}



export async function POST(req: Request) {
	try {
		const contentType = req.headers.get("content-type") || "";
		if (contentType.includes("multipart/form-data")) {
			return handleUploadAvatar(req);
		}

		if (!supabaseUrl || !supabaseServiceKey) {
			return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
		}

		if (!jwtSecret) {
			return NextResponse.json({ error: "JWT secret not configured" }, { status: 500 });
		}

		const client = await ensureClient();
		const body = (await req.json().catch(() => null)) as AuthBody | null;
		const action = body?.action;
		vlog("post.begin", { action });

		if (!action) {
			return NextResponse.json({ error: "action is required" }, { status: 400 });
		}

		if (action === "login") {
			const identifier = body.identifier ?? body.username ?? body.email;
			const password = body.password;
			if (!identifier || !password) {
				return NextResponse.json({ error: "identifier and password required" }, { status: 400 });
			}

			// find user by username or email (case-insensitive)
			const { data: user, error } = await client
				.from("users")
				.select("id, username, email, name, password, admin_access, description, position, department, is_legacy")
				.or(`username.eq.${identifier},email.eq.${identifier}`)
				.limit(1)
				.maybeSingle();

			if (error) {
				return NextResponse.json({ error: error.message }, { status: 500 });
			}
			if (!user || user.is_legacy) {
				return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
			}

			const valid = await bcrypt.compare(password, user.password ?? "");
			if (!valid) {
				return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
			}

			const token = jwt.sign(
				{
					sub: user.id,
					username: user.username,
					email: user.email,
					name: user.name,
				},
				jwtSecret,
				{ expiresIn: "7d" }
			);

			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
			await createSessionRow(user.id, token, expiresAt, req);

			const response = NextResponse.json({
				authenticated: true,
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					name: user.name,
					admin_access: Boolean(user.admin_access),
					description: user.description,
					position: user.position,
					department: user.department,
				},
			});

			response.cookies.set({
				name: COOKIE_NAME,
				value: token,
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 7,
			});

			return response;
		}

		if (action === "register") {
			const { username, email, password, name, avatar_url, position, description, department } = body ?? {};
			if (!email || !password) {
				return NextResponse.json({ error: "email and password are required" }, { status: 400 });
			}
			vlog("register.start", { email, username });

			const hashed = await bcrypt.hash(password, 10);

			const { data, error } = await client
				.from("users")
				.insert({
					username: username ?? null,
					email: email.toLowerCase(),
					password: hashed,
					name: name ?? null,
					avatar_url: avatar_url ?? null,
					position: position ?? null,
					description: description ?? null,
					department: department ?? null,
				})
				.select("id, username, email, name, position, description, avatar_url, department")
				.maybeSingle();

			if (error) {
				vlog("register.error", { email, message: error.message });
				return NextResponse.json({ error: error.message }, { status: 400 });
			}

			vlog("register.ok", { userId: data?.id });
			return NextResponse.json({ user: data }, { status: 201 });
		}


		if (action === "upsert") {
			const { username, email, name, avatar_url } = body ?? {};
			if (!email) return NextResponse.json({ error: "email is required for upsert" }, { status: 400 });
			vlog("upsert.start", { email, username });

			const { data, error } = await client
				.from("users")
				.upsert(
					{
						email: email.toLowerCase(),
						username: username ?? null,
						name: name ?? null,
						avatar_url: avatar_url ?? null,
					},
					{ onConflict: "email" },
				)
				.select("id, username, email, name, avatar_url")
				.maybeSingle();

			if (error) {
				vlog("upsert.error", { email, message: error.message });
				return NextResponse.json({ error: error.message }, { status: 400 });
			}

			vlog("upsert.ok", { userId: data?.id });
			return NextResponse.json({ user: data }, { status: 200 });
		}


		if (action === "get_profile_picture") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const bucket = "profile-picture";
			const { data: pic, error: picErr } = await client
				.from("profile_pictures")
				.select("object_key")
				.eq("user_id", session.user.id)
				.limit(1)
				.maybeSingle();

			if (picErr) return NextResponse.json({ error: picErr.message }, { status: 500 });
			if (!pic?.object_key) return NextResponse.json({ url: null });

			try {
				const signed = await client.storage.from(bucket).createSignedUrl(pic.object_key, 60 * 60 * 24 * 7);
				return NextResponse.json({ url: signed.data?.signedUrl ?? null }, { headers: { "Cache-Control": "private, max-age=300" } });
			} catch (e) {
				return NextResponse.json({ url: null }, { headers: { "Cache-Control": "private, max-age=60" } });
			}
		}


		if (action === "list_users") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const { data: usersData, error } = await client
				.from("users")
				.select("id, username, email, name, admin_access, position, description, avatar_url, department, is_legacy")
				.order("created_at", { ascending: true });

			if (error) return NextResponse.json({ error: error.message }, { status: 500 });

			const bucket = "profile-picture";
			const userIds = (usersData ?? []).map((u: any) => u.id);
			const profileMap: Record<string, string | null> = {};
			if (userIds.length) {
				const { data: pics, error: picErr } = await client
					.from("profile_pictures")
					.select("user_id, object_key")
					.in("user_id", userIds);
				if (!picErr && pics) {
					const signedResults = await Promise.all(
						pics.map(async (p: any) => {
							if (!p.object_key) return { id: p.user_id, url: null };
							try {
								const signed = await client.storage.from(bucket).createSignedUrl(p.object_key, 60 * 60 * 24 * 7);
								return { id: p.user_id, url: signed.data?.signedUrl ?? null };
							} catch (e) {
								return { id: p.user_id, url: null };
							}
						})
					);
					signedResults.forEach((r: any) => {
						if (r?.id) profileMap[r.id] = r.url;
					});
				}
			}

			const usersWithPictures = (usersData ?? []).map((u: any) => ({
				...u,
				profilePicture: profileMap[u.id] || u.avatar_url || null
			}));
			return NextResponse.json({ users: usersWithPictures });
		}

		if (action === "update_user") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const { targetUserId, username, email, name, password, admin_access, position, description, department } = body ?? {};
			if (!targetUserId) return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });

			const updates: Record<string, unknown> = {};
			if (username !== undefined) updates.username = username || null;
			if (email !== undefined) updates.email = email ? email.toLowerCase() : null;
			if (name !== undefined) updates.name = name || null;
			if (admin_access !== undefined) updates.admin_access = Boolean(admin_access);
			if (position !== undefined) updates.position = position || null;
			if (description !== undefined) updates.description = description || null;
			if (department !== undefined) updates.department = department || null;
			if (password) updates.password = await bcrypt.hash(password, 10);

			if (Object.keys(updates).length === 0) {
				return NextResponse.json({ error: "No fields to update" }, { status: 400 });
			}

			// Check if target user is legacy
			const { data: targetUser } = await client
				.from("users")
				.select("is_legacy")
				.eq("id", targetUserId)
				.maybeSingle();

			if (targetUser?.is_legacy) {
				return NextResponse.json({ error: "Cannot edit legacy employees" }, { status: 403 });
			}

			const { data, error } = await client
				.from("users")
				.update(updates)
				.eq("id", targetUserId)
				.select("id, username, email, name, admin_access, position, description, avatar_url, department, is_legacy")
				.maybeSingle();

			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			return NextResponse.json({ user: data });
		}

		if (action === "update_self") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { username, email, name, password, position, description, department } = body ?? {};
			const updates: Record<string, unknown> = {};
			if (username !== undefined) updates.username = username || null;
			if (email !== undefined) updates.email = email ? email.toLowerCase() : null;
			if (name !== undefined) updates.name = name || null;
			if (position !== undefined) updates.position = position || null;
			if (description !== undefined) updates.description = description || null;
			if (department !== undefined) updates.department = department || null;
			if (password) updates.password = await bcrypt.hash(password, 10);

			if (Object.keys(updates).length === 0) {
				return NextResponse.json({ error: "No fields to update" }, { status: 400 });
			}

			const { data, error } = await client
				.from("users")
				.update(updates)
				.eq("id", session.user.id)
				.select("id, username, email, name, admin_access, position, description, avatar_url, department")
				.maybeSingle();

			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			return NextResponse.json({ user: data });
		}

		if (action === "list_docs") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const baseQuery = client
				.from("cancer_docs")
				.select("id, slug, title, content, color, position, author_user_id, author_user_ids, hidden, created_at, updated_at");

			const { forceOwn } = body ?? {};
			let query = (session.user.admin_access && !forceOwn)
				? baseQuery
				: baseQuery.eq("author_user_id", session.user.id);

			if (!session.user.admin_access) {
				query = query.neq("hidden", true);
			}

			// Hide docs whose author is not in users table
			const { data, error } = await query;
			if (error) return NextResponse.json({ error: error.message }, { status: 500 });

			if (!data) return NextResponse.json({ docs: [] });

			const authorIds = Array.from(new Set(data.map((d: any) => d.author_user_id).filter(Boolean)));
			let validAuthors: Set<string> = new Set();
			const authorMeta: Record<string, { name: string | null; username: string | null; email: string | null; position: string | null }> = {};
			if (authorIds.length) {
				const { data: usersRows, error: uErr } = await client
					.from("users")
					.select("id, username, email, name, position")
					.in("id", authorIds);
				if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });
				validAuthors = new Set((usersRows ?? []).map((u: any) => u.id));
				(usersRows ?? []).forEach((u: any) => {
					authorMeta[u.id] = {
						name: u.name ?? null,
						username: u.username ?? null,
						email: u.email ?? null,
						position: u.position ?? null,
					};
				});
			}


			// pull profile pictures (stored by doc id) and generate signed URLs
			const bucket = "profile-picture";
			const authorIdsForPics = Array.from(new Set(data.map((d: any) => d.author_user_id).filter(Boolean))) as string[];
			const profileMap: Record<string, string | null> = {};
			if (authorIdsForPics.length) {
				const { data: pics, error: picErr } = await client
					.from("profile_pictures")
					.select("user_id, object_key")
					.in("user_id", authorIdsForPics);
				if (!picErr && pics) {
					const signedResults = await Promise.all(
						pics.map(async (p: any) => {
							if (!p.object_key) return { id: p.user_id, url: null };
							try {
								const signed = await client.storage.from(bucket).createSignedUrl(p.object_key, 60 * 60 * 24 * 7);
								return { id: p.user_id, url: signed.data?.signedUrl ?? null };
							} catch (e) {
								return { id: p.user_id, url: null };
							}
						})
					);
					signedResults.forEach((r: any) => {
						if (r?.id) profileMap[r.id] = r.url;
					});
				}
			}

			const filtered = data
				.filter((d: any) => {
					if (!d.author_user_id && (!d.author_user_ids || d.author_user_ids.length === 0)) return true;
					const ids = d.author_user_ids && d.author_user_ids.length > 0 ? d.author_user_ids : [d.author_user_id];
					return ids.some((id: string) => validAuthors.has(id));
				})
				.map((d: any) => {
					const ids = d.author_user_ids && d.author_user_ids.length > 0 ? d.author_user_ids : (d.author_user_id ? [d.author_user_id] : []);
					const firstMeta = ids.length > 0 ? authorMeta[ids[0]] : null;
					return {
						...d,
						author_name: firstMeta ? (firstMeta.name ?? firstMeta.username ?? firstMeta.email ?? null) : null,
						author_username: firstMeta?.username ?? null,
						author_position: firstMeta?.position ?? null,
						profilePicture: ids.length > 0 ? profileMap[ids[0]] ?? null : null,
					};
				});
			return NextResponse.json({ docs: filtered });
		}


		if (action === "get_doc") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const docId = body?.docId;
			if (!docId) return NextResponse.json({ error: "docId is required" }, { status: 400 });

			const { data: docRow, error: docErr } = await client
				.from("cancer_docs")
				.select("id, slug, title, content, color, position, author_user_id, author_user_ids, hidden, created_at, updated_at")
				.eq("id", docId)
				.limit(1)
				.maybeSingle();

			if (docErr) return NextResponse.json({ error: docErr.message }, { status: 400 });
			if (!docRow) return NextResponse.json({ error: "Document not found" }, { status: 404 });

			if (!session.user.admin_access && docRow.author_user_id !== session.user.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 });
			}

			let authorMeta: { name: string | null; username: string | null; email: string | null; position: string | null } | null = null;
			let profilePicture: string | null = null;

			const idsToFetch = docRow.author_user_ids && docRow.author_user_ids.length > 0 ? docRow.author_user_ids : (docRow.author_user_id ? [docRow.author_user_id] : []);

			if (idsToFetch.length > 0) {
				const { data: userRows, error: userErr } = await client
					.from("users")
					.select("id, name, username, email, position")
					.in("id", idsToFetch);

				if (userErr) return NextResponse.json({ error: userErr.message }, { status: 400 });
				if (userRows && userRows.length > 0) {
					// Join names for display
					const names = userRows.map((u: any) => u.name ?? u.username ?? u.email ?? "Unknown");
					const joinedName = names.join(" and ");

					authorMeta = {
						name: joinedName,
						username: userRows[0].username ?? null,
						email: userRows[0].email ?? null,
						position: userRows[0].position ?? null,
					};

					// Get profile picture of the first author
					const { data: picRow } = await client
						.from("profile_pictures")
						.select("object_key")
						.eq("user_id", userRows[0].id)
						.limit(1)
						.maybeSingle();

					if (picRow?.object_key) {
						try {
							const signed = await client.storage.from("profile-picture").createSignedUrl(picRow.object_key, 60 * 60 * 24 * 7);
							profilePicture = signed.data?.signedUrl ?? null;
						} catch (e) {
							profilePicture = null;
						}
					}
				}
			}

			return NextResponse.json({
				doc: {
					...docRow,
					author_name: authorMeta?.name ?? authorMeta?.username ?? authorMeta?.email ?? null,
					author_username: authorMeta?.username ?? null,
					author_position: authorMeta?.position ?? null,
					profilePicture,
					authorIds: idsToFetch,
				},
				isAdmin: session.user.admin_access,
			});
		}


		if (action === "submit_doc_change") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { docId, slug, title, content, color, authorIds, coAuthorUsernames, overrideAuthors } = body ?? {};
			if (!slug || !title || !content) return NextResponse.json({ error: "slug, title, and content are required" }, { status: 400 });

			let finalAuthorIds = authorIds && authorIds.length > 0 ? authorIds : [session.user.id];
			if (coAuthorUsernames && typeof coAuthorUsernames === 'string') {
				const unames = coAuthorUsernames.split(",").map(u => u.trim()).filter(Boolean);
				if (unames.length > 0) {
					const { data: coAuthors } = await client.from("users").select("id").in("username", unames);
					if (coAuthors) {
						if (overrideAuthors) {
							finalAuthorIds = coAuthors.map((c: any) => c.id);
						} else {
							finalAuthorIds = Array.from(new Set([...finalAuthorIds, ...coAuthors.map((c: any) => c.id)]));
						}
					}
				} else if (overrideAuthors) {
					// Blank field on override = keep who was there, or clear it out
					// For safety, we enforce at least the editor is an author if they clear it
					finalAuthorIds = [session.user.id];
				}
			}

			if (docId) {
				const { data: ownerRow, error: ownerErr } = await client
					.from("cancer_docs")
					.select("author_user_id, author_user_ids")
					.eq("id", docId)
					.limit(1)
					.maybeSingle();

				if (ownerErr) return NextResponse.json({ error: ownerErr.message }, { status: 400 });
				if (!ownerRow) return NextResponse.json({ error: "Document not found" }, { status: 404 });

				const isAuthor = ownerRow.author_user_id === session.user.id || (ownerRow.author_user_ids && ownerRow.author_user_ids.includes(session.user.id));
				if (!session.user.admin_access && !isAuthor) {
					return NextResponse.json({ error: "Forbidden" }, { status: 403 });
				}

				// Only admins can modify authors of an existing article.
				// For non-admins, force the author array back to its original state.
				if (!session.user.admin_access) {
					finalAuthorIds = ownerRow.author_user_ids && ownerRow.author_user_ids.length > 0 ? ownerRow.author_user_ids : [ownerRow.author_user_id];
				} else if (!overrideAuthors && !coAuthorUsernames && ownerRow.author_user_ids) {
					finalAuthorIds = ownerRow.author_user_ids.length > 0 ? ownerRow.author_user_ids : [ownerRow.author_user_id];
				}
			}

			const submissionPayload = {
				doc_id: docId ?? null,
				slug,
				title,
				content,
				color: color ?? null,
				author_user_id: session.user.id,
				author_user_ids: finalAuthorIds,
				status: "pending",
			};

			let submission;
			try {
				const { data, error: subErr } = await client
					.from("cancer_doc_submissions")
					.insert(submissionPayload)
					.select()
					.maybeSingle();

				if (subErr) {
					return NextResponse.json({ error: `Submission Insert Failed: ${subErr.message}` }, { status: 400 });
				}
				submission = data;
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				return NextResponse.json({ error: `Submission Logic Error: ${msg}` }, { status: 400 });
			}

			// Auto-approve removed upon request. All submissions go to pending.

			return NextResponse.json({ submission, autoApproved: false });
		}


		if (action === "list_doc_submissions") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const statusFilter = (body?.status as "pending" | "approved" | "rejected" | "all" | undefined) ?? (session.user.admin_access ? "pending" : "all");

			const query = client
				.from("cancer_doc_submissions")
				.select("id, doc_id, slug, title, content, color, author_user_id, author_user_ids, status, reviewer_user_id, reviewer_note, created_at, updated_at")
				.order("created_at", { ascending: true });

			if (session.user.admin_access) {
				if (statusFilter && statusFilter !== "all") query.eq("status", statusFilter);
			} else {
				query.eq("author_user_id", session.user.id);
				if (statusFilter && statusFilter !== "all") query.eq("status", statusFilter);
			}

			const { data, error } = await query;
			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			const authorIds = Array.from(new Set(
				(data ?? []).flatMap((d: any) => d.author_user_ids && d.author_user_ids.length > 0 ? d.author_user_ids : [d.author_user_id]).filter(Boolean)
			));
			let authors: Record<string, { name: string | null; username: string | null; email: string | null; position: string | null }> = {};
			if (authorIds.length) {
				const { data: usersRows } = await client
					.from("users")
					.select("id, name, username, email, position")
					.in("id", authorIds);
				(usersRows ?? []).forEach((u: any) => {
					authors[u.id] = {
						name: u.name ?? null,
						username: u.username ?? null,
						email: u.email ?? null,
						position: u.position ?? null,
					};
				});
			}

			const submissions = (data ?? []).map((d: any) => {
				const ids = d.author_user_ids && d.author_user_ids.length > 0 ? d.author_user_ids : (d.author_user_id ? [d.author_user_id] : []);
				const authorNames = ids.map((id: string) => authors[id]?.name ?? authors[id]?.username ?? authors[id]?.email ?? "Unknown");

				return {
					...d,
					author: ids.length > 0 && authors[ids[0]] ? {
						...authors[ids[0]],
						name: authorNames.join(" and "),
					} : null,
				};
			});

			return NextResponse.json({ submissions });
		}


		if (action === "review_doc_submission") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });


			const submissionId = body?.submissionId;
			const decision = body?.decision;
			const reviewerNote = body?.reviewerNote ?? null;
			if (!submissionId || !decision) return NextResponse.json({ error: "submissionId and decision are required" }, { status: 400 });

			const { data: submission, error: subErr } = await client
				.from("cancer_doc_submissions")
				.select("*")
				.eq("id", submissionId)
				.limit(1)
				.maybeSingle();
			if (subErr) return NextResponse.json({ error: subErr.message }, { status: 400 });
			if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
			if (submission.status !== "pending") return NextResponse.json({ error: "Submission already reviewed" }, { status: 400 });
			if (submission.author_user_id === session.user.id) return NextResponse.json({ error: "You cannot review your own submission" }, { status: 403 });

			if (decision === "approve") {
				try {
					const applied = await applySubmissionToDocs(client, submission as DocSubmissionRow, session.user.id);
					revalidatePath('/article', 'layout');
					return NextResponse.json({ submission: applied.submission, doc: applied.applied, status: "approved" });
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					return NextResponse.json({ error: message }, { status: 400 });
				}
			}

			const { data: updated, error: rejectErr } = await client
				.from("cancer_doc_submissions")
				.update({ status: "rejected", reviewer_user_id: session.user.id, reviewer_note: reviewerNote ?? null })
				.eq("id", submissionId)
				.select()
				.maybeSingle();
			if (rejectErr) return NextResponse.json({ error: rejectErr.message }, { status: 400 });

			return NextResponse.json({ submission: updated, status: "rejected" });
		}

		if (action === "list_story_submissions") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const statusFilter = (body?.status as "pending" | "approved" | "rejected" | "all" | undefined) ?? (session.user.admin_access ? "pending" : "all");

			const query = client
				.from("survivor_story_submissions")
				.select("*")
				.order("created_at", { ascending: true });

			if (session.user.admin_access) {
				if (statusFilter && statusFilter !== "all") query.eq("status", statusFilter);
			} else {
				query.eq("user_id", session.user.id);
				if (statusFilter && statusFilter !== "all") query.eq("status", statusFilter);
			}

			const { data, error } = await query;
			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			const authorIds = Array.from(new Set((data ?? []).map((d: any) => d.user_id).filter(Boolean)));
			let authors: Record<string, { username: string | null; name: string | null; email: string | null }> = {};
			if (authorIds.length) {
				const { data: usersRows } = await client
					.from("users_public")
					.select("id, username, name, email")
					.in("id", authorIds);
				(usersRows ?? []).forEach((u: any) => {
					authors[u.id] = {
						username: u.username ?? null,
						name: u.name ?? null,
						email: u.email ?? null,
					};
				});
			}

			const submissions = (data ?? []).map((d: any) => ({
				...d,
				author: authors[d.user_id] ?? null,
			}));

			return NextResponse.json({ submissions });
		}

		if (action === "review_story_submission") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const submissionId = body?.submissionId;
			const decision = body?.decision;
			const reviewerNote = body?.reviewerNote ?? null;
			if (!submissionId || !decision) return NextResponse.json({ error: "submissionId and decision are required" }, { status: 400 });

			const { data: submission, error: subErr } = await client
				.from("survivor_story_submissions")
				.select("*")
				.eq("id", submissionId)
				.maybeSingle();

			if (subErr) return NextResponse.json({ error: subErr.message }, { status: 400 });
			if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
			if (submission.status !== "pending") return NextResponse.json({ error: "Submission already reviewed" }, { status: 400 });
			if (submission.user_id === session.user.id) return NextResponse.json({ error: "You cannot review your own submission" }, { status: 403 });

			if (decision === "approve") {
				try {
					const result = await applyStorySubmission(client, submission as StorySubmissionRow, session.user.id);
					revalidatePath('/survivor-stories', 'layout');
					return NextResponse.json({ submission: result.submission, story: result.applied, status: "approved" });
				} catch (err) {
					return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
				}
			}

			const { data: updated, error: rejectErr } = await client
				.from("survivor_story_submissions")
				.update({ status: "rejected", reviewer_user_id: session.user.id, reviewer_note: reviewerNote })
				.eq("id", submissionId)
				.select()
				.maybeSingle();

			if (rejectErr) return NextResponse.json({ error: rejectErr.message }, { status: 400 });
			return NextResponse.json({ submission: updated, status: "rejected" });
		}

		if (action === "list_blog_submissions") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const statusFilter = (body?.status as "pending" | "approved" | "rejected" | "all" | undefined) ?? (session.user.admin_access ? "pending" : "all");

			const query = client
				.from("blog_submissions")
				.select("*")
				.order("created_at", { ascending: true });

			if (session.user.admin_access) {
				if (statusFilter && statusFilter !== "all") query.eq("status", statusFilter);
			} else {
				query.eq("user_id", session.user.id);
				if (statusFilter && statusFilter !== "all") query.eq("status", statusFilter);
			}

			const { data, error } = await query;
			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			const authorIds = Array.from(new Set((data ?? []).map((d: any) => d.user_id).filter(Boolean)));
			let authors: Record<string, { username: string | null; name: string | null; email: string | null }> = {};
			if (authorIds.length) {
				const { data: usersRows } = await client
					.from("users_public")
					.select("id, username, name, email")
					.in("id", authorIds);
				(usersRows ?? []).forEach((u: any) => {
					authors[u.id] = {
						username: u.username ?? null,
						name: u.name ?? null,
						email: u.email ?? null,
					};
				});
			}

			const submissions = (data ?? []).map((d: any) => ({
				...d,
				author: authors[d.user_id] ?? null,
			}));

			return NextResponse.json({ submissions });
		}

		if (action === "review_blog_submission") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const submissionId = body?.submissionId;
			const decision = body?.decision;
			const reviewerNote = body?.reviewerNote ?? null;
			if (!submissionId || !decision) return NextResponse.json({ error: "submissionId and decision are required" }, { status: 400 });

			const { data: submission, error: subErr } = await client
				.from("blog_submissions")
				.select("*")
				.eq("id", submissionId)
				.maybeSingle();

			if (subErr) return NextResponse.json({ error: subErr.message }, { status: 400 });
			if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
			if (submission.status !== "pending") return NextResponse.json({ error: "Submission already reviewed" }, { status: 400 });
			if (submission.user_id === session.user.id) return NextResponse.json({ error: "You cannot review your own submission" }, { status: 403 });

			if (decision === "approve") {
				try {
					const result = await applyBlogSubmission(client, submission as BlogSubmissionRow, session.user.id);
					revalidatePath('/blogs', 'layout');
					return NextResponse.json({ submission: result.submission, blog: result.applied, status: "approved" });
				} catch (err) {
					return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 400 });
				}
			}

			const { data: updated, error: rejectErr } = await client
				.from("blog_submissions")
				.update({ status: "rejected", reviewer_user_id: session.user.id, reviewer_note: reviewerNote })
				.eq("id", submissionId)
				.select()
				.maybeSingle();

			if (rejectErr) return NextResponse.json({ error: rejectErr.message }, { status: 400 });
			return NextResponse.json({ submission: updated, status: "rejected" });
		}


		if (action === "create_doc") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const { slug, title, content, color, position, authorIds, coAuthorUsernames } = body ?? {};
			if (!slug || !title || !content) {
				return NextResponse.json({ error: "slug, title, and content are required" }, { status: 400 });
			}

			let finalAuthorIds = authorIds && authorIds.length > 0 ? authorIds : [session.user.id];
			if (coAuthorUsernames && typeof coAuthorUsernames === 'string') {
				const unames = coAuthorUsernames.split(",").map(u => u.trim()).filter(Boolean);
				if (unames.length > 0) {
					const { data: coAuthors } = await client.from("users").select("id").in("username", unames);
					if (coAuthors) {
						finalAuthorIds = Array.from(new Set([...finalAuthorIds, ...coAuthors.map((c: any) => c.id)]));
					}
				}
			}

			const { data, error } = await client
				.from("cancer_docs")
				.insert({
					slug,
					title,
					content,
					color: color ?? null,
					position: position ?? null,
					author_user_id: finalAuthorIds[0],
					author_user_ids: finalAuthorIds,
				})
				.select("id, slug, title, content, color, position, author_user_id, author_user_ids")
				.maybeSingle();

			if (error) return NextResponse.json({ error: error.message }, { status: 400 });
			revalidatePath('/article', 'layout');
			return NextResponse.json({ doc: data });
		}

		if (action === "update_doc") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { docId, slug, title, content, color, position, authorIds, coAuthorUsernames, overrideAuthors, hidden } = body ?? {};
			if (!docId) return NextResponse.json({ error: "docId is required" }, { status: 400 });

			// Ensure ownership unless admin
			const ownershipCheck = client
				.from("cancer_docs")
				.select("author_user_id, author_user_ids")
				.eq("id", docId)
				.limit(1)
				.maybeSingle();
			const { data: ownerRow, error: ownerErr } = await ownershipCheck;
			if (ownerErr) return NextResponse.json({ error: ownerErr.message }, { status: 400 });
			if (!ownerRow) return NextResponse.json({ error: "Document not found" }, { status: 404 });

			const isAuthor = ownerRow.author_user_id === session.user.id || (ownerRow.author_user_ids && ownerRow.author_user_ids.includes(session.user.id));
			if (!session.user.admin_access && !isAuthor) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 });
			}

			const updates: Record<string, unknown> = {};
			if (slug !== undefined) updates.slug = slug;
			if (title !== undefined) updates.title = title;
			if (content !== undefined) updates.content = content;
			if (color !== undefined) updates.color = color;
			if (position !== undefined) updates.position = position;
			if (hidden !== undefined) updates.hidden = hidden;

			// Author updates only allowed for admins
			if (session.user.admin_access && (authorIds !== undefined || coAuthorUsernames !== undefined)) {
				let finalAuthorIds = ownerRow.author_user_ids && ownerRow.author_user_ids.length > 0 ? ownerRow.author_user_ids : [ownerRow.author_user_id];

				if (authorIds && authorIds.length > 0) {
					finalAuthorIds = overrideAuthors ? authorIds : Array.from(new Set([...finalAuthorIds, ...authorIds]));
				}

				if (coAuthorUsernames && typeof coAuthorUsernames === 'string') {
					const unames = coAuthorUsernames.split(",").map(u => u.trim()).filter(Boolean);
					if (unames.length > 0) {
						const { data: coAuthors } = await client.from("users").select("id").in("username", unames);
						if (coAuthors) {
							if (overrideAuthors) {
								finalAuthorIds = coAuthors.map((c: any) => c.id);
							} else {
								finalAuthorIds = Array.from(new Set([...finalAuthorIds, ...coAuthors.map((c: any) => c.id)]));
							}
						}
					} else if (overrideAuthors) {
						finalAuthorIds = [session.user.id];
					}
				}

				updates.author_user_id = finalAuthorIds[0] || null;
				updates.author_user_ids = finalAuthorIds;
			}

			if (Object.keys(updates).length === 0) {
				return NextResponse.json({ error: "No fields to update" }, { status: 400 });
			}

			const { data, error } = await client
				.from("cancer_docs")
				.update(updates)
				.eq("id", docId)
				.select("id, slug, title, content, color, position, author_user_id, hidden")
				.maybeSingle();

			if (error) return NextResponse.json({ error: error.message }, { status: 400 });
			revalidatePath('/article', 'layout');
			return NextResponse.json({ doc: data });
		}

		if (action === "delete_doc") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const { docId } = body ?? {};
			if (!docId) return NextResponse.json({ error: "docId is required" }, { status: 400 });

			const { error } = await client.from("cancer_docs").update({ hidden: true }).eq("id", docId); if (error) return NextResponse.json({ error: error.message }, { status: 400 });
			revalidatePath('/article', 'layout');
			return NextResponse.json({ ok: true });
		}

		if (action === "search_users") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const q = body?.query;
			if (!q || typeof q !== "string") {
				return NextResponse.json({ users: [] });
			}

			const { data: users, error } = await client
				.from("users")
				.select("id, username, name, email")
				.or(`username.ilike.%${q}%,name.ilike.%${q}%,email.ilike.%${q}%`)
				.limit(5);

			if (error) return NextResponse.json({ error: error.message }, { status: 400 });
			return NextResponse.json({ users: users || [] });
		}


		if (action === "list_blogs") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { forceOwn } = body ?? {};
			let query = client
				.from("blogs")
				.select("*, users_public(name, username, avatar_url, bio)")
				.order("created_at", { ascending: false });

			if (!session.user.admin_access || forceOwn) {
				// We need to find the users_public ID for this employee
				const { data: pubUser } = await client
					.from("users_public")
					.select("id")
					.eq("email", session.user.email.toLowerCase())
					.maybeSingle();
				if (pubUser) query = query.eq("user_id", pubUser.id);
				else return NextResponse.json({ blogs: [] });
			}

			const { data, error } = await query;
			if (error) return NextResponse.json({ error: error.message }, { status: 500 });
			return NextResponse.json({ blogs: data });
		}

		if (action === "get_blog") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { blogId } = body ?? {};
			if (!blogId) return NextResponse.json({ error: "blogId is required" }, { status: 400 });

			const { data, error } = await client
				.from("blogs")
				.select("*, users_public(name, username, avatar_url, bio)")
				.eq("id", blogId)
				.maybeSingle();

			if (error) return NextResponse.json({ error: error.message }, { status: 500 });
			if (!data) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

			return NextResponse.json({ blog: data });
		}

		if (action === "update_blog") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { blogId, title, slug, content, tags, hidden } = body ?? {};
			if (!blogId) return NextResponse.json({ error: "blogId is required" }, { status: 400 });

			const updates: any = {};
			if (title !== undefined) updates.title = title;
			if (slug !== undefined) updates.slug = slug;
			if (content !== undefined) updates.content = content;
			if (tags !== undefined) updates.tags = tags;
			if (hidden !== undefined) updates.hidden = hidden; // Use 'hidden' for consistency with blogs table schema

			const { data: existing } = await client.from("blogs").select("user_id").eq("id", blogId).maybeSingle();
			if (!existing) return NextResponse.json({ error: "Blog not found" }, { status: 404 });

			if (!session.user.admin_access) {
				const { data: pubUser } = await client.from("users_public").select("id").eq("email", session.user.email.toLowerCase()).maybeSingle();
				if (!pubUser || existing.user_id !== pubUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
			}

			const { data, error } = await client.from("blogs").update(updates).eq("id", blogId).select().maybeSingle();
			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			revalidatePath('/blogs', 'layout');
			return NextResponse.json({ blog: data });
		}

		if (action === "delete_blog") {
			const session = await getAuthenticatedUser();
			if (!session || !session.user.admin_access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { blogId } = body ?? {};
			if (!blogId) return NextResponse.json({ error: "blogId is required" }, { status: 400 });

			const { error } = await client.from("blogs").update({ hidden: true }).eq("id", blogId);
			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			revalidatePath('/blogs', 'layout');
			return NextResponse.json({ ok: true });
		}

		if (action === "list_stories") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { forceOwn } = body ?? {};
			let query = client
				.from("survivorstories")
				.select("*, users_public:user_id(name, username, avatar_url, bio:description)")
				.order("created_at", { ascending: false });

			if (!session.user.admin_access || forceOwn) {
				const { data: pubUser } = await client
					.from("users_public")
					.select("id")
					.eq("email", session.user.email.toLowerCase())
					.maybeSingle();
				if (pubUser) query = query.eq("user_id", pubUser.id);
				else return NextResponse.json({ stories: [] });
			}

			const { data, error } = await query;
			if (error) return NextResponse.json({ error: error.message }, { status: 500 });
			return NextResponse.json({ stories: data });
		}

		if (action === "get_story") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { storyId } = body ?? {};
			if (!storyId) return NextResponse.json({ error: "storyId is required" }, { status: 400 });

			const { data, error } = await client
				.from("survivorstories")
				.select("*, users_public:user_id(name, username, avatar_url, bio:description)")
				.eq("id", storyId)
				.maybeSingle();

			if (error) return NextResponse.json({ error: error.message }, { status: 500 });
			if (!data) return NextResponse.json({ error: "Story not found" }, { status: 404 });

			return NextResponse.json({ story: data });
		}

		if (action === "update_story") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { storyId, title, slug, content, tags, image_url, colour, hidden } = body ?? {};
			if (!storyId) return NextResponse.json({ error: "storyId is required" }, { status: 400 });

			const updates: any = {};
			if (title !== undefined) updates.title = title;
			if (slug !== undefined) updates.slug = slug;
			if (content !== undefined) updates.content = content;
			if (tags !== undefined) updates.tags = tags;
			if (image_url !== undefined) updates.image_url = image_url;
			if (colour !== undefined) updates.colour = colour;
			if (hidden !== undefined) updates.deleted = hidden;

			const { data: existing } = await client.from("survivorstories").select("user_id").eq("id", storyId).maybeSingle();
			if (!existing) return NextResponse.json({ error: "Story not found" }, { status: 404 });

			if (!session.user.admin_access) {
				const { data: pubUser } = await client.from("users_public").select("id").eq("email", session.user.email.toLowerCase()).maybeSingle();
				if (!pubUser || existing.user_id !== pubUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
			}

			const { data, error } = await client.from("survivorstories").update(updates).eq("id", storyId).select().maybeSingle();
			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			revalidatePath('/survivor-stories', 'layout');
			return NextResponse.json({ story: data });
		}

		if (action === "delete_story") {
			const session = await getAuthenticatedUser();
			if (!session || !session.user.admin_access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { storyId } = body ?? {};
			if (!storyId) return NextResponse.json({ error: "storyId is required" }, { status: 400 });

			const { error } = await client.from("survivorstories").update({ deleted: true }).eq("id", storyId);
			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			revalidatePath('/survivor-stories', 'layout');
			return NextResponse.json({ ok: true });
		}

		if (action === "delete_user") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const targetUserId = body?.targetUserId;
			if (!targetUserId) return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
			if (targetUserId === session.user.id) return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });

			// Null out authored docs so they stay visible (though they should stay visible anyway)
			// const { error: docErr } = await client
			// 	.from("cancer_docs")
			// 	.update({ author_user_id: null })
			// 	.eq("author_user_id", targetUserId);
			// if (docErr) return NextResponse.json({ error: docErr.message }, { status: 400 });

			// Remove login sessions for that user
			await client.from("login_sessions").delete().eq("user_id", targetUserId);

			// Mark user as legacy instead of deleting
			const { error: delErr } = await client.from("users").update({ is_legacy: true, admin_access: false }).eq("id", targetUserId);
			if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

			return NextResponse.json({ ok: true });
		}

		if (action === "system_check") {
			const session = await getAuthenticatedUser();
			if (!session || !session.user.admin_access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			const results: Record<string, any> = {};

			const { data: articles } = await client.from("cancer_docs").select("id, title, author_user_id").limit(5);
			results.articles = articles;

			const { data: employees } = await client.from("users").select("id, email, username").limit(5);
			results.employees = employees;

			const { data: publicUsers } = await client.from("users_public").select("id, email, username").limit(5);
			results.public_users = publicUsers;

			const { data: pfps } = await client.from("profile_pictures").select("*").limit(1);
			results.profile_pictures_sample = pfps;

			const { data: coauthors } = await client.from("article_co_authors").select("*").limit(5);
			results.co_authors = coauthors;

			return NextResponse.json({ results });
		}

		if (action === "logout") {
			const token = (await cookies()).get(COOKIE_NAME)?.value;
			if (token) {
				try {
					const tokenHash = await hashToken(token);
					await client.from("login_sessions").delete().eq("token_hash", tokenHash);
				} catch (e) {
					vlog("logout.cleanup_error", { message: e instanceof Error ? e.message : e });
				}
			}
			const resp = NextResponse.json({ ok: true });
			resp.cookies.set({
				name: COOKIE_NAME,
				value: "",
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 0,
			});
			return resp;
		}

		if (action === "get_leadership") {
			const { data: usersData, error } = await client
				.from("users")
				.select("id, username, name, position, description, avatar_url")
				.order("created_at", { ascending: true });

			if (error) return NextResponse.json({ error: error.message }, { status: 500 });

			const bucket = "profile-picture";
			const profileMap: Record<string, string | null> = {};
			if (usersData?.length) {
				const userIds = usersData.map((u: any) => u.id);
				const { data: pics, error: picErr } = await client
					.from("profile_pictures")
					.select("user_id, object_key")
					.in("user_id", userIds);
				if (!picErr && pics) {
					const signedResults = await Promise.all(
						pics.map(async (p: any) => {
							if (!p.object_key) return { id: p.user_id, url: null };
							try {
								const signed = await client.storage.from(bucket).createSignedUrl(p.object_key, 60 * 60 * 24 * 7);
								return { id: p.user_id, url: signed.data?.signedUrl ?? null };
							} catch (e) {
								return { id: p.user_id, url: null };
							}
						})
					);
					signedResults.forEach((r: any) => {
						if (r?.id) profileMap[r.id] = r.url;
					});
				}
			}

			const usersWithPictures = (usersData ?? []).map((u: any) => ({
				...u,
				profilePicture: profileMap[u.id] || u.avatar_url || null
			}));
			return NextResponse.json({ users: usersWithPictures });
		}

		if (action === "list_public_users") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const { data: publicUsers, error } = await client
				.from("users_public")
				.select("id, username, email, name, bio, avatar_url, created_at")
				.eq("deleted", false)
				.order("created_at", { ascending: false });

			if (error) return NextResponse.json({ error: error.message }, { status: 500 });
			if (!publicUsers) return NextResponse.json({ users: [] });

			// Fetch all employees to check for merges
			const emails = publicUsers.map((u: any) => u.email.toLowerCase());
			const { data: employees } = await client
				.from("users")
				.select("id, email, name, position, description")
				.in("email", emails);

			const employeeMap = new Map();
			employees?.forEach((e: any) => employeeMap.set(e.email.toLowerCase(), e));

			// Fetch profile photos for these employees
			const employeeIds = employees?.map((e: any) => e.id) || [];
			const photoMap = new Map();
			if (employeeIds.length) {
				const { data: photos } = await client
					.from("profile_pictures")
					.select("user_id, object_key")
					.in("user_id", employeeIds);

				if (photos) {
					await Promise.all(photos.map(async (p: any) => {
						try {
							const signed = await client.storage.from("profile-picture").createSignedUrl(p.object_key, 60 * 60 * 24 * 7);
							if (signed.data?.signedUrl) photoMap.set(p.user_id, signed.data.signedUrl);
						} catch (e) { }
					}));
				}
			}

			const mergedUsers = publicUsers.map((u: any) => {
				const emp = employeeMap.get(u.email.toLowerCase());
				if (emp) {
					return {
						...u,
						name: emp.name || u.name,
						bio: emp.description || u.bio,
						avatar_url: photoMap.get(emp.id) || u.avatar_url,
						is_employee: true,
						employee_id: emp.id
					};
				}
				return { ...u, is_employee: false };
			});

			return NextResponse.json({ users: mergedUsers });
		}

		if (action === "update_public_user") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const { targetUserId, username, email, name, bio, password } = body ?? {};
			if (!targetUserId) return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });

			const updates: Record<string, unknown> = {};
			if (username !== undefined) updates.username = username ? username.toLowerCase() : null;
			if (email !== undefined) updates.email = email ? email.toLowerCase() : null;
			if (name !== undefined) updates.name = name ?? null;
			if (bio !== undefined) updates.bio = bio ?? null;
			if (password) updates.password = await bcrypt.hash(password, 10);
			updates.updated_at = new Date().toISOString();

			const { data: updatedPublic, error } = await client
				.from("users_public")
				.update(updates)
				.eq("id", targetUserId)
				.select("id, username, email, name, bio, avatar_url")
				.maybeSingle();

			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			// If this public user is also an employee, sync the changes to the "users" table
			if (updatedPublic?.email) {
				const { data: employee } = await client
					.from("users")
					.select("id")
					.eq("email", updatedPublic.email.toLowerCase())
					.maybeSingle();

				if (employee) {
					const empUpdates: Record<string, unknown> = {};
					if (username !== undefined) empUpdates.username = username || null;
					if (name !== undefined) empUpdates.name = name ?? null;
					if (bio !== undefined) empUpdates.description = bio ?? null;
					if (password) empUpdates.password = await bcrypt.hash(password, 10);

					if (Object.keys(empUpdates).length > 0) {
						await client
							.from("users")
							.update(empUpdates)
							.eq("id", employee.id);
					}
				}
			}

			return NextResponse.json({ user: updatedPublic });
		}

		if (action === "delete_public_user") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const { targetUserId } = body ?? {};
			if (!targetUserId) return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });

			// We do a soft delete like the public-auth might (based on the "deleted" check in list_public_users)
			const { error } = await client
				.from("users_public")
				.update({ deleted: true, updated_at: new Date().toISOString() })
				.eq("id", targetUserId);

			if (error) return NextResponse.json({ error: error.message }, { status: 400 });

			return NextResponse.json({ ok: true });
		}

		if (action === "update_pfp") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			const { targetUserId, object_key, content_type, size } = body as any;
			if (!targetUserId || !object_key) {
				return NextResponse.json({ error: "targetUserId and object_key are required" }, { status: 400 });
			}

			// Admins can update anyone, others only themselves
			if (!session.user.admin_access && targetUserId !== session.user.id) {
				return NextResponse.json({ error: "Forbidden" }, { status: 403 });
			}

			// Delete existing record
			await client.from("profile_pictures").delete().eq("user_id", targetUserId);

			// Insert new record
			const { error } = await client.from("profile_pictures").insert({
				user_id: targetUserId,
				object_key,
				content_type: content_type || "image/png",
				size: size || 0,
			});

			if (error) return NextResponse.json({ error: error.message }, { status: 500 });
			return NextResponse.json({ ok: true });
		}

		if (action === "get_site_settings") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

			try {
				const { data, error } = await client
					.from("site_settings")
					.select("key, value");

				if (error) throw error;

				const settings = data?.map((s: any) => ({
					key: s.key,
					value: s.value
				})) || [];

				// Ensure maintenance_mode is present if we found nothing
				if (!settings.some((s: any) => s.key === "maintenance_mode")) {
					settings.push({ key: "maintenance_mode", value: { enabled: false } });
				}

				return NextResponse.json({ settings });
			} catch (err: any) {
				console.error("get_site_settings error:", err);
				return NextResponse.json({ settings: [{ key: "maintenance_mode", value: { enabled: false } }] });
			}
		}

		if (action === "update_site_settings") {
			const session = await getAuthenticatedUser();
			if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
			if (!session.user.admin_access) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

			const { key, value } = body as any;
			if (key === "maintenance_mode") {
				try {
					const { error } = await client
						.from("site_settings")
						.upsert({ key, value, updated_at: new Date().toISOString() });

					if (error) throw error;

					return NextResponse.json({ setting: { key, value } });
				} catch (err: any) {
					console.error("update_site_settings error:", err);
					return NextResponse.json({ error: `Failed to update ${key}: ${err.message}` }, { status: 500 });
				}
			}

			return NextResponse.json({ error: "Unsupported setting key" }, { status: 400 });
		}

		return NextResponse.json({ error: "Unknown action" }, { status: 400 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
		vlog("post.error", { message, raw: e });
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
