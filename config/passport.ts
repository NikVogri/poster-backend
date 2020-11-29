import LocalStrategy from 'passport-local';
import validatePassword from '../helpers/passwordValidator';
import User from '../models/User';
import {User as UserInterface} from '../interfaces/userInterface';
import { PassportStatic } from 'passport';

const initializePassport = (passport: PassportStatic) => {
  passport.use(new LocalStrategy.Strategy({usernameField: 'email'}, authUser));

  passport.serializeUser((email: string, done: Function) => {
    done(null, email);
  });

  passport.deserializeUser((email: string, done: Function) => {
    done(null, email);
  });
}

const authUser = async (email: string, password: string, done: any) => {
    try {
      const user = await User.findOne({where: {email}});
      // make sure user exists & password is correct
      if (!user || !validatePassword(password, user.password)) {
        return done(null, false, { message: ' Invalid email and password combination' });
      }

      return done(null, user);
    } catch(err) {
      return done(null, false, { message: err.message });
    }
  }


export default initializePassport;