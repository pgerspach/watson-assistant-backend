import {PostgresConfig} from '../model';

const postgresConfig_dev: PostgresConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE
};

const postgresConfig_test: PostgresConfig = {
  user: 'test-user',
  password: 'test-password',
  host: 'test-host',
  database: 'test-db',
};

const postgresConfig_production: PostgresConfig = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE
};


export {
  postgresConfig_dev,
  postgresConfig_test,
  postgresConfig_production
};
