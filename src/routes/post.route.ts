import { Router } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostWithAuthor,
  updatePost,
} from "../controllers/post.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default (router: Router) => {
  router.post("/posts", authMiddleware, createPost);

  router.get("/posts", authMiddleware, getAllPosts);

  router.get("/posts/:postId", authMiddleware, getPostWithAuthor);

  router.put("/posts/:postId", authMiddleware, updatePost);

  router.delete("/posts/:postId", authMiddleware, deletePost);
};
