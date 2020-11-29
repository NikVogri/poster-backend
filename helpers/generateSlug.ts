import {Op} from 'sequelize';
import slugify from 'slugify';
import { User as UserInterface} from '../interfaces/userInterface';
import User from '../models/User';

const generateUniqueSlug = async (username: string): Promise<string> => {
  let usernameSlug = slugify(username, {lower: true, strict: true});
  
  const users: UserInterface[] | [] = await User.findAll({where: {username: {[Op.like]: `${usernameSlug}%`} }});

  if (users.length > 0) {
    usernameSlug += `-${users.length}`; 
  }

  return usernameSlug;
};

export default generateUniqueSlug;