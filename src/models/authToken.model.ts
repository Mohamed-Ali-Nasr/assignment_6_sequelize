import {
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../db/connection";
import User from "./user.model";

interface AuthTokenModel
  extends Model<
    InferAttributes<AuthTokenModel>,
    InferCreationAttributes<AuthTokenModel>
  > {
  id?: number;
  token: string;
  userId?: ForeignKey<number>;
}

const AuthToken = sequelize.define<AuthTokenModel>(
  "authToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

AuthToken.belongsTo(User);

export default AuthToken;
