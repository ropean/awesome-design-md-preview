import { ref, watchEffect, readonly } from 'vue'

const isDark = ref(false)

let initialized = false

export function useDarkMode() {
  if (!initialized) {
    initialized = true
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = saved !== null ? saved === 'dark' : prefersDark

    watchEffect(() => {
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    })
  }

  return {
    isDark: readonly(isDark),
    toggleDark: () => { isDark.value = !isDark.value },
  }
}
