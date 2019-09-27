/* @flow */

//  __     __             _         _         __                      
//  \ \   / /   _  ___   / \  _   _| |_ ___  / _| ___   ___ _   _ ___ 
//   \ \ / / | | |/ _ \ / _ \| | | | __/ _ \| |_ / _ \ / __| | | / __|
//    \ V /| |_| |  __// ___ \ |_| | |_ (_) |  _| (_) | (__| |_| \__ \
//     \_/  \__,_|\___/_/   \_\__,_|\__\___/|_|  \___/ \___|\__,_|___/
//                                                                    

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
