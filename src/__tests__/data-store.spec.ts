import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock notivue before importing the store
vi.mock('notivue', () => ({
  push: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }
}))

// Mock vue-router
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  }
}))

// Mock HttpUtils
const mockGet = vi.fn()
const mockPost = vi.fn()
vi.mock('@/plugins/httputil', () => ({
  default: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
  }
}))

import Data from '@/store/modules/data'

describe('Data store - autoreset actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('loadAutoreset', () => {
    it('returns autoreset data on success', async () => {
      const mockAutoreset = {
        id: 1,
        clientId: 42,
        resetMode: 1,
        resetDayOfMonth: 15,
        resetPeriodDays: 0,
        lastResetAt: 1700000000,
        createdAt: 1699000000,
      }
      mockGet.mockResolvedValue({
        success: true,
        msg: '',
        obj: mockAutoreset,
      })

      const store = Data()
      const result = await store.loadAutoreset(42)

      expect(mockGet).toHaveBeenCalledWith('api/autoreset', { clientId: 42 })
      expect(result).toEqual(mockAutoreset)
    })

    it('returns null when no autoreset configured', async () => {
      mockGet.mockResolvedValue({
        success: true,
        msg: '',
        obj: null,
      })

      const store = Data()
      const result = await store.loadAutoreset(999)

      expect(result).toBeNull()
    })

    it('returns null on failure', async () => {
      mockGet.mockResolvedValue({
        success: false,
        msg: 'not found',
        obj: null,
      })

      const store = Data()
      const result = await store.loadAutoreset(999)

      expect(result).toBeNull()
    })
  })

  describe('saveAutoreset', () => {
    it('sends correct POST data for monthly reset', async () => {
      mockPost.mockResolvedValue({
        success: true,
        msg: 'save',
        obj: null,
      })

      const store = Data()
      const result = await store.saveAutoreset(42, {
        resetMode: 1,
        resetDayOfMonth: 15,
        resetPeriodDays: 0,
      })

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('api/saveAutoreset', {
        clientId: 42,
        resetMode: 1,
        resetDayOfMonth: 15,
        resetPeriodDays: 0,
      })
    })

    it('sends correct POST data for periodic reset', async () => {
      mockPost.mockResolvedValue({
        success: true,
        msg: 'save',
        obj: null,
      })

      const store = Data()
      const result = await store.saveAutoreset(42, {
        resetMode: 2,
        resetDayOfMonth: 0,
        resetPeriodDays: 7,
      })

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('api/saveAutoreset', {
        clientId: 42,
        resetMode: 2,
        resetDayOfMonth: 0,
        resetPeriodDays: 7,
      })
    })

    it('sends disable request with resetMode 0', async () => {
      mockPost.mockResolvedValue({
        success: true,
        msg: 'save',
        obj: null,
      })

      const store = Data()
      const result = await store.saveAutoreset(42, {
        resetMode: 0,
      })

      expect(result).toBe(true)
      expect(mockPost).toHaveBeenCalledWith('api/saveAutoreset', {
        clientId: 42,
        resetMode: 0,
        resetDayOfMonth: 0,
        resetPeriodDays: 30,
      })
    })

    it('returns false on failure', async () => {
      mockPost.mockResolvedValue({
        success: false,
        msg: 'error',
        obj: null,
      })

      const store = Data()
      const result = await store.saveAutoreset(42, {
        resetMode: 1,
        resetDayOfMonth: 15,
      })

      expect(result).toBe(false)
    })

    it('uses default values for missing fields', async () => {
      mockPost.mockResolvedValue({
        success: true,
        msg: 'save',
        obj: null,
      })

      const store = Data()
      await store.saveAutoreset(42, {})

      expect(mockPost).toHaveBeenCalledWith('api/saveAutoreset', {
        clientId: 42,
        resetMode: 0,
        resetDayOfMonth: 0,
        resetPeriodDays: 30,
      })
    })
  })

  describe('loadTrafficHistory', () => {
    it('returns paginated traffic history', async () => {
      const mockHistories = [
        {
          id: 1,
          clientId: 42,
          clientName: 'test',
          startTime: 1699000000,
          endTime: 1700000000,
          up: 1000,
          down: 2000,
          resetMode: 1,
        },
      ]
      mockGet.mockResolvedValue({
        success: true,
        msg: '',
        obj: { histories: mockHistories, total: 15 },
      })

      const store = Data()
      const result = await store.loadTrafficHistory(42, 1, 10)

      expect(mockGet).toHaveBeenCalledWith('api/traffic-history', {
        clientId: 42,
        page: 1,
        pageSize: 10,
      })
      expect(result.histories).toHaveLength(1)
      expect(result.total).toBe(15)
      expect(result.histories[0].clientName).toBe('test')
    })

    it('returns empty result on failure', async () => {
      mockGet.mockResolvedValue({
        success: false,
        msg: 'error',
        obj: null,
      })

      const store = Data()
      const result = await store.loadTrafficHistory(42, 1, 10)

      expect(result.histories).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('handles null histories gracefully', async () => {
      mockGet.mockResolvedValue({
        success: true,
        msg: '',
        obj: { histories: null, total: null },
      })

      const store = Data()
      const result = await store.loadTrafficHistory(42, 1, 10)

      expect(result.histories).toEqual([])
      expect(result.total).toBe(0)
    })

    it('supports different page sizes', async () => {
      mockGet.mockResolvedValue({
        success: true,
        msg: '',
        obj: { histories: [], total: 0 },
      })

      const store = Data()
      await store.loadTrafficHistory(42, 2, 25)

      expect(mockGet).toHaveBeenCalledWith('api/traffic-history', {
        clientId: 42,
        page: 2,
        pageSize: 25,
      })
    })
  })
})
