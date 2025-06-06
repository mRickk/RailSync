import { createClient } from "redis";

let redis;

async function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL
    });

    redis.on("error", (err) => {
      console.error("Redis error:", err);
    });

    try {
      await redis.connect();
    } catch (err) {
      console.error("Redis connection failed:", err.message);
      throw err;
    }
  }

  return redis;
}

export default getRedisClient;