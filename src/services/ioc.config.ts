import {ContainerConfiguration, Scope} from 'typescript-ioc';
import {HelloWorldApi} from './hello-world.api';
import {HelloWorldService} from './hello-world.service';
import {AssistantApi} from './assistant.api';
import {AssistantService} from './assistant.service';

const config: ContainerConfiguration[] = [
  {
    bind: HelloWorldApi,
    to: HelloWorldService,
    scope: Scope.Singleton
  },
  {
    bind: AssistantApi,
    to: AssistantService,
    scope: Scope.Singleton,
  }
];

export default config;