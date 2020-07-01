import {Container} from 'typescript-ioc';
import {assistantConfig_dev, assistantConfig_test} from '../config';

Container.bindName('assistantConfig').to(assistantConfig_dev);
Container.configure(
  {
    env: {
      dev: [
        {
          bindName: 'assistantConfig',
          to: assistantConfig_dev
        }
      ],
      test: [
        {
          bindName: 'assistantConfig',
          to: assistantConfig_test
        }
      ]
    }
  }
);

Container.environment(process.env.NODE_ENV);