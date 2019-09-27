/*!
  * vue-autofocus v0.1.0
  * (c) 2019 André Bunse (aburai)
  * @license MIT
  */
let _Vue;

function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true;
  _Vue = Vue;

  Vue.prototype.$autofocus = function(selector, options) {
    console.log('$autofocus', selector, options);
  };
}

/*  */

class VueAutofocus {
  
  

  constructor (options = {}) {
    console.log('constructor', options);
    this.options = options;
  }

  init (app /* Vue component instance */) {
    throw new Error(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueAutofocus)\` ` +
        `before creating root instance.`
      )
  }
}

VueAutofocus.install = install;
VueAutofocus.version = '0.1.0';

if (window && window.Vue) window.Vue.use(VueAutofocus);

export default VueAutofocus;
