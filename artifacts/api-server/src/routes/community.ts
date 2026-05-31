import { Router, type IRouter, type Request, type Response } from "express";
import { getAuthUser, type AuthenticatedUser } from "../lib/auth.js";
import {
  listThreads,
  getThreadWithPosts,
  getThreadRow,
  getPostRow,
  createThread,
  createPost,
  setThreadStatus,
  setThreadPinned,
  setPostStatus,
  isValidCategory,
  listCategories,
} from "../services/communityService.js";
import { communityReplyEmail } from "../services/emailTemplates.js";
import { notify } from "../services/notificationService.js";

const router: IRouter = Router();

function requireUser(req: Request, res: Response): AuthenticatedUser | null {
  const user = getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "AUTH_REQUIRED" });
    return null;
  }
  return user;
}

function isModerator(user: AuthenticatedUser | null): boolean {
  return user?.role === "admin" || user?.role === "owner";
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// GET /api/community/categories
router.get("/community/categories", (req, res) => {
  if (!requireUser(req, res)) return;
  res.json({ categories: listCategories() });
});

// GET /api/community/threads — liste des sujets
router.get("/community/threads", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const threads = await listThreads({ includeHidden: isModerator(user) });
    res.json({ threads });
  } catch (err) {
    req.log.error({ err }, "Erreur liste forum");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/community/threads — créer un sujet
router.post("/community/threads", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const title = asText(req.body?.title);
  const body = asText(req.body?.body);
  const category = asText(req.body?.category) || "general";
  if (title.length < 3 || title.length > 160) {
    res.status(400).json({ error: "TITLE_INVALID" });
    return;
  }
  if (body.length > 10000) {
    res.status(400).json({ error: "BODY_TOO_LONG" });
    return;
  }
  if (!isValidCategory(category)) {
    res.status(400).json({ error: "CATEGORY_INVALID" });
    return;
  }
  try {
    const thread = await createThread({ authorUserId: user.id, title, category, body });
    res.status(201).json({ thread });
  } catch (err) {
    req.log.error({ err }, "Erreur creation sujet forum");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/community/threads/:id — sujet + réponses
router.get("/community/threads/:id", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const result = await getThreadWithPosts(req.params["id"] ?? "", { includeHidden: isModerator(user) });
    if (!result) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Erreur lecture sujet forum");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/community/threads/:id/posts — répondre
router.post("/community/threads/:id/posts", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const body = asText(req.body?.body);
  if (body.length < 1 || body.length > 10000) {
    res.status(400).json({ error: "BODY_INVALID" });
    return;
  }
  try {
    const thread = await getThreadRow(req.params["id"] ?? "");
    if (!thread || (thread.status === "hidden" && !isModerator(user))) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }
    if (thread.status !== "open" && !isModerator(user)) {
      res.status(409).json({ error: "THREAD_CLOSED" });
      return;
    }
    const post = await createPost({ threadId: thread.id, authorUserId: user.id, body });
    if (thread.authorUserId !== user.id && thread.status !== "hidden") {
      const threadUrl = `${(process.env["MATRICE_BASE_URL"] ?? process.env["MATRICE_PUBLIC_BASE_URL"] ?? "https://matrice.essuf.fr").replace(/\/$/, "")}/community/${thread.id}`;
      await notify({
        userId: thread.authorUserId,
        type: "community_reply",
        title: "Nouvelle reponse communaute",
        body: `${user.displayName || "Un membre"} a repondu a ton sujet "${thread.title}"`,
        actionUrl: `/community/${thread.id}`,
        actionLabel: "Voir la reponse",
        email: communityReplyEmail({
          threadTitle: thread.title,
          replyAuthorName: user.displayName || "Un membre",
          threadUrl,
        }),
        metadata: { thread_id: thread.id, post_id: post.id },
      });
    }
    res.status(201).json({ post });
  } catch (err) {
    req.log.error({ err }, "Erreur reponse forum");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /api/community/threads/:id — fermer/rouvrir (auteur ou modo), épingler/masquer (modo)
router.patch("/community/threads/:id", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const thread = await getThreadRow(req.params["id"] ?? "");
    if (!thread) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }
    const isAuthor = thread.authorUserId === user.id;
    const modo = isModerator(user);

    if (typeof req.body?.pinned === "boolean") {
      if (!modo) {
        res.status(403).json({ error: "MODERATOR_REQUIRED" });
        return;
      }
      await setThreadPinned(thread.id, req.body.pinned);
    }

    if (typeof req.body?.status === "string") {
      const status = req.body.status as string;
      if (status === "hidden") {
        if (!modo) {
          res.status(403).json({ error: "MODERATOR_REQUIRED" });
          return;
        }
      } else if (status === "open" || status === "closed") {
        if (!isAuthor && !modo) {
          res.status(403).json({ error: "NOT_ALLOWED" });
          return;
        }
      } else {
        res.status(400).json({ error: "STATUS_INVALID" });
        return;
      }
      await setThreadStatus(thread.id, status as "open" | "closed" | "hidden");
    }

    const updated = await getThreadRow(thread.id);
    res.json({ thread: updated });
  } catch (err) {
    req.log.error({ err }, "Erreur moderation sujet forum");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /api/community/posts/:id — masquer/afficher (auteur de SON post, ou modo)
router.patch("/community/posts/:id", async (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const status = asText(req.body?.status);
  if (status !== "visible" && status !== "hidden") {
    res.status(400).json({ error: "STATUS_INVALID" });
    return;
  }
  try {
    const post = await getPostRow(req.params["id"] ?? "");
    if (!post) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }
    if (post.authorUserId !== user.id && !isModerator(user)) {
      res.status(403).json({ error: "NOT_ALLOWED" });
      return;
    }
    const updated = await setPostStatus(post.id, status);
    res.json({ post: updated });
  } catch (err) {
    req.log.error({ err }, "Erreur moderation reponse forum");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
