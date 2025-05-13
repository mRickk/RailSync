import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

export const user_url = '/api/users/';
const default_username = 'testuser';

beforeAll(async () => {
  const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/dbrs';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  const res = await request(app)
  .get(user_url + '?username=' + default_username)
  .set('Authorization', 'Bearer ' + await getAdminToken());
  let user_id = res.body[0]._id;
  await request(app)
    .delete(user_url + user_id)
    .set('Authorization', 'Bearer ' + await getAdminToken()); 
  await mongoose.disconnect();
});

beforeEach(async () => {
  try {
    const res = await request(app)
      .get(user_url + '?username=' + default_username)
      .set('Authorization', 'Bearer ' + await getAdminToken());
    let user_id = res.body[0]._id;
    await request(app)
      .delete(user_url + user_id)
      .set('Authorization', 'Bearer ' + await getAdminToken()); 
  } catch (err) {}
});

export const createNewUser = async (
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

export const getAdminToken = async () => {
  const res = await request(app)
    .post(user_url + 'auth')
    .send({
      username: 'admin',
      password: '1',
    });

  return res.body.token;
}

describe('User API', () => {
  it('should register a new user', async () => {
    const res = await createNewUser();
    expect(res.statusCode).toEqual(201);
    expect(res.body.username).toEqual(default_username);
  });

  it('should authenticate an existing user', async () => {
    var res = await request(app)
    .post(user_url + 'auth')
    .send({
      password: 'securepassword'
    });

    expect(res.statusCode).toEqual(400);

    var res = await request(app)
    .post(user_url + 'auth')
    .send({
      username: 'testuser'
    });

    expect(res.statusCode).toEqual(400);

    var res = await request(app)
    .post(user_url + 'auth')
    .send({
      username: 'testuser',
      password: 'securepassword'
    });

    expect(res.statusCode).toEqual(401);

    await createNewUser();
    res = await request(app)
      .post(user_url + 'auth')
      .send({
        username: 'testuser',
        password: 'securepassword'
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
    const res = await request(app)
      .get(user_url)
      .set('Authorization', 'Bearer ' + await getAdminToken());
    
    expect(res.statusCode).toEqual(200);
    expect(res.body[res.body.length - 1].username).toEqual('testuser');
  });

  it('should delete a user', async () => {
    const createRes = await createNewUser();
    const userId = createRes.body._id;
    const deleteRes = await request(app)
      .delete(user_url + userId)
      .set('Authorization', 'Bearer ' + await getAdminToken());
    expect(deleteRes.statusCode).toEqual(200);
    expect(deleteRes.body.message).toEqual('User deleted successfully');
  });

  it('should update a user', async () => {
    const createRes = await createNewUser();
    const userId = createRes.body._id;

    const updateRes = await request(app)
      .patch(user_url + userId)
      .set('Authorization', 'Bearer ' + await getAdminToken())
      .send({
        first_name: 'Updated',
        last_name: 'User',
      });
    expect(updateRes.statusCode).toEqual(200);
    expect(updateRes.body.message).toEqual('User updated successfully');

    const fetchRes = await request(app)
      .get(user_url + userId)
      .set('Authorization', 'Bearer ' + await getAdminToken());
    expect(fetchRes.statusCode).toEqual(200);
    expect(fetchRes.body.first_name).toEqual('Updated');
    expect(fetchRes.body.last_name).toEqual('User');
  });
});