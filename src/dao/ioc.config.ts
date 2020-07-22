import {ContainerConfiguration, Scope} from 'typescript-ioc';
import {DataDao, FakeDataDao, PostgresDataDao} from '../dao';
import {NamespaceConfiguration} from 'typescript-ioc/dist/model';
import {postgresConfig_dev} from '../../src/config';

const config: (ContainerConfiguration | NamespaceConfiguration)[] = [
  {
    env: {
      dev: [
        {
          bindName: 'postgresConfig',
          to: postgresConfig_dev
        },
        {
          bind: DataDao,
          to: PostgresDataDao,
          scope: Scope.Singleton,
        },
      ],
      test: [
        {
          bind: DataDao,
          to: FakeDataDao,
          scope: Scope.Singleton,
        },
      ],
      production: [
        {
          bindName: 'postgresConfig',
          to: postgresConfig_dev
        },
        {
          bind: DataDao,
          to: PostgresDataDao,
          scope: Scope.Singleton,
        },
      ]
    }
  }
];

export default config;
