/**
 * @jest-environment jsdom
 */

import { validateUserQuota, consumeServerQuota } from '../api/quota';
import { Request, Response } from 'express';

// Mock Firebase Admin
jest.mock('../src/lib/firebase-admin', () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn()
      }))
    }))
  },
  auth: {
    verifyIdToken: jest.fn()
  },
  isAdminInitialized: true
}));

describe('Quota API', () => {
  const mockRequest = {
    headers: {
      authorization: 'Bearer test-token'
    }
  } as Request;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  } as Response;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUserQuota', () => {
    it('returns quota data for valid user', async () => {
      const mockQuotaData = {
        fairUseLimit: false,
        queriesUsedToday: 10,
        queriesUsedWeek: 50,
        imagesUsedToday: 5,
        imagesUsedWeek: 20,
        queriesRemaining: 990,
        imagesRemaining: 95
      };

      // Mock Firestore
      const { db } = require('../src/lib/firebase-admin');
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockQuotaData
          })
        })
      });

      const result = await validateUserQuota('test-user');
      
      expect(result).toEqual(mockQuotaData);
    });

    it('handles user with no quota data', async () => {
      // Mock Firestore
      const { db } = require('../src/lib/firebase-admin');
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false
          })
        })
      });

      const result = await validateUserQuota('test-user');
      
      expect(result.fairUseLimit).toBe(false);
      expect(result.queriesUsedToday).toBe(0);
    });

    it('handles database errors', async () => {
      // Mock Firestore error
      const { db } = require('../src/lib/firebase-admin');
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      await expect(validateUserQuota('test-user')).rejects.toThrow('Database error');
    });
  });

  describe('consumeServerQuota', () => {
    it('successfully consumes quota', async () => {
      const mockQuotaData = {
        fairUseLimit: false,
        queriesUsedToday: 10,
        queriesUsedWeek: 50,
        imagesUsedToday: 5,
        imagesUsedWeek: 20,
        queriesRemaining: 990,
        imagesRemaining: 95
      };

      // Mock Firestore
      const { db } = require('../src/lib/firebase-admin');
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockQuotaData
          }),
          update: jest.fn()
        })
      });

      await consumeServerQuota('test-user', false);
      
      expect(db.collection).toHaveBeenCalledWith('users');
    });

    it('handles image quota consumption', async () => {
      const mockQuotaData = {
        fairUseLimit: false,
        queriesUsedToday: 10,
        queriesUsedWeek: 50,
        imagesUsedToday: 5,
        imagesUsedWeek: 20,
        queriesRemaining: 990,
        imagesRemaining: 95
      };

      // Mock Firestore
      const { db } = require('../src/lib/firebase-admin');
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => mockQuotaData
          }),
          update: jest.fn()
        })
      });

      await consumeServerQuota('test-user', true);
      
      expect(db.collection).toHaveBeenCalledWith('users');
    });
  });

  describe('extractUserId', () => {
    it('extracts user ID from valid token', async () => {
      const { auth } = require('../src/lib/firebase-admin');
      auth.verifyIdToken.mockResolvedValue({ uid: 'test-user', email: 'test@example.com' });

      const userId = await (require('../api/quota').extractUserId as any)(mockRequest);
      
      expect(userId).toBe('test-user');
      expect(auth.verifyIdToken).toHaveBeenCalledWith('test-token');
    });

    it('handles missing authorization header', async () => {
      const { auth } = require('../src/lib/firebase-admin');
      auth.verifyIdToken.mockResolvedValue({ uid: 'test-user', email: 'test@example.com' });

      const requestWithoutAuth = { ...mockRequest, headers: {} };
      const userId = await (require('../api/quota').extractUserId as any)(requestWithoutAuth);
      
      expect(userId).toBeNull();
    });

    it('handles invalid token', async () => {
      const { auth } = require('../src/lib/firebase-admin');
      auth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const userId = await (require('../api/quota').extractUserId as any)(mockRequest);
      
      expect(userId).toBeNull();
    });
  });
});