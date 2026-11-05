// These controller tests stub Sequelize methods so they never need a PostgreSQL connection.
const { afterEach, test, mock } = require('node:test');
const assert = require('node:assert/strict');

// Keep model initialization independent of any database URL inherited from the shell.
delete process.env.DATABASE_URL;
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'api_tests';
process.env.DB_USER = 'api_tests';
process.env.DB_PASSWORD = 'api_tests';
process.env.DB_SSL = 'false';

const db = require('../dist/models').default;
const pollutionController = require('../dist/controllers/pollution.controllers');
const userController = require('../dist/controllers/user.controllers');

const pollutionPayload = {
  titreDeclarationDePollution: 'Déchets près du canal',
  typePollution: 'Plastique',
  description: 'Des déchets sont visibles près du canal.',
  dateObservation: '2026-10-28',
  lieu: 'Strasbourg',
  latitude: 48.58,
  longitude: 7.75,
  photoUrl: ''
};

const publicUser = {
  id: 1,
  login: 'ada.lovelace',
  nom: 'Lovelace',
  prenom: 'Ada',
  adresse: '1 rue des Tests',
  email: 'ada@example.com',
  telephone: '+33123456789',
  dateNaissance: '1815-12-10'
};

// Restore mocked ORM methods after each test to avoid leaking behavior between cases.
afterEach(() => {
  mock.restoreAll();
});

function createResponse() {
  return {
    statusCode: undefined,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    }
  };
}

test('pollution POST rejects an invalid payload without writing to the database', async () => {
  const create = mock.method(db.pollutions, 'create');
  const response = createResponse();

  await pollutionController.create(
    { body: { ...pollutionPayload, latitude: 100 } },
    response
  );

  assert.equal(response.statusCode, 400);
  assert.equal(create.mock.callCount(), 0);
});

test('pollution POST creates a valid declaration and returns 201', async () => {
  const created = { id: 4, ...pollutionPayload };
  const create = mock.method(db.pollutions, 'create', async () => created);
  const response = createResponse();

  await pollutionController.create({ body: pollutionPayload }, response);

  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body, created);
  assert.deepEqual(create.mock.calls[0].arguments[0], pollutionPayload);
});

test('pollution detail rejects a malformed id before querying Sequelize', async () => {
  const findByPk = mock.method(db.pollutions, 'findByPk');
  const response = createResponse();

  await pollutionController.getById({ params: { id: 'not-a-number' } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(findByPk.mock.callCount(), 0);
});

test('pollution detail returns 404 when a valid id is not found', async () => {
  mock.method(db.pollutions, 'findByPk', async () => null);
  const response = createResponse();

  await pollutionController.getById({ params: { id: '42' } }, response);

  assert.equal(response.statusCode, 404);
});

test('pollution PUT returns 404 when the requested declaration does not exist', async () => {
  mock.method(db.pollutions, 'findByPk', async () => null);
  const response = createResponse();

  await pollutionController.update(
    { params: { id: '42' }, body: pollutionPayload },
    response
  );

  assert.equal(response.statusCode, 404);
});

test('pollution DELETE returns 204 after deleting an existing declaration', async () => {
  mock.method(db.pollutions, 'findByPk', async () => ({
    destroy: async () => undefined
  }));
  const response = createResponse();

  await pollutionController.remove({ params: { id: '4' } }, response);

  assert.equal(response.statusCode, 204);
});

test('user POST rejects incomplete signup data', async () => {
  const create = mock.method(db.users, 'create');
  const response = createResponse();

  await userController.create({ body: { login: 'ada' } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(create.mock.callCount(), 0);
});

test('user list excludes the password hash from its Sequelize query', async () => {
  const findAll = mock.method(db.users, 'findAll', async () => [publicUser]);
  const response = createResponse();

  await userController.getAll({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, [publicUser]);
  assert.deepEqual(findAll.mock.calls[0].arguments[0].attributes, {
    exclude: ['passwordHash']
  });
});

test('mock authentication returns 401 when the login does not exist', async () => {
  mock.method(db.users, 'findOne', async () => null);
  const response = createResponse();

  await userController.authenticate(
    { body: { login: 'unknown', password: 'password123' } },
    response
  );

  assert.equal(response.statusCode, 401);
});
