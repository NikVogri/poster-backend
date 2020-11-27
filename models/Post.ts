import { DataTypes } from 'sequelize';
import sequelize from '../helpers/database';

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  }
});
 
// runs this if table does not exist else does nothing
Post.sync();


export default Post;