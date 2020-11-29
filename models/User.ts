import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../helpers/database';
import { User as UserInterface } from '../interfaces/userInterface';


interface UserCreationAttributes extends Optional<UserInterface, "id"> {}
interface UserInstance extends Model<UserInterface, UserCreationAttributes>, UserInterface {};

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
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  }
});

// runs this if table does not exist else does nothing
User.sync();

export default User;