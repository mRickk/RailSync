import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import seedDatabase from '../src/util/seedDatabase.js';
// import { getAdminToken } from './user.test.js';

const user_url = '/api/users/';
const reservation_url = '/api/reservations/';
const solution_url = '/api/solutions';
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
    if (!token) {
        throw new Error("Failed to retrieve admin token");
    }
});

beforeEach(async() => {
    try {
        //Delete all reservations
        const res = await request(app)
            .get(reservation_url)
            .set('Authorization', 'Bearer ' + token);
        for(const reservation of res.body) {
            await request(app)
                .delete(reservation_url + reservation._id)
                .set('Authorization', 'Bearer ' + token);
        }
        //Delete all unused solutions
        const solutionRes = await request(app)
            .delete(solution_url)
            .set('Authorization', 'Bearer ' + token);
    } catch (err) {}
});

afterAll(async() => {
    await deleteTestUser();
    await seedDatabase();
    await mongoose.disconnect();
});

const createNewReservation = async(
    origin = 'Cesena',
    destination = 'Bologna Centrale',
    passenger_name = 'John',
    passenger_surname = 'Doe',
    departure_time = new Date().toUTCString()
) => {
    const params = new URLSearchParams({
        fromStationId: origin,
        toStationId: destination,
        datetime: departure_time
    }).toString();

    const solutionRes = await request(app)
        .get(`${solution_url}?${params}`)
        .set('Authorization', `Bearer ${token}`);

    const data = solutionRes.body;
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No travel solutions returned from the API');
    }
    const randomSolution = data[Math.floor(Math.random() * data.length)];
    if (!randomSolution) {
        throw new Error('No solutions found for the given parameters');
    }

    const res = await request(app)
        .post(user_url + user_id + "/reservations")
        .set('Authorization', 'Bearer ' + token)
        .send({
            solution_id: randomSolution.solution_id,
            name: passenger_name,
            surname: passenger_surname,
            seats: randomSolution.nodes.map(node => ({
                seat: '1A',
                train_id: node.train.train_id,
                departure_time: node.departure_time,
                arrival_time: node.arrival_time
            })),
        });
    last_reservation_id = res.body._id;
    return res;
};

describe('Reservation API', () => {
    it('initially should get 0 reservations', async() => {
        const res = await request(app)
            .get(reservation_url)
            .set('Authorization', 'Bearer ' + token);

        console.log(res.body);
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