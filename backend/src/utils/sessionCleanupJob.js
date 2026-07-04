// utils/sessionCleanupJob.js
import cron from 'node-cron';
import db from '../config/db.js';

const cleanupExpiredSessions = async () => {
  try {
    const [result] = await db.execute(
      `DELETE FROM admin_sessions WHERE expires_at <= NOW()`
    );
    //console.log(`[Session Cleanup] Removed ${result.affectedRows} expired session(s) at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[Session Cleanup] Failed to clear expired sessions:', err.message);
  }
};

const startSessionCleanupJob = () => {
  // Runs every day at 12:00 AM (midnight) server time
  cron.schedule('0 0 * * *', () => {
    cleanupExpiredSessions();
  });

  console.log('[Session Cleanup] Cron job scheduled for 12:00 AM daily');
};

export default startSessionCleanupJob;