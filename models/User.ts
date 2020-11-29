import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../helpers/database';
import { User } from '../interfaces/userInterface';


interface UserCreationAttributes extends Optional<User, "id"> {}
interface UserInstance extends Model<User, UserCreationAttributes>, User {};

const User = sequelize.define<UserInstance>('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  }, 
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
});


// runs this if table does not exist else does nothing
User.sync();

export default User;