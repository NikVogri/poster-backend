import express from 'express';
const router = express.Router();
import * as postController from '../controllers/postController';

router.get('/', postController.getAll);
router.post('/', postController.create);


export default router;