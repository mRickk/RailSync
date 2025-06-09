import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';
import seedDatabase from '../src/util/seedDatabase.js';

const user_url = '/api/users/';
const reservation_url = '/api/reservations/';
const solution_url = '/api/solutions';
const seatCols = ['A', 'B', 'C', 'D'];
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

const createNewReservation = async(
    origin = '830005071',
    destination = '830005043',
    passenger_name = 'John',
    passenger_surname = 'Doe',
    departure_time = new Date().toISOString()
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
    const randomSolution = data[Math.floor(Math.random() * data.length)].solution;
    if (!randomSolution) {
        throw new Error('No solutions found for the given parameters');
    }

    const solutionId = randomSolution.origin + "|" + randomSolution.destination + "|" + (new Date(randomSolution.departureTime).toISOString()) + "|" + (new Date(randomSolution.arrivalTime).toISOString()) + "|" + randomSolution.price?.amount;

    const seats = randomSolution.nodes.map(node => ({
        seat: String(Math.floor(Math.random() * 12) + 1) + seatCols[Math.floor(Math.random() * 4)],
        train_id: node.train?.acronym + node.train?.name,
        departure_time: new Date(node.departureTime),
        arrival_time: new Date(node.arrivalTime)
    }));

    const res = await request(app)
        .post(user_url + user_id + "/reservations")
        .set('Authorization', 'Bearer ' + token)
        .send({
            solution_id: solutionId,
            name: passenger_name,
            surname: passenger_surname,
            seats: seats,
        });
    last_reservation_id = res.body._id;
    if (last_reservation_id === '' || res.statusCode !== 201) {
        throw new Error('Failed to create reservation');
    }
    return res;
};

describe('Reservation API', () => {

    beforeAll(async() => {
        const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/dbrs';
        await mongoose.connect(mongoUri);
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
                const deleteRes = await request(app)
                    .delete(reservation_url + reservation.res._id)
                    .set('Authorization', 'Bearer ' + token);
                if (deleteRes.statusCode !== 200) {
                    throw new Error(`Failed to delete reservation with ID ${reservation.res._id}`);
                }
            }
            //Delete all unused solutions
            const solutionRes = await request(app)
                .delete(solution_url)
                .set('Authorization', 'Bearer ' + token);
            if (solutionRes.statusCode !== 200) {
                throw new Error('Failed to delete unused solutions');
            }
        } catch (err) {
            console.error(`Error before each: ${err.message}`);
        }
    });

    afterAll(async() => {
        await deleteTestUser();
        await seedDatabase();
        await mongoose.disconnect();
    });

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
        expect(res.body.res._id).toEqual(last_reservation_id);
    });

    it('should delete a reservation by id', async() => {
        await createNewReservation();
        const deleteRes = await request(app)
            .delete(reservation_url + last_reservation_id)
            .set('Authorization', 'Bearer ' + token);
        expect(deleteRes.statusCode).toEqual(200);
        expect(deleteRes.body.message).toEqual('Reservation deleted successfully');
    });

    it("should not accept a reservation with an invalid solution_id", async() => {
        const res = await request(app)
            .post(user_url + user_id + "/reservations")
            .set('Authorization', 'Bearer ' + token)
            .send({
                solution_id: 'invalid_solution_id',
                name: 'Jane',
                surname: 'Doe',
                seats: [{
                    seat: '1A',
                    train_id: 'Train123',
                    departure_time: new Date().toISOString(),
                    arrival_time: new Date().toISOString()
                }],
            });
        expect(res.statusCode).toEqual(404);
    });
});