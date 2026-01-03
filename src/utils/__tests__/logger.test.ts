import { logger } from '../logger';

describe('Logger', () => {
  it('should create log messages without errors', () => {
    expect(() => {
      logger.info('Test message');
      logger.error('Test error');
      logger.warn('Test warning');
      logger.debug('Test debug');
    }).not.toThrow();
  });
});
