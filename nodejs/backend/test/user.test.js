import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

const user_url = '/api/users/';

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
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

const createNewUser = async (
  username = 'testuser',
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

describe('User API', () => {
  it('should register a new user', async () => {
    const res = await createNewUser();
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('User created successfully');
  });

  it('should authenticate an existing user', async () => {
    await createNewUser();
    const res = await request(app)
      .post(user_url + 'auth')
      .send({
        username: 'testuser',
        password: 'securepassword',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
  });

  it('should fail to login with wrong credentials', async () => {
    await createNewUser();
    const res = await request(app)
      .post(user_url + 'auth')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('should fetch all users', async () => {
    await createNewUser();
    const res = await request(app).get(user_url);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].username).toEqual('testuser');
  });

  it('should delete a user', async () => {
    const createRes = await createNewUser();
    const userId = createRes.body._id;
    console.log(userId);
    const deleteRes = await request(app).delete(user_url + userId);
    console.log(deleteRes);
    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body.message).toEqual('User deleted successfully');
  });
});