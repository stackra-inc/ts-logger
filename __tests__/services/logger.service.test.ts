/**
 * @fileoverview Tests for LoggerService
 *
 * Covers both operating modes:
 * - Config mode (backward compatibility): constructed with LoggerConfig
 * - Facade mode: constructed with a context string or no args, delegates to
 *   the static LoggerManager reference (or a fallback ConsoleTransporter).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoggerService } from '@/services/logger.service';
import { ConsoleTransporter } from '@/transporters/console.transporter';
import { SilentTransporter } from '@/transporters/silent.transporter';

describe('LoggerService', () => {
  beforeEach(() => {
    LoggerService.staticManagerRef = undefined;
    (LoggerService as any)._fallbackLoggerInstance = undefined;
  });

  // ── Config Mode (backward compatibility) ──────────────────────────────

  describe('config mode', () => {
    it('should create a config-mode instance when given a LoggerConfig', () => {
      const transporter = new SilentTransporter();
      const logger = new LoggerService({ transporters: [transporter] });

      expect((logger as any)._mode).toBe('config');
    });

    it('should dispatch log calls to transporters in config mode', () => {
      const transporter = new SilentTransporter();
      const spy = vi.spyOn(transporter, 'transport');
      const logger = new LoggerService({ transporters: [transporter] });

      logger.debug('d');
      logger.info('i');
      logger.warn('w');
      logger.error('e');
      logger.fatal('f');

      expect(spy).toHaveBeenCalledTimes(5);
    });

    it('should return config transporters from getTransporters', () => {
      const transporter = new SilentTransporter();
      const logger = new LoggerService({ transporters: [transporter] });

      expect(logger.getTransporters()).toEqual([transporter]);
    });

    it('should return the config from getConfig', () => {
      const config = { transporters: [new SilentTransporter()], context: { app: 'test' } };
      const logger = new LoggerService(config);

      expect(logger.getConfig()).toBe(config);
    });

    describe('context management', () => {
      it('should add context with withContext and return this', () => {
        const logger = new LoggerService({ transporters: [] });
        const result = logger.withContext({ requestId: 'abc-123' });
        expect(result).toBe(logger);
      });

      it('should remove context with withoutContext and return this', () => {
        const logger = new LoggerService({ transporters: [] });
        const result = logger.withoutContext(['requestId']);
        expect(result).toBe(logger);
      });

      it('should support method chaining', () => {
        const logger = new LoggerService({ transporters: [] });
        const result = logger.withContext({ requestId: 'abc' }).withContext({ userId: 123 });
        expect(result).toBe(logger);
      });
    });
  });

  // ── Facade Mode ───────────────────────────────────────────────────────

  describe('facade mode', () => {
    it('should create a facade-mode instance when no args are passed', () => {
      const logger = new LoggerService();
      expect((logger as any)._mode).toBe('facade');
      expect((logger as any)._contextString).toBeUndefined();
    });

    it('should create a facade-mode instance when a string is passed', () => {
      const logger = new LoggerService('MyService');
      expect((logger as any)._mode).toBe('facade');
      expect((logger as any)._contextString).toBe('MyService');
    });

    it('should have staticManagerRef initially undefined', () => {
      expect(LoggerService.staticManagerRef).toBeUndefined();
    });

    it('should use ConsoleTransporter as fallback when no manager is set', () => {
      const logger = new LoggerService();
      const transporters = logger.getTransporters();

      expect(transporters).toHaveLength(1);
      expect(transporters[0]).toBeInstanceOf(ConsoleTransporter);
    });

    describe('lazy resolution', () => {
      it('should use fallback before manager is set, then manager after', () => {
        const logger = new LoggerService('Lazy');

        // Before manager — uses fallback (ConsoleTransporter)
        const fallbackTransporters = logger.getTransporters();
        expect(fallbackTransporters[0]).toBeInstanceOf(ConsoleTransporter);

        // Set up a mock manager
        const channelTransporter = new SilentTransporter();
        const channelLogger = new LoggerService({ transporters: [channelTransporter] });
        const mockManager = { channel: vi.fn().mockReturnValue(channelLogger) } as any;
        LoggerService.staticManagerRef = mockManager;

        // After manager — delegates to manager's channel
        const managerTransporters = logger.getTransporters();
        expect(managerTransporters).toEqual([channelTransporter]);
        expect(mockManager.channel).toHaveBeenCalled();
      });
    });

    describe('delegation with context', () => {
      let mockChannelLogger: LoggerService;
      let mockManager: any;

      beforeEach(() => {
        const transporter = new SilentTransporter();
        mockChannelLogger = new LoggerService({ transporters: [transporter] });
        mockManager = { channel: vi.fn().mockReturnValue(mockChannelLogger) };
        LoggerService.staticManagerRef = mockManager;
      });

      it('should merge context string into delegated calls', () => {
        const logger = new LoggerService('MyService');
        const infoSpy = vi.spyOn(mockChannelLogger, 'info');

        logger.info('hello', { extra: true });

        expect(infoSpy).toHaveBeenCalledWith('hello', {
          context: 'MyService',
          extra: true,
        });
      });

      it('should merge withContext into delegated calls', () => {
        const logger = new LoggerService('Ctx');
        logger.withContext({ requestId: '123' });
        const warnSpy = vi.spyOn(mockChannelLogger, 'warn');

        logger.warn('warning');

        expect(warnSpy).toHaveBeenCalledWith('warning', {
          context: 'Ctx',
          requestId: '123',
        });
      });

      it('should remove keys with withoutContext', () => {
        const logger = new LoggerService('Svc');
        logger.withContext({ a: 1, b: 2 });
        logger.withoutContext(['a']);
        const debugSpy = vi.spyOn(mockChannelLogger, 'debug');

        logger.debug('msg');

        expect(debugSpy).toHaveBeenCalledWith('msg', {
          context: 'Svc',
          b: 2,
        });
      });

      it('should clear all context with withoutContext() and no args', () => {
        const logger = new LoggerService('Svc');
        logger.withContext({ a: 1, b: 2 });
        logger.withoutContext();
        const errorSpy = vi.spyOn(mockChannelLogger, 'error');

        logger.error('err');

        expect(errorSpy).toHaveBeenCalledWith('err', {
          context: 'Svc',
        });
      });
    });

    describe('accessors', () => {
      it('should return fallback transporters when no manager is set', () => {
        const logger = new LoggerService();
        const transporters = logger.getTransporters();

        expect(transporters).toHaveLength(1);
        expect(transporters[0]).toBeInstanceOf(ConsoleTransporter);
      });

      it('should return manager channel transporters when manager is set', () => {
        const channelTransporter = new SilentTransporter();
        const channelLogger = new LoggerService({ transporters: [channelTransporter] });
        const mockManager = { channel: vi.fn().mockReturnValue(channelLogger) } as any;
        LoggerService.staticManagerRef = mockManager;

        const logger = new LoggerService();
        expect(logger.getTransporters()).toEqual([channelTransporter]);
      });
    });

    describe('overrideLogger', () => {
      it('should set staticManagerRef', () => {
        const mockManager = { channel: vi.fn() } as any;
        LoggerService.overrideLogger(mockManager);

        expect(LoggerService.staticManagerRef).toBe(mockManager);
      });
    });
  });
});
