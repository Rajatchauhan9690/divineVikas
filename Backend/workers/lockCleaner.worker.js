import Session from "../models/session.model.js";
import { isLockExpired } from "../utils/lock.util.js";

const CLEAN_INTERVAL = 60 * 1000;

/*
===========================================
LOCK CLEANER WORKER
===========================================
*/

export const startLockCleanerWorker = () => {
  console.log("⚙️ Lock Cleaner Worker Started");

  setInterval(async () => {
    try {
      console.log("🧹 Worker scanning expired locks...");

      const sessions = await Session.find();

      for (const session of sessions) {
        const beforeCount = session.lockedSeats.length;

        session.lockedSeats = session.lockedSeats.filter(
          (seat) => !isLockExpired(seat.lockedAt),
        );

        const afterCount = session.lockedSeats.length;

        if (beforeCount !== afterCount) {
          console.log(
            `✅ Cleaned ${beforeCount - afterCount} locks in session`,
            session._id,
          );

          await session.save();
        }
      }
    } catch (error) {
      console.error("❌ Worker Cleanup Error:", error.message);
    }
  }, CLEAN_INTERVAL);
};
