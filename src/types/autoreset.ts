// Reset mode constants
export const ResetMode = {
  Disabled: 0,
  Monthly: 1,
  Periodic: 2,  // Every N days
} as const

export type ResetModeType = typeof ResetMode[keyof typeof ResetMode]

export interface ClientAutoreset {
  id?: number
  clientId: number
  resetMode: ResetModeType
  resetDayOfMonth: number  // 1-31, 0 = use creation day
  resetPeriodDays: number  // For periodic reset mode
  lastResetAt?: number
  createdAt?: number
}

export const defaultAutoreset: Omit<ClientAutoreset, 'clientId'> = {
  resetMode: ResetMode.Disabled,
  resetDayOfMonth: 0,
  resetPeriodDays: 30,
}

export interface TrafficHistoryItem {
  id: number
  clientId: number
  clientName: string
  startTime: number
  endTime: number
  up: number
  down: number
  resetMode: number
}
