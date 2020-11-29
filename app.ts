import express, { Request, Response, NextFunction, RequestHandler  } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import session from 'express-session';
import sequelize from './helpers/database';

import initializePassport from './config/passport';

import passport from 'passport';

// routers
import postsRouter from './routes/postsRouter';
import authRouter from './routes/authRouter';

const PORT = process.env.PORT || 5000;

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());
app.use(session({secret: `${process.env.SESSION_SECRET}`, resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

initializePassport(passport);

//ROUTERS
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/auth', authRouter);

// ERROR HANDLER
app.use((err: {errors?: any[], message?: string, statusCode?: number}, _:Request , res: Response, _2: NextFunction) => {
  let error = {
    code: 500,
    errorMessage: 'Something went wrong'
  };

  if (typeof err.errors !== 'object' && err.message && err.statusCode) {
    error.errorMessage = err.message;
    
    if (err.statusCode) {
      error.code = err.statusCode;
    }

  } else if(typeof err.errors === 'object' && err.errors[0].type === 'notNull Violation') {
      error.code = 400; 
      error.errorMessage = 'Please specify all the required fields';
  }

  return res.status(error.code).send({success: false, error: error.errorMessage });
})

// ROOT
app.get("/", (_, res): RequestHandler => {
  return res.send('Welcome to poster API') as any;
});



app.listen(PORT, async () => {
  // Make sure sequelize is connected correctly
  await sequelize.authenticate();
  console.log("Server started on port " + PORT);
});
