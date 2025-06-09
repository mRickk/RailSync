import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

export const station_search_url = '/api/stations/search/';

describe('Redis API', () => {
  beforeAll(async () => {
    const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/dbrs';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should lock a seat', async () => {
    const res = await request(app)
      .get(station_search_url + '?name=ces');

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);

    const names = res.body.map(s => s.name.toLowerCase());
    expect(names).toEqual(expect.arrayContaining(['cesena', 'cesate']));
    expect(names).not.toContain('roma termini');
  });
});