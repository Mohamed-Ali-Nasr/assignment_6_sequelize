import { CookieOptions, RequestHandler } from "express";
import User from "../models/user.model";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/generateTokens";
import { dbConnection } from "../db/connection";

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

export const register: RequestHandler<
  unknown,
  unknown,
  RegisterBody,
  unknown
> = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    await dbConnection();

    if (!username || !email || !password) {
      throw createHttpError(406, "Missing data!");
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw createHttpError(
        400,
        "User Already Exists. Please Choose a Different One Or Log In Instead."
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

interface LoginBody {
  email: string;
  password: string;
}

export const login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    await dbConnection();

    if (!email || !password) {
      throw createHttpError(406, "Missing data!");
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw createHttpError(400, "Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createHttpError(400, "Invalid email or password.");
    }

    const { accessToken } = await generateTokens(user);

    res.cookie("jwt", accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      httpOnly: true,
      sameSite: "none",
    } as CookieOptions);

    res.status(201).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  const cookies = req.cookies;

  try {
    if (!cookies?.jwt)
      return res.status(404).json({
        message: "There Is No Token in Cookies Yet, Please Go To Login First",
      });

    res.clearCookie("jwt", {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    } as CookieOptions);

    res.status(200).json({ message: "User Logout Successfully" });
  } catch (error) {
    next(error);
  }
};
