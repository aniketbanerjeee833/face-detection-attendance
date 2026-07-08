// routes/policeStationRoutes.js
import express from 'express';
const router = express.Router();
import { getPoliceStations } from '../controllers/policeStationController.js';

router.get('/', getPoliceStations); // public — needed on the login page before auth exists

export default router;