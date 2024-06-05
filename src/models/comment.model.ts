import {
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../db/connection";
import User from "./user.model";
import Post from "./post.model";

interface CommentModel
  extends Model<
    InferAttributes<CommentModel>,
    InferCreationAttributes<CommentModel>
  > {
  id?: number;
  content: string;
  userId?: ForeignKey<string>;
  postId?: ForeignKey<string>;
}

const Comment = sequelize.define<CommentModel>(
  "comment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

User.hasMany(Comment, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Post.hasMany(Comment, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Comment.belongsTo(User);
Comment.belongsTo(Post);

export default Comment;
