import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import { user_url, createNewUser, getUserToken } from './user.test.js';

const reservation_url = '/api/reservations/';
const default_sol_id = 'x6869bc18-eb84-4798-abf5-5ac76290ae8e';
var last_reservation_id = '';

beforeAll(async () => {
  const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/dbrs';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  try {
    await request(app).delete(reservation_url + last_reservation_id); 
  } catch (err) {
    console.log('Error deleting reservation:', err.message);
  }
});

const createNewReservation = async (
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
  return await request(app)
    .post(reservation_url)
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
};

describe('Reservation API', () => {
  it('should create a new reservation', async () => {
    const res = await createNewReservation();
    last_reservation_id = res.body._id;
    expect(res.statusCode).toEqual(201);
    expect(res.body.solution_id).toEqual(default_sol_id);
  });

  it('shoud get a reservation by id', async () => {
    last_reservation_id = (await createNewReservation()).body._id;
    const res = await request(app).get(reservation_url + last_reservation_id);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toEqual(last_reservation_id);
  });

  it('should fetch user reservations', async () => {
    last_reservation_id = (await createNewReservation()).body._id;
    const userRes = await createNewUser();
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post(user_url + 'reservation/' + userRes.body._id)
        .set('Authorization', 'Bearer ' + await getUserToken())
        .send({ reservation_id: last_reservation_id });
    }
    const res = await request(app).get(reservation_url).send(userRes.body);

    expect(res.statusCode).toEqual(200);
    expect(res.body.size).toEqual(3);
    expect(res.body[0].solution_id).toEqual(default_sol_id);
    
    await request(app)
      .delete(user_url + userRes.body._id)
      .set('Authorization', 'Bearer ' + await getUserToken());
  });

  it('should delete a user', async () => {
    last_reservation_id = (await createNewReservation()).body._id;
    const deleteRes = await request(app).delete(reservation_url + last_reservation_id);
    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body.message).toEqual('Reservation deleted successfully');
  });

});