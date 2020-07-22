import {Container} from 'typescript-ioc';

export * from './data.dao';
export * from './fakeData.dao';
export * from './postgres-data.dao';

import config from './ioc.config';
Container.namespace(process.env.NODE_ENV || 'dev');

Container.configure(...config);
