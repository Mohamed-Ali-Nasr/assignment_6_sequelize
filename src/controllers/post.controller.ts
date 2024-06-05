import { NextFunction, RequestHandler, Response } from "express";
import { IRequest } from "../middlewares/auth.middleware";
import createHttpError from "http-errors";
import { dbConnection } from "../db/connection";
import Post from "../models/post.model";
import User from "../models/user.model";
import { Op } from "sequelize";

export const createPost = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const { title, content } = req.body;

  try {
    await dbConnection();

    if (!userId || !title || !content) {
      throw createHttpError(406, "Missing data!");
    }

    const existingTitle = await Post.findOne({ where: { title } });
    if (existingTitle) {
      throw createHttpError(
        400,
        "This Title Is Already Exist. Please Choose a Different One"
      );
    }

    const newPost = await Post.create({
      title,
      content,
      author: userId,
    });

    await newPost.save();

    res.status(201).json({ message: "Post Created Successfully", newPost });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts: RequestHandler = async (req, res, next) => {
  try {
    await dbConnection();

    const posts = await Post.findAll();

    if (posts.length < 1) {
      throw createHttpError(404, "No Posts Found");
    }

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const { title, content } = req.body;

  const { postId } = req.params;

  try {
    await dbConnection();

    if (!title || !content || !userId || !postId) {
      throw createHttpError(406, "Missing data!");
    }

    const post = await Post.findOne({
      where: { [Op.and]: [{ id: postId }, { author: userId }] },
    });

    if (!post) {
      throw createHttpError(404, "No Posts Found By This User");
    }

    const existingTitle = await Post.findOne({
      where: { title },
    });

    if (existingTitle) {
      throw createHttpError(
        400,
        "This Title Is Already Exist. Please Choose a Different One"
      );
    }

    await post.update({ title, content });

    return res.status(201).json({
      message: `Post with ID ${postId} is Updated Successfully`,
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const { postId } = req.params;

  try {
    await dbConnection();

    if (!userId || !postId) {
      throw createHttpError(406, "Missing data!");
    }

    const post = await Post.findOne({
      where: { [Op.and]: [{ id: postId }, { author: userId }] },
    });

    if (!post) {
      throw createHttpError(404, "No Posts Found By This User");
    }

    post!.active = false;

    await post?.save();

    return res.status(201).json({
      message: `Post with ID ${postId} is Soft Deleted Successfully`,
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostWithAuthor = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const { postId } = req.params;

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
      include: {
        model: User,
        as: "userInfo",
        attributes: [["id", "userId"], "username", ["email", "userEmail"]],
        where: { id: userId },
      },
    });

    if (!post) {
      throw createHttpError(404, "No Posts Found By This User");
    }

    return res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
