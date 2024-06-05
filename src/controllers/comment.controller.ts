import { NextFunction, RequestHandler, Response } from "express";
import { IRequest } from "../middlewares/auth.middleware";
import createHttpError from "http-errors";
import { dbConnection } from "../db/connection";
import Post from "../models/post.model";
import Comment from "../models/comment.model";
import User from "../models/user.model";
import { Op } from "sequelize";

export const createComment = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const { content } = req.body;

  const { postId } = req.params;

  try {
    await dbConnection();

    if (!userId || !content || !postId) {
      throw createHttpError(406, "Missing data!");
    }

    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      throw createHttpError(404, "No Posts Found By This ID");
    }

    const newComment = await Comment.create({
      content,
      userId,
      postId,
    });

    await newComment.save();

    res
      .status(201)
      .json({ message: "Comment Created Successfully", newComment });
  } catch (error) {
    next(error);
  }
};

export const getAllComments: RequestHandler = async (req, res, next) => {
  try {
    await dbConnection();

    const comments = await Comment.findAll();

    if (comments.length < 1) {
      throw createHttpError(404, "No Comments Found");
    }

    return res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const getAllPostComments = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { postId } = req.params;

  const { userId } = req;

  try {
    await dbConnection();

    if (!userId || !postId) {
      throw createHttpError(406, "Missing data!");
    }

    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      throw createHttpError(404, "No Posts Found By This ID");
    }

    const comments = await Comment.findAll({ where: { postId } });

    if (comments.length < 1) {
      throw createHttpError(404, "No Comments Found In This Post");
    }

    return res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const { content } = req.body;

  const { postId, commentId } = req.params;

  try {
    await dbConnection();

    if (!content || !userId || !postId || !commentId) {
      throw createHttpError(406, "Missing data!");
    }

    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      throw createHttpError(404, "No Posts Found By This ID");
    }

    const comment = await Comment.findOne({
      where: {
        [Op.and]: [{ id: commentId }, { postId }, { userId }],
      },
    });

    if (!comment) {
      throw createHttpError(404, "No Comments Found By This User");
    }

    await comment.update({ content });

    return res.status(201).json({
      message: `Comment with ID ${commentId} is Updated Successfully`,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const { postId, commentId } = req.params;

  try {
    await dbConnection();

    if (!userId || !postId || !commentId) {
      throw createHttpError(406, "Missing data!");
    }

    const post = await Post.findOne({ where: { id: postId } });

    if (!post) {
      throw createHttpError(404, "No Posts Found By This ID");
    }

    const comment = await Comment.findOne({
      where: { [Op.and]: [{ id: commentId }, { postId }, { userId }] },
    });

    if (!comment) {
      throw createHttpError(404, "No Comments Found By This User");
    }

    await comment.destroy();

    return res.status(201).json({
      message: `Comment with ID ${commentId} is Deleted Successfully`,
      comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPostComments = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { postId } = req.params;

  const { userId } = req;

  try {
    await dbConnection();

    if (!userId || !postId) {
      throw createHttpError(406, "Missing data!");
    }

    const post = await Post.findOne({
      attributes: [
        ["id", "postId"],
        ["title", "postTitle"],
        ["content", "postContent"],
        ["author", "postAuthor"],
        "active",
      ],
      where: {
        [Op.and]: [{ id: postId }, { author: userId }],
      },
      include: [
        {
          model: User,
          as: "userInfo",
          attributes: [["id", "userId"], "username", ["email", "userEmail"]],
          where: { id: userId },
        },
        {
          model: Comment,
          attributes: ["id", "content", "userId"],
          where: { postId },
        },
      ],
    });

    if (!post) {
      throw createHttpError(404, "No Posts Found By This User");
    }

    return res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
