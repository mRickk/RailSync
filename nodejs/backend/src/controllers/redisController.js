import getRedisClient from '../util/redisClient.js';

export const getSelectedSeats = async function(req, res) {
    const solutionId = req.params.solutionId;
    try {
        const redis = await getRedisClient();
        const keys = await redis.keys(`lock:${solutionId}:*`);

        const seatMap = {};

        keys.forEach(key => {
            const suffix = key.replace(`lock:${solutionId}:`, "");
            const [trainId, seatNumber] = suffix.split(":");

            if (!seatMap[trainId]) {
                seatMap[trainId] = [];
            }
            seatMap[trainId].push(seatNumber);
        });

        res.status(200).json(seatMap);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const createOrRenewLock = async function(req, res) {
    const EXPIRATION_TIME = 1000;
    const solutionId = req.params.solutionId;
    const { trainId, seat } = req.body;
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!trainId || !seat) {
        return res.status(400).json({ message: "trainId and seat are required in the request body." });
    }

    const lockKey = `lock:${solutionId}:${trainId}:${seat}`;
    try {
        const redis = await getRedisClient();

        const result = await redis.set(lockKey, userId, {
            NX: true,
            PX: EXPIRATION_TIME
        });

        if (result === 'OK') {
            return res.status(200).json({ message: "Lock acquired" });
        }

        // Caso in cui il lock esiste già, controllo chi è il proprietario
        const currentValue = await redis.get(lockKey);
        if (currentValue === userId) {
            const success = await redis.pExpire(lockKey, EXPIRATION_TIME);
            if (success === 1) {
                return res.status(200).json({ message: "Lock renewed" });
            } else {
                return res.status(404).json({ message: "Lock not found during renewal" });
            }
        } else {
            return res.status(423).json({ message: "Seat is already locked by another user" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const deleteLock = async function(req, res) {
    const { solutionId, trainId, seat } = req.params;
    const userId = req.user && req.user.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!trainId || !seat) {
        return res.status(400).json({ message: "trainId and seat are required in the URL." });
    }

    const lockKey = `lock:${solutionId}:${trainId}:${seat}`;

    try {
        const redis = await getRedisClient();

        const currentValue = await redis.get(lockKey);
        if (!currentValue) {
            return res.status(404).json({ message: "Lock not found" });
        }

        if (currentValue !== userId) {
            return res.status(403).json({ message: "You do not own this lock" });
        }

        await redis.del(lockKey);
        return res.status(200).json({ message: "Lock deleted" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};