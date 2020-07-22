import {Container} from "typescript-ioc";

export * from './hello-world.api';
export * from './hello-world.service';
export * from './assistant.api';
export * from './assistant.service';
export * from './data.api';
export * from './data.service';

import config from './ioc.config';

Container.configure(...config);