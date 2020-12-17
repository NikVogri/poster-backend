import { DataTypes, Model, Optional } from "sequelize";
import { Page as PageInterface } from "../interfaces/pageInterface";
import sequelize from "../helpers/database";
import User from "./User";

interface PageCreationAttributes extends Optional<PageInterface, "id"> {}
interface PageInstance
  extends Model<PageInterface, PageCreationAttributes>,
    PageInterface {}

const Page = sequelize.define<PageInstance>("Page", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Page.belongsTo(User);
User.hasMany(Page);

// runs this if table does not exist else does nothing
Page.sync();

export default Page;
