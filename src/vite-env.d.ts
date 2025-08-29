/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BDNS_URL: string
  readonly VITE_API_SNPSAP_URL: string
  readonly VITE_API_DATOS_GOB_URL: string
  readonly VITE_API_KEY_BDNS?: string
  readonly VITE_API_KEY_SNPSAP?: string
  readonly VITE_API_KEY_DATOS_GOB?: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'test'
  readonly VITE_EMAIL_SERVICE_URL: string
  readonly VITE_PUSH_SERVICE_URL: string
  readonly VITE_SMS_SERVICE_URL: string
  readonly VITE_GA_TRACKING_ID?: string
  readonly VITE_HOTJAR_ID?: string
  readonly VITE_CACHE_TIMEOUT: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_MAX_EXPORT_ITEMS: string
  readonly VITE_MAX_SEARCH_RESULTS: string
  readonly VITE_PAGE_SIZE: string
  readonly VITE_FEATURE_ALERTS: string
  readonly VITE_FEATURE_EXPORT: string
  readonly VITE_FEATURE_DASHBOARD: string
  readonly VITE_FEATURE_ADVANCED_FILTERS: string
  readonly VITE_SUPPORT_URL: string
  readonly VITE_DOCS_URL: string
  readonly VITE_FEEDBACK_URL: string
  readonly VITE_DEV_MODE: string
  readonly VITE_MOCK_DATA: string
  readonly VITE_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.json' {
  const content: string
  export default content
}
