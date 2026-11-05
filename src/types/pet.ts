export type EmotionType = 'idle' | 'happy' | 'shy' | 'sleepy'

export type ThemeColor = 'cyan' | 'yellow' | 'pink-purple' | 'deep-blue'

export type LogLevel = 'USER_INPUT' | 'QUICK_ACTION' | 'OVERRIDE' | 'SYSTEM' | 'AMBIENT'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  emotion: EmotionType
  stateCode: string
}

export interface EmotionConfig {
  code: string
  label: string
  description: string
  theme: ThemeColor
  quotes: string[]
}
