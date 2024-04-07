import axios from 'axios';
import pgp from 'pg-promise';
import { HttpCodes } from '../src/core/constants/httpCodes';

axios.defaults.validateStatus = function () {
  return true;
};

test('Deve criar uma conta para o passageiro', async function () {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '87748248800',
    carPlate: null,
    isPassenger: true,
  };

  const output = await axios.post('http://localhost:3000/signup', input);
  const accountId = output.data.accountId;

  expect(output.status).toEqual(HttpCodes.CREATED);
  expect(output.data).toEqual({
    accountId: expect.any(String),
  });

  const connection = pgp()('postgres://postgres:postgres@localhost:5432/ccat16_database');

  const [result] = await connection.query('select * from public.account where account_id = $1', [accountId]);

  expect(result).toEqual({
    account_id: expect.any(String),
    name: input.name,
    email: input.email,
    cpf: input.cpf,
    is_passenger: true,
    car_plate: null,
    is_driver: false,
  });

  await connection.$pool.end();
});

test('Deve criar uma conta para o motorista', async function () {
  const input = {
    name: 'John Doe Driver',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '12371093025',
    carPlate: 'ABC1234',
    isDriver: true,
  };

  const output = await axios.post('http://localhost:3000/signup', input);
  const accountId = output.data.accountId;

  expect(output.status).toEqual(HttpCodes.CREATED);
  expect(output.data).toEqual({
    accountId: expect.any(String),
  });

  const connection = pgp()('postgres://postgres:postgres@localhost:5432/ccat16_database');

  const [result] = await connection.query('select * from public.account where account_id = $1', [accountId]);

  expect(result).toEqual({
    account_id: expect.any(String),
    name: input.name,
    email: input.email,
    cpf: input.cpf,
    is_passenger: false,
    car_plate: input.carPlate,
    is_driver: input.isDriver,
  });

  await connection.$pool.end();
});

test('Não deve salvar a placa do carro se o usuário for passageiro', async () => {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '87748248800',
    carPlate: 'TEST',
    isPassenger: true,
  };

  const output = await axios.post('http://localhost:3000/signup', input);
  const accountId = output.data.accountId;

  expect(output.status).toEqual(HttpCodes.CREATED);
  expect(output.data).toEqual({
    accountId: expect.any(String),
  });

  const connection = pgp()('postgres://postgres:postgres@localhost:5432/ccat16_database');

  const [result] = await connection.query('select * from public.account where account_id = $1', [accountId]);

  expect(result).toEqual({
    account_id: expect.any(String),
    name: input.name,
    email: input.email,
    cpf: input.cpf,
    is_passenger: true,
    car_plate: null,
    is_driver: false,
  });

  await connection.$pool.end();
});

test('Deve retornar um erro se já existe um usuário com o mesmo email', async () => {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '87748248800',
    isPassenger: true,
  };

  const firstRequestOutput = await axios.post('http://localhost:3000/signup', input);
  expect(firstRequestOutput.status).toEqual(HttpCodes.CREATED);
  expect(firstRequestOutput.data).toEqual({
    accountId: expect.any(String),
  });

  const sendRequestOutput = await axios.post('http://localhost:3000/signup', input);

  expect(sendRequestOutput.status).toEqual(HttpCodes.UNPROCESSABLE_CONTENT);
  expect(sendRequestOutput.data).toEqual({
    error: 'Email already exists',
  });
});

test('Deve retornar um erro se o nome do usuário for inválido', async () => {
  const input = {
    name: 'John 123',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '87748248800',
    isPassenger: true,
  };

  const output = await axios.post('http://localhost:3000/signup', input);

  expect(output.status).toEqual(HttpCodes.UNPROCESSABLE_CONTENT);
  expect(output.data).toEqual({
    error: 'Invalid name',
  });
});

test('Deve retornar um erro se o email do usuário for inválido', async () => {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}gmail.com`,
    cpf: '87748248800',
    isPassenger: true,
  };

  const output = await axios.post('http://localhost:3000/signup', input);

  expect(output.status).toEqual(HttpCodes.UNPROCESSABLE_CONTENT);
  expect(output.data).toEqual({
    error: 'Invalid email',
  });
});

test('Deve retornar um erro se o CPF do usuário for inválido', async () => {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '123211345611',
    isPassenger: true,
  };

  const output = await axios.post('http://localhost:3000/signup', input);

  expect(output.status).toEqual(HttpCodes.UNPROCESSABLE_CONTENT);
  expect(output.data).toEqual({
    error: 'Invalid CPF',
  });
});

test('Deve retornar um erro se a placa de um usuário motorista for inválida', async () => {
  const input = {
    name: 'John Doe',
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: '12371093025',
    carPlate: 'invalid',
    isDriver: true,
  };

  const output = await axios.post('http://localhost:3000/signup', input);

  expect(output.status).toEqual(HttpCodes.UNPROCESSABLE_CONTENT);
  expect(output.data).toEqual({
    error: 'Invalid car plate',
  });
});
