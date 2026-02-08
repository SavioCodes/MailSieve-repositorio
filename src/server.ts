import { loadConfig } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';

function start(): void {
  let config;

  try {
    config = loadConfig(process.env);
  } catch (error) {
    logger.error({
      event: 'env_validation_failed',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    process.exit(1);
  }

  const { app } = createApp(config);

  app.listen(config.port, () => {
    logger.info({
      event: 'server_started',
      name: config.serviceName,
      version: config.serviceVersion,
      port: config.port
    });
  });
}

if (require.main === module) {
  start();
}

export { start };