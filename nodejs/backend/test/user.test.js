import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

export const user_url = '/api/users/';
const default_username = 'testuser';
let admin_token;

export const getAdminToken = async () => {
  const res = await request(app)
    .post(user_url + 'auth')
    .send({
      username: 'admin',
      password: '1',
    });

  return res.body.token;
}

beforeAll(async () => {
  const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/dbrs';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  admin_token = await getAdminToken();
});

afterEach(async () => {
  await deleteTestUser();
});

afterAll(async () => {
  await mongoose.disconnect();
});

export const createTestUser = async (
  username = default_username,
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
    const res = await request(app)
      .get(user_url + '?username=' + default_username)
      .set('Authorization', 'Bearer ' + admin_token);
    
    if (res.body.length > 0) {
      const user_id = res.body[0]._id;
      await request(app)
        .delete(user_url + user_id)
        .set('Authorization', 'Bearer ' + admin_token);
    }
  } catch (err) {
     console.warn('deleteTestUser error:', err.message);
  }
};

describe('User API', () => {
  it('should authenticate an existing user', async () => {
    await createTestUser();
    const res = await request(app)
      .post(user_url + 'auth')
      .send({
        username: default_username,
        password: 'securepassword'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
  });
  
  it('shouldn\'t authenticate a not existing user', async () => {
    const res = await request(app)
    .post(user_url + 'auth')
    .send({
      username: default_username,
      password: 'securepassword'
    });

    expect(res.statusCode).toEqual(401);
  });

  it('should fail to authenticate with wrong credentials', async () => {
    await createTestUser();
    const res = await request(app)
      .post(user_url + 'auth')
      .send({
        username: default_username,
        password: 'wrongpassword',
      });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('should fail to authenticate without credentials', async () => {
    let res = await request(app)
    .post(user_url + 'auth')
    .send({
      password: 'securepassword'
    });

    expect(res.statusCode).toEqual(400);

    res = await request(app)
    .post(user_url + 'auth')
    .send({
      username: default_username
    });

    expect(res.statusCode).toEqual(400);
  });

  it('should register a new user', async () => {
    const res = await createTestUser();
    expect(res.statusCode).toEqual(201);
    expect(res.body.username).toEqual(default_username);
  });

  it('should not register a user with an existing username', async () => {
    await createTestUser();

    const res = await createTestUser(
      default_username,
      'anotherpassword',
      'unique@example.com',
      'Another',
      'User'
    );

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual('Username already exists');
  });

  it('should not register a user with an existing email', async () => {
    await createTestUser();

    const res = await createTestUser(
      'uniqueuser',
      'anotherpassword',
      'test@example.com',
      'Another',
      'User'
    );

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual('Email already exists');
  });


  it('should fetch all users', async () => {
    await createTestUser();
    const res = await request(app)
      .get(user_url)
      .set('Authorization', 'Bearer ' + admin_token);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body[res.body.length - 1].username).toEqual(default_username);
  });

  it('should delete a user', async () => {
    const createRes = await createTestUser();
    const userId = createRes.body._id;
    const deleteRes = await request(app)
      .delete(user_url + userId)
      .set('Authorization', 'Bearer ' + admin_token);
    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body.message).toEqual('User deleted successfully');
  });

  it('should update a user', async () => {
    const createRes = await createTestUser();
    const userId = createRes.body._id;

    const updateRes = await request(app)
      .patch(user_url + userId)
      .set('Authorization', 'Bearer ' + admin_token)
      .send({
        first_name: 'Updated',
        last_name: 'User',
      });
    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.message).toEqual('User updated successfully');

    const fetchRes = await request(app)
      .get(user_url + userId)
      .set('Authorization', 'Bearer ' + admin_token);
    expect(fetchRes.statusCode).toEqual(200);
    expect(fetchRes.body.first_name).toEqual('Updated');
    expect(fetchRes.body.last_name).toEqual('User');
  });

  it('should get 0 reservations for a new user', async () => {
    const createRes = await createTestUser();
    const userId = createRes.body._id;

    const res = await request(app)
      .get(user_url + userId + "/reservations")
      .set('Authorization', 'Bearer ' + admin_token);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(0);
  });

  it('should add a reservation', async () => {
    const createRes = await createTestUser();
    const userId = createRes.body._id;

    const default_solution_id = 'SOL001';
    const reservationData = {
        name: 'Mario',
        surname: 'Rossi',
        solution_id: default_solution_id,
        reservation_date: '2025-06-09T08:36:50.922Z',
        seats: [
          {
            seat: '2A',
            train_id: 'FR9400',
            departure_time: '2025-06-02T09:30:00.000Z',
            arrival_time: '2025-06-02T10:30:00.000Z'
          }
        ]
      };

    const postRes = await request(app)
      .post(user_url + userId + '/reservations')
      .set('Authorization', 'Bearer ' + admin_token)
      .send(reservationData);
    expect(postRes.statusCode).toEqual(201);

    const getRes = await request(app)
      .get(user_url + userId + '/reservations')
      .set('Authorization', 'Bearer ' + admin_token);
    expect(getRes.statusCode).toEqual(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBe(1);
    expect(getRes.body[0].sol.solution_id).toEqual(default_solution_id);
  });

  it('should validate a correct token', async () => {
    await createTestUser();
    const loginRes = await request(app)
      .post(user_url + 'auth')
      .send({ username: default_username, password: 'securepassword' });

    const res = await request(app)
      .post(user_url + 'validate')
      .send({ authToken: loginRes.body.token });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Token is valid');
  });

  it('should deny access to get all users without token', async () => {
    const res = await request(app).get(user_url);
    expect(res.statusCode).toEqual(401);
  });

});