import express from 'express';
import cors from 'cors';

import path from 'path';

import authRoutes from './src/routes/authRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';

import policeStationRoutes from './src/routes/policeStationRoutes.js';
import { fileURLToPath } from 'url';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import cookieParser from "cookie-parser";
import startSessionCleanupJob from './src/utils/sessionCleanUpJob.js';
const app = express();
app.use(cookieParser());
const allowedOrigins = [
  process.env.CLIENT_URL,               // e.g. http://localhost:5173
  "http://localhost:5173",              // second allowed origin
  "http://localhost:5174", 

];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve uploaded photos statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use('/api/police-stations', policeStationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.use(notFound);       // 404 for unknown routes
app.use(errorHandler);   // catches everything forwarded via next(err)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startSessionCleanupJob(); // 👈 start the cron job once the server is up
})
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));