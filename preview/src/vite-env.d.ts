/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}

declare module 'virtual:theme-data' {
  import type { ThemeCard } from './types'
  const themes: ThemeCard[]
  export default themes
}
