import jwt from "jsonwebtoken";
import env from "./validateEnv";
import { UserModel } from "../models/user.model";
import AuthToken from "../models/authToken.model";

export const generateTokens = async (
  user: UserModel
): Promise<{ accessToken?: string; err?: Error }> => {
  try {
    const accessToken = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const userToken = await AuthToken.findOne({ where: { userId: user.id } });

    if (userToken) await userToken.destroy();

    const newUserToken = await AuthToken.create({
      userId: user.id,
      token: accessToken,
    });

    await newUserToken.save();

    return { accessToken };
  } catch (err: any) {
    return err;
  }
};
