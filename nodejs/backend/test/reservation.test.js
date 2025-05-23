import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
// import { getAdminToken } from './user.test.js';

const user_url = '/api/users/';
const reservation_url = '/api/reservations/';
const default_sol_id = 'x6869bc18-eb84-4798-abf5-5ac76290ae8e';
var last_reservation_id = '';
var user_id = '';
var token = '';

export const getAdminToken = async () => {
    const res = await request(app)
      .post(user_url + 'auth')
      .send({
        username: 'admin',
        password: '1',
      });
  
    return res.body.token;
  }

export const createTestUser = async (
    username = "testuser",
    password = 'securepassword',
    email = 'test@example.com',
    first_name = 'Test',
    last_name = 'User'
) => {
return await request(app)
    .post(user_url)
    .send({
    username: username,
    password: password,
    email: email,
    first_name: first_name,
    last_name: last_name,
    });
};

export const deleteTestUser = async () => {
    try {
        await request(app)
            .delete(user_url + user_id)
            .set('Authorization', 'Bearer ' + token);
    } catch (err) {
    }
  };

beforeAll(async() => {
    const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/dbrs';
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const userRes = await createTestUser();
    user_id = userRes.body._id;
    token = await getAdminToken();
});

afterEach(async() => {
    try {
        //Delete all reservations
        const res = await request(app)
            .get(reservation_url)
            .set('Authorization', 'Bearer ' + token);
        for(const reservation of res.body) {
            const deleteRes = await request(app)
                .delete(reservation_url + reservation._id)
                .set('Authorization', 'Bearer ' + token);
        }
    } catch (err) {}
});

afterAll(async() => {
    await deleteTestUser();
    await mongoose.disconnect();
});

const createNewReservation = async(
    solution_id = default_sol_id,
    origin = 'Rimini',
    destination = 'Bologna Centrale',
    departure_time = '2025-04-29T09:47:00.000+02:00',
    arrival_time = '2025-04-29T11:01:00.000+02:00',
    duration = '1h 14m',
    status = 'SALEABLE',
    price_currency = '€',
    price_amount = 10.8,
) => {
    const res = await request(app)
        .post(user_url + user_id + "/reservations")
        .set('Authorization', 'Bearer ' + token)
        .send({
            solution_id: solution_id,
            origin: origin,
            destination: destination,
            departure_time: departure_time,
            arrival_time: arrival_time,
            duration: duration,
            status: status,
            price_currency: price_currency,
            price_amount: price_amount,
        });
    last_reservation_id = res.body._id;
    return res;
};

describe('Reservation API', () => {
    it('initially should get 0 reservations', async() => {
        const res = await request(app)
            .get(reservation_url)
            .set('Authorization', 'Bearer ' + token);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(0);
    });

    it('should get all reservations', async() => {
        await createNewReservation();
        await createNewReservation();

        const res = await request(app)
            .get(reservation_url)
            .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(2);
    });

    it('shoud get a reservation by id', async() => {
        await createNewReservation();
        const res = await request(app)
            .get(reservation_url + last_reservation_id)
            .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        expect(res.body._id).toEqual(last_reservation_id);
    });

    it('should delete a reservation by id', async() => {
        await createNewReservation();
        const deleteRes = await request(app)
            .delete(reservation_url + last_reservation_id)
            .set('Authorization', 'Bearer ' + token);
        expect(deleteRes.statusCode).toEqual(200);
        expect(deleteRes.body.message).toEqual('Reservation deleted successfully');
    });

});