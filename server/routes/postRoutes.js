import express from "express";
import { upload } from "../configs/multer.js";
import { requireAuth } from "@clerk/express";
import {
  addPost,
  getFeedPosts,
  likePost,
} from "../controllers/postController.js";

const postRouter = express.Router();

postRouter.post(
  "/add",
  requireAuth(),              // ✅ FIRST
  upload.array("images", 4),  // ✅ SECOND
  addPost
);

postRouter.get("/feed", requireAuth(), getFeedPosts);
postRouter.post("/like", requireAuth(), likePost);

export default postRouter;
