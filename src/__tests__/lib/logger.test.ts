import { logger } from '@/lib/logger';

describe('logger', () => {
  const originalDev = (global as any).__DEV__;

  afterEach(() => {
    (global as any).__DEV__ = originalDev;
    jest.restoreAllMocks();
  });

  it('has debug, info, warn, and error methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('logs debug messages in __DEV__ mode', () => {
    (global as any).__DEV__ = true;
    const spy = jest.spyOn(console, 'log').mockImplementation();
    logger.debug('test message');
    expect(spy).toHaveBeenCalledWith('test message');
  });

  it('suppresses debug messages in production', () => {
    (global as any).__DEV__ = false;
    const spy = jest.spyOn(console, 'log').mockImplementation();
    logger.debug('test message');
    expect(spy).not.toHaveBeenCalled();
  });

  it('always logs errors regardless of __DEV__', () => {
    (global as any).__DEV__ = false;
    const spy = jest.spyOn(console, 'error').mockImplementation();
    logger.error('critical error');
    expect(spy).toHaveBeenCalledWith('critical error');
  });

  it('logs warnings only in __DEV__ mode', () => {
    (global as any).__DEV__ = true;
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    logger.warn('warning message');
    expect(spy).toHaveBeenCalledWith('warning message');
  });

  it('suppresses warnings in production', () => {
    (global as any).__DEV__ = false;
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    logger.warn('warning message');
    expect(spy).not.toHaveBeenCalled();
  });
});
