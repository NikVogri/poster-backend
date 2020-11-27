import express, { Request, Response, NextFunction, RequestHandler  } from "express";
import cors from "cors";
import bodyParser from "body-parser";

import sequelize from './helpers/database';


// routers
import postsRouter from './routes/postsRouter';

const PORT = process.env.PORT || 5000;

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

//ROUTERS
app.use('/api/v1/posts', postsRouter);

// ERROR HANDLER
app.use((err: {errors: any[]}, _:Request , res: Response, _2: NextFunction) => {
  let error = {
    code: 500,
    errorMessage: 'Something went wrong'
  };

  if (err.errors[0].type === 'notNull Violation') {
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
