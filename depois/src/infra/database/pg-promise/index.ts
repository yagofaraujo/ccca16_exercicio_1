import pgp from 'pg-promise';
import pg from 'pg-promise/typescript/pg-subset';
import { Database } from '../database-interface';

export class PgPromisseDatabase implements Database {
  private static instance: Database;

  private constructor() {}

  static getInstance() {
    if (!PgPromisseDatabase.instance) {
      PgPromisseDatabase.instance = new PgPromisseDatabase();
    }

    return PgPromisseDatabase.instance;
  }

  private async createConnection() {
    const connection = pgp()(
      `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`,
    );

    return connection;
  }

  private async endConnection(connection: pgp.IDatabase<{}, pg.IClient>) {
    await connection.$pool.end();
  }

  public async query(query: string, paramValues?: any): Promise<any> {
    const connection = await this.createConnection();
    const [result] = await connection.query(query, paramValues);
    await this.endConnection(connection);

    return result;
  }
}
