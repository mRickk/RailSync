import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

const user_url = '/api/users/';
const reservation_url = '/api/reservations/';
const solution_url = '/api/solutions';
const seatCols = ['A', 'B', 'C', 'D'];
const numSeededReservations = 2;
var reservationsIds = [];
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
    username = "testbooking",
    password = 'securepassword',
    email = 'testbooking@example.com',
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

const deleteTestUser = async () => {
    return await request(app)
            .delete(user_url + user_id)
            .set('Authorization', 'Bearer ' + token);
  };

const deleteLastReservation = async() => {
    if (reservationsIds.length === 0) {
        throw new Error('No reservations to delete');
    }
    const lastId = reservationsIds.pop();
    const res = await request(app)
        .delete(reservation_url + lastId)
        .set('Authorization', 'Bearer ' + token);
    if (res.statusCode !== 200) {
        throw new Error(`Failed to delete reservation with ID ${lastId}`);
    }
    return res;
}

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
    
    if (res.body._id === '' || res.statusCode !== 201) {
        throw new Error('Failed to create reservation');
    } else {
        reservationsIds.push(res.body._id);
    }
    return res;
};

const deleteTestReservations = async () => {
    try {
        //Delete all test reservations
        for(const id of reservationsIds) {
            const deleteRes = await request(app)
                .delete(reservation_url + id)
                .set('Authorization', 'Bearer ' + token);
            if (deleteRes.statusCode !== 200) {
                throw new Error(`Failed to delete reservation with ID ${id}`);
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
        console.error(`Error deleting test reservations: ${err.message}`);
    }
}


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

    afterAll(async() => {
        await deleteTestReservations();
        await deleteTestUser();
        await mongoose.disconnect();
    });

    it('initially should get only seeded reservations', async() => {
        const res = await request(app)
            .get(reservation_url)
            .set('Authorization', 'Bearer ' + token);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(numSeededReservations);
    });

    it('should get all reservations', async() => {
        await createNewReservation();
        await createNewReservation();

        const res = await request(app)
            .get(reservation_url)
            .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toEqual(numSeededReservations + reservationsIds.length);

        await deleteLastReservation();
        await deleteLastReservation();
    });

    it('shoud get a reservation by id', async() => {
        await createNewReservation();
        const res = await request(app)
            .get(reservation_url + reservationsIds[0])
            .set('Authorization', 'Bearer ' + token);
        expect(res.statusCode).toEqual(200);
        expect(res.body.res._id).toEqual(reservationsIds[0]);

        await deleteLastReservation();
    });

    it('should delete a reservation by id', async() => {
        await createNewReservation();
        const deleteRes = await deleteLastReservation();
        expect(deleteRes.statusCode).toEqual(200);
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