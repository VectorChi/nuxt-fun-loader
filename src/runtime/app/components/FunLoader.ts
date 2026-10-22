import { defineComponent, h, inject, type PropType } from 'vue'
import type { FunLoaderIcon, FunLoaderStage } from '@vectorchi/fun-loader/element'
import { DEFAULTS_KEY } from '../defaults'

// Same props as @vectorchi/fun-loader/vue, built on /element so the module decides which themes
// load. That entry registers every theme on import (see CORE-REQUESTS.md).
export default defineComponent({
  name: 'FunLoader',
  props: {
    /** A theme name. Falls back to `funLoader.defaults.theme`, then `thinking`. */
    theme: String,
    /** Your own messages, instead of a theme's. */
    messages: Array as PropType<readonly string[]>,
    /** Messages that change as the wait grows. */
    stages: Array as PropType<readonly FunLoaderStage[] | null>,
    /** Milliseconds between messages. */
    interval: Number,
    paused: Boolean,
    /** Show only the icon; screen readers still hear `label`. */
    iconOnly: Boolean,
    /** Show messages in the order written instead of shuffled. */
    ordered: Boolean,
    /** What screen readers hear. */
    label: String,
    icon: String as PropType<FunLoaderIcon>,
  },
  setup(props) {
    const defaults = inject(DEFAULTS_KEY, {})
    return () => {
      // Drop unset props so the defaults, then the element's own, apply.
      const set = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined))
      return h('fun-loader', { ...defaults, ...set })
    }
  },
})
