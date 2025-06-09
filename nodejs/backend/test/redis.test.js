import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import getRedisClient from '../src/util/redisClient.js';

export const username = 'testredis';
export const password = 'securepassword';

export const user_url = '/api/users/';
export const reservation_locking_url = '/api/reservations/';
export const solution_id = 'solution123';
export const train_id = 'train123';
export const seat = 'A1';

export let user_id;
export let user_token;

export const createTestUser = async (
  email = 'testredis@example.com',
  first_name = 'Test',
  last_name = 'User'
) => {
  const res = await request(app)
    .post(user_url)
    .send({
      username,
      password,
      email,
      first_name,
      last_name,
    });

  if (res.statusCode !== 201 || !res.body || !res.body._id) {
    throw new Error('User creation failed: ' + res.text);
  }

  user_id = res.body._id;
  user_token = await getUserToken();
};

export const deleteTestUser = async () => {
  try {
    await request(app)
    .delete(user_url + user_id)
    .set('Authorization', 'Bearer ' + user_token);
  } catch (err) {
     console.warn('deleteTestUser error:', err.message);
  }
};

export const getUserToken = async () => {
  const res = await request(app)
    .post(user_url + "auth")
    .send({
      username: username,
      password: password,
    });

  return res.body.token;
}

describe('User API', () => {
    beforeAll(async () => {
        const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/dbrs';
        await mongoose.connect(mongoUri);

        await createTestUser();
    });

    afterAll(async () => {
        await deleteTestUser();
        // await mongoose.connection.close();
        const redis = await getRedisClient();
        await redis.quit();

        await mongoose.disconnect();
    });

    it('should initially get 0 locks', async () => {
        const res = await request(app)
        .get(reservation_locking_url + solution_id + "/selectedSeats")
        .set('Authorization', 'Bearer ' + user_token);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({});
    });

    it('should lock a seat', async () => {
        const res = await request(app)
        .post(reservation_locking_url + solution_id + "/select")
        .send({
            trainId: train_id,
            seat: seat,
            })
        .set('Authorization', 'Bearer ' + user_token);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe("Lock acquired");
    });

});