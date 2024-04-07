import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import { validate } from './validateCpf';
import { PgPromisseDatabase } from './infra/database/pg-promise';
import { UnprocessableContent } from './core/errors/UnprocessableContent';
import { BaseError } from './core/errors/base-error';
import { HttpCodes } from './core/constants/httpCodes';
const app = express();
app.use(express.json());

const databaseConnection = PgPromisseDatabase.getInstance();

app.post('/signup', async function (req, res) {
  try {
    const accountWithSameEmailAlreadyExists = await databaseConnection.query(
      'select * from public.account where email = $1',
      [req.body.email],
    );

    if (accountWithSameEmailAlreadyExists) {
      throw new UnprocessableContent('Email already exists');
    }

    if (!req.body.name.match(/[a-zA-Z] [a-zA-Z]+/)) {
      throw new UnprocessableContent('Invalid name');
    }

    if (!req.body.email.match(/^(.+)@(.+)$/)) {
      throw new UnprocessableContent('Invalid email');
    }

    if (!validate(req.body.cpf)) {
      throw new UnprocessableContent('Invalid CPF');
    }

    if (req.body.isDriver) {
      if (!req.body.carPlate.match(/[A-Z]{3}[0-9]{4}/)) {
        throw new UnprocessableContent('Invalid car plate');
      }
    }

    const id = crypto.randomUUID();

    const carPlate = req.body.isDriver ? req.body.carPlate : null;

    await databaseConnection.query(
      'insert into public.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)',
      [id, req.body.name, req.body.email, req.body.cpf, carPlate, !!req.body.isPassenger, !!req.body.isDriver],
    );

    res.status(HttpCodes.CREATED).json({
      accountId: id,
    });
  } catch (error: unknown) {
    if (error instanceof BaseError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error(`Erro inesperado: ${error}`);
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Unexpected Error',
    });
  }
});

app.listen(process.env.APP_PORT, () => {
  console.log(`Server running!`);
});
