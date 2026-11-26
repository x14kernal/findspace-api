import { Router } from 'express';
import { featuresController } from '../modules/features/features.controller';

const router = Router();

router.get('/', featuresController.getAll);

export default router;
