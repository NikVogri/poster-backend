import { DataTypes, Model, Optional } from "sequelize";
import { Post as PostInterface } from "../interfaces/postInterface";
import sequelize from "../helpers/database";
import User from "./User";

interface PostCreationAttributes extends Optional<PostInterface, "id"> {}
interface PostInstance
  extends Model<PostInterface, PostCreationAttributes>,
    PostInterface {}

const Post = sequelize.define<PostInstance>("Post", {
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

Post.belongsTo(User);
User.hasMany(Post);

// runs this if table does not exist else does nothing
Post.sync();

export default Post;
