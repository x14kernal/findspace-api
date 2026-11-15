import { Router } from 'express';
import { countriesController } from '../modules/countries/countries.controller';

const router = Router();

router.get('/', countriesController.getAll);

export default router;
