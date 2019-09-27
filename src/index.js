/* @flow */

import { install } from './install'

export default class VueAutofocus {
  static install: () => void
  static version: string

  constructor (options = {}) {
    console.log('constructor', options)
    this.options = options
  }

  init (app: any /* Vue component instance */) {
    if (process.env.NODE_ENV !== 'production')
      throw new Error(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueAutofocus)\` ` +
        `before creating root instance.`
      )
  }
}

VueAutofocus.install = install
VueAutofocus.version = '__VERSION__'

if (window && window.Vue) window.Vue.use(VueAutofocus)
