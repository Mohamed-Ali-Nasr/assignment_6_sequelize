import { Router } from "express";
import {
  createComment,
  deleteComment,
  getAllComments,
  getAllPostComments,
  getUserPostComments,
  updateComment,
} from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export default (router: Router) => {
  router.post("/posts/:postId/comments", authMiddleware, createComment);

  router.get("/posts/:postId/comments", authMiddleware, getAllPostComments);

  router.put(
    "/posts/:postId/comments/:commentId",
    authMiddleware,
    updateComment
  );

  router.delete(
    "/posts/:postId/comments/:commentId",
    authMiddleware,
    deleteComment
  );

  router.get("/comments", authMiddleware, getAllComments);

  router.get(
    "/posts/:postId/userComments",
    authMiddleware,
    getUserPostComments
  );
};
