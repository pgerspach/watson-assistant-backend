import * as dotenv from 'dotenv';
dotenv.config();

import {postgresConfig_dev, postgresConfig_production} from './src/config';

export = {
  development: {
    client: "pg",
    connection: {
      ...postgresConfig_dev
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },
  production: {
    client: "pg",
    connection: {
      ...postgresConfig_production
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },
  migrations: {
    extension: 'ts'
  }
};
