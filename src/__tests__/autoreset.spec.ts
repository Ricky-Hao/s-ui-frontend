import { describe, it, expect } from 'vitest'
import { ResetMode, defaultAutoreset } from '@/types/autoreset'
import type { ClientAutoreset, ResetModeType, TrafficHistoryItem } from '@/types/autoreset'

describe('ResetMode constants', () => {
  it('has correct values', () => {
    expect(ResetMode.Disabled).toBe(0)
    expect(ResetMode.Monthly).toBe(1)
    expect(ResetMode.Periodic).toBe(2)
  })

  it('has exactly 3 modes', () => {
    const keys = Object.keys(ResetMode)
    expect(keys).toHaveLength(3)
    expect(keys).toEqual(['Disabled', 'Monthly', 'Periodic'])
  })
})

describe('defaultAutoreset', () => {
  it('has correct default values', () => {
    expect(defaultAutoreset.resetMode).toBe(ResetMode.Disabled)
    expect(defaultAutoreset.resetDayOfMonth).toBe(0)
    expect(defaultAutoreset.resetPeriodDays).toBe(30)
  })

  it('does not include clientId', () => {
    expect(defaultAutoreset).not.toHaveProperty('clientId')
  })

  it('does not include optional fields', () => {
    expect(defaultAutoreset).not.toHaveProperty('id')
    expect(defaultAutoreset).not.toHaveProperty('lastResetAt')
    expect(defaultAutoreset).not.toHaveProperty('createdAt')
  })
})

describe('ClientAutoreset type', () => {
  it('can create a valid ClientAutoreset object', () => {
    const autoreset: ClientAutoreset = {
      clientId: 42,
      resetMode: ResetMode.Monthly,
      resetDayOfMonth: 15,
      resetPeriodDays: 0,
    }
    expect(autoreset.clientId).toBe(42)
    expect(autoreset.resetMode).toBe(ResetMode.Monthly)
    expect(autoreset.resetDayOfMonth).toBe(15)
    expect(autoreset.resetPeriodDays).toBe(0)
  })

  it('can include optional fields', () => {
    const autoreset: ClientAutoreset = {
      id: 1,
      clientId: 42,
      resetMode: ResetMode.Periodic,
      resetDayOfMonth: 0,
      resetPeriodDays: 7,
      lastResetAt: 1700000000,
      createdAt: 1699000000,
    }
    expect(autoreset.id).toBe(1)
    expect(autoreset.lastResetAt).toBe(1700000000)
    expect(autoreset.createdAt).toBe(1699000000)
  })

  it('can create defaults with spread and clientId', () => {
    const autoreset: ClientAutoreset = {
      ...defaultAutoreset,
      clientId: 99,
    }
    expect(autoreset.clientId).toBe(99)
    expect(autoreset.resetMode).toBe(ResetMode.Disabled)
    expect(autoreset.resetDayOfMonth).toBe(0)
    expect(autoreset.resetPeriodDays).toBe(30)
  })
})

describe('TrafficHistoryItem type', () => {
  it('can create a valid TrafficHistoryItem object', () => {
    const item: TrafficHistoryItem = {
      id: 1,
      clientId: 42,
      clientName: 'test-client',
      startTime: 1699000000,
      endTime: 1700000000,
      up: 1024 * 1024 * 100,
      down: 1024 * 1024 * 500,
      resetMode: ResetMode.Monthly,
    }
    expect(item.id).toBe(1)
    expect(item.clientName).toBe('test-client')
    expect(item.up + item.down).toBe(1024 * 1024 * 600)
    expect(item.resetMode).toBe(ResetMode.Monthly)
  })
})
