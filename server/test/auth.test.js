import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';
process.env.NODE_ENV = 'test';

const [{ default: app }, { connectToDatabase }, { default: User }] = await Promise.all([
  import('../src/app.js'),
  import('../src/config/database.js'),
  import('../src/models/User.js'),
]);

let mongo;
let agent;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await connectToDatabase(mongo.getUri());
  agent = request.agent(app);
});

after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test('database connection establishes and health endpoint reports it', async () => {
  assert.equal(mongoose.connection.readyState, 1);
  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, { status: 'ok', database: 'connected' });
});

test('registration hashes the password and creates a protected session', async () => {
  const response = await agent
    .post('/api/auth/register')
    .send({ name: 'Taylor Example', email: 'Taylor@example.com', password: 'a-strong-password' })
    .expect(201);

  assert.equal(response.body.user.email, 'taylor@example.com');
  assert.equal(response.body.user.name, 'Taylor Example');
  assert.equal('passwordHash' in response.body.user, false);
  assert.match(response.headers['set-cookie'][0], /HttpOnly/i);

  const user = await User.findOne({ email: 'taylor@example.com' }).select('+passwordHash');
  assert.notEqual(user.passwordHash, 'a-strong-password');
  assert.equal(await user.comparePassword('a-strong-password'), true);

  const protectedResponse = await agent.get('/api/auth/me').expect(200);
  assert.equal(protectedResponse.body.user.id, response.body.user.id);
});

test('registration rejects duplicate accounts and invalid inputs', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Taylor Example', email: 'TAYLOR@example.com', password: 'a-strong-password' })
    .expect(409);

  await request(app)
    .post('/api/auth/register')
    .send({ name: 'T', email: 'not-an-email', password: 'short' })
    .expect(400);
});

test('each signed-in account resolves to its own profile', async () => {
  const secondAgent = request.agent(app);
  const secondResponse = await secondAgent
    .post('/api/auth/register')
    .send({ name: 'Jordan Example', email: 'jordan@example.com', password: 'another-strong-password' })
    .expect(201);
  const firstProfile = await agent.get('/api/auth/me').expect(200);
  const secondProfile = await secondAgent.get('/api/auth/me').expect(200);

  assert.notEqual(firstProfile.body.user.id, secondResponse.body.user.id);
  assert.equal(firstProfile.body.user.email, 'taylor@example.com');
  assert.equal(secondProfile.body.user.email, 'jordan@example.com');
});

test('login rejects invalid passwords and accepts the correct credentials', async () => {
  await request(app)
    .post('/api/auth/login')
    .send({ email: 'taylor@example.com', password: 'incorrect-password' })
    .expect(401);

  const response = await agent
    .post('/api/auth/login')
    .send({ email: 'TAYLOR@example.com', password: 'a-strong-password' })
    .expect(200);
  assert.equal(response.body.user.email, 'taylor@example.com');
});

test('protected route rejects unsigned requests and logout clears the session', async () => {
  await request(app).get('/api/auth/me').expect(401);
  await agent.post('/api/auth/logout').expect(200);
  await agent.get('/api/auth/me').expect(401);
});
