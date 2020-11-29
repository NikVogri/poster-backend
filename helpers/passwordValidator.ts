import bcrypt from 'bcrypt';

const passwordValidator = (password: string, storedPassword: string) => {
  return bcrypt.compareSync(password, storedPassword);  
} 

export default passwordValidator;