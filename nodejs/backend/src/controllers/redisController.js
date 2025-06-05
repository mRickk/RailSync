import getRedisClient from '../util/redisClient.js';

export const getSolutionLocks = async function(req, res) {
    const solutionId = req.params.solutionId;
    try {
        const redis = await getRedisClient();
        const keys = await redis.keys(`lock:${solutionId}:*`);
        const lockedSeats = keys.map(key => key.replace(`lock:${solutionId}:`, ""));
        res.status(200).json({ lockedSeats });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const createLocksTimeout = async function(req, res) {
    const solutionId = req.params.solutionId;
    const { seat } = req.body;
    const userId = req.user && req.user.id; //requireAuth middleware should ensure userId is available

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!seat) {
        return res.status(400).json({ message: "seat is required in the request body." });
    }

    const lockKey = `lock:${solutionId}:${seat}`;
    try {
        const redis = await getRedisClient();

        const result = await redis.set(lockKey, userId, {
            NX: true, // Solo se la chiave non esiste già
            PX: 30000 // Expiration time: 30 secondi
        });

        if (result === null) {
            return res.status(423).json({ message: "Seat is already locked" }); // 423 Locked
        }

        res.status(200).json({ message: "Lock acquired" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const renewLocksTimeout = async function(req, res) {
    const solutionId = req.params.solutionId;
    const { seat } = req.body;
    const userId = req.user && req.user.id; //requireAuth middleware should ensure userId is available

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!seat) {
        return res.status(400).json({ message: "seat is required in the request body." });
    }

    const lockKey = `lock:${solutionId}:${seat}`;
    try {
        const redis = await getRedisClient();

        const currentValue = await redis.get(lockKey);
        if (currentValue !== userId) {
            return res.status(403).json({ message: "You do not own this lock" });
        }

        const success = await redis.pexpire(lockKey, 30000); // Renew expiration time to 30 seconds
        if (success === 1) {
            res.status(200).json({ message: "Lock renewed" });
        } else {
            res.status(404).json({ message: "Lock not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}