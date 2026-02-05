// 常量定义
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme',
  DRAFT_PREFIX: 'note_draft_',
  DRAFT_HISTORY_PREFIX: 'note_draft_history_',
  HAS_VISITED: 'has_visited',
  HAS_SETUP: 'has_setup',
} as const;

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 10000,
} as const;

export const NOTE_CONFIG = {
  MAX_CONTENT_SIZE: 100 * 1024, // 100KB
  MAX_TAGS: 100,
  MAX_TITLE_LENGTH: 200,
  MAX_SHARES: 50,
  MAX_HISTORY: 20,
  DRAFT_DEBOUNCE: 5000, // 5秒
  PARAGRAPH_BREAK_DEBOUNCE: 1000, // 段落分隔1秒
} as const;

export const SHARE_CONFIG = {
  DEFAULT_EXPIRY_DAYS: 7,
  MAX_ALIAS_LENGTH: 30,
  MIN_ALIAS_LENGTH: 3,
} as const;

export const TAG_CONFIG = {
  MAX_NAME_LENGTH: 50,
  PRESET_COLORS: [
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#14B8A6', // teal
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
  ],
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SETUP: '/setup',
  EDITOR: '/note/:id',
  NEW_NOTE: '/note/new',
  SHARE: '/s/:slug',
} as const;
