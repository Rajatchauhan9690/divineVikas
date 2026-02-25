import Session from "../models/session.model.js";

/*
===========================================
LOCK TTL CONFIG
===========================================
*/

const LOCK_TTL = 5 * 60 * 1000;

/*
===========================================
CHECK LOCK EXPIRY
===========================================
*/

export const isLockExpired = (lockedAt) => {
  return Date.now() - new Date(lockedAt).getTime() > LOCK_TTL;
};

/*
===========================================
CLEAN EXPIRED LOCKS (SESSION LEVEL)
===========================================
*/

export const cleanupExpiredLocks = async (session) => {
  try {
    if (!session) return null;

    console.log("🧹 Cleaning expired locks for session:", session._id);

    session.lockedSeats = session.lockedSeats.filter(
      (seat) => !isLockExpired(seat.lockedAt),
    );

    await session.save();

    return session;
  } catch (error) {
    console.error("❌ Lock Cleanup Error:", error.message);
    return session;
  }
};
