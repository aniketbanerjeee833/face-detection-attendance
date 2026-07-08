// controllers/policeStationController.js
import db from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';

const getPoliceStations = asyncHandler(async (req, res) => {
  const [stations] = await db.query('SELECT id, name FROM police_stations ORDER BY name ASC');
  res.json({ stations });
});

export { getPoliceStations };