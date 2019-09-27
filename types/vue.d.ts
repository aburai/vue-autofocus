/**
 * Augment the typings of Vue.js
 */

import Vue from 'vue'
import VueAutofocus from './index'

declare module 'vue/types/vue' {
  interface Vue {
    $autofocus: VueAutofocus
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    // router?: VueRouter
    // beforeRouteEnter?: NavigationGuard<V>
    // beforeRouteLeave?: NavigationGuard<V>
    // beforeRouteUpdate?: NavigationGuard<V>
  }
}
