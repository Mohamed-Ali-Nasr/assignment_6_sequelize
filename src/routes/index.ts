import express, { Router } from "express";
import auth from "./auth.route";
import post from "./post.route";
import comment from "./comment.route";

const router = express.Router();

export default (): Router => {
  auth(router);
  post(router);
  comment(router);

  return router;
};
