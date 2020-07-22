import {ContainerConfiguration, Scope} from 'typescript-ioc';
import {HelloWorldApi} from './hello-world.api';
import {HelloWorldService} from './hello-world.service';
import {DataService, DataApi, AssistantApi, AssistantService} from '.';

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
  },
  {
    bind: DataApi,
    to: DataService,
    scope: Scope.Singleton
  }
];

export default config;