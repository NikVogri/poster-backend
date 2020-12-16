import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../helpers/database";
import User from "./User";
import { User as UserInterface } from "../interfaces/userInterface";

interface ForgotPasswordInterface {
  id?: string;
  token: string;
  UserId?: number;
  User?: UserInterface;
}

interface ForgotPasswordAttributes
  extends Optional<ForgotPasswordInterface, "token"> {}
interface ForgotPasswordInstance
  extends Model<ForgotPasswordInterface, ForgotPasswordAttributes>,
    ForgotPasswordInterface {}

const ForgotPassword = sequelize.define<ForgotPasswordInstance>(
  "ForgotPassword",
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }
);

ForgotPassword.belongsTo(User);

// runs this if table does not exist else does nothing
ForgotPassword.sync();

export default ForgotPassword;
