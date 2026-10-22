import type { InjectionKey } from 'vue'
import type { FunLoaderIcon } from '@vectorchi/fun-loader/element'

export interface FunLoaderDefaults {
  theme?: string
  icon?: FunLoaderIcon
  /** Milliseconds between messages. */
  interval?: number
  /** What screen readers hear. */
  label?: string
}

/** The app-wide defaults from `funLoader.defaults`, provided by the module's plugin. */
export const DEFAULTS_KEY: InjectionKey<FunLoaderDefaults> = Symbol.for('fun-loader:defaults')
