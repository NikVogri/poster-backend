import express from 'express';
const router = express.Router();
import * as postController from '../controllers/postController';
import checkAuth from '../middleware/checkAuth';

router.get('/', postController.getAll);
router.post('/', checkAuth, postController.create);


export default router;