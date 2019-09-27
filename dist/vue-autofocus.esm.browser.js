/*!
  * vue-autofocus v1.0.2
  * (c) 2019 André Bunse (aburai)
  * @license MIT
  */
// global defaults options
const _OPTIONS = {
  initDelay: 300,
  focusDelay: 100,
  refocusDelay: 100,
  debug: false
};

// find a valid node inside target element
// if target element is valid return target
const _validNodes = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
const _findNode = (target) => {
  if (!target) return
  if (typeof target.querySelector !== 'function') return

  // if target is valid, use target
  if (_validNodes.includes(target.nodeName) && !_isInvalid(target)) return target

  // if target is not valid, search inside target for attribute "autofocus"
  let el = target.querySelector('[autofocus]');
  if (!el) {
    const nodeName = _validNodes.find(vn => !_isInvalid(target.querySelector(vn)));
    if (nodeName) el = target.querySelector(nodeName);
  }
  return el
};

// valid means: not disabled (by attribute or class)
// - ignore readonly, element could be a wrapper ex. select
const _isInvalid = (el) => {
  if (!el) return 'el missing'

  const isDisabled = el.getAttribute('disabled') || el.classList.contains('disabled');
  if (isDisabled) return 'el disabled'

  return ''
};
const _isVisible = (el, opts) => {
  let parentWidth;
  let parentHeight;
  if (opts && opts.parent) {
    const parent = opts.parent;
    parentWidth = parent.clientWidth;
    parentHeight = parent.clientHeight;
  }
  else {
    parentWidth = window.innerWidth;
    parentHeight = window.innerHeight;
  }
  const rect = el.getBoundingClientRect();
  return rect.left >= 0 && rect.left < parentWidth && rect.top >= 0 && rect.top < parentHeight
};

let _Vue;

function install (Vue, options) {
  if (install.installed && _Vue === Vue) return
  install.installed = true;
  _Vue = Vue;

  // ## Default plugin options
  // Plugin defaults with options from Vue.use(VueAutofocus, {options})
  const _options = Object.assign({}, _OPTIONS, options);
  let t0, t1, t2, t3;

  Vue.prototype.$autofocus = function(selector, copts) {
    // options for this focus trigger
    const opts = Object.assign({}, _options, copts);

    this.$nextTick(() => {
      clearTimeout(t0);
      // initial timeout is for possible transitions (ex. tabs changed)
      t0 = setTimeout(() => {
        // find container
        const container = _findContainer();
        // if container is not visible, maybe you must increase initDelay
        if (!_isVisible(container, opts)) return _log('selector is not visible')

        const el = _findNode(container);
        // check element
        if (!(el instanceof HTMLElement)) return _log('found no element to focus', el)
        if (el === document.activeElement) return _log('element already focused')
        const err = _isInvalid(el);
        if (err) return _log('error:', err, el)
        // TODO check visibility of el?

        _log('active element before', document.activeElement);
        this.$nextTick(() => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          // first timeout is for possible transitions (ex. tabs changed)
          t1 = setTimeout(() => {
            el.focus();
            // second timeout is to check a focus lost
            t2 = setTimeout(() => {
              if (el !== document.activeElement) el.focus();
              // third timeout as safeguard
              t3 = setTimeout(() => {
                if (el !== document.activeElement) el.focus();
                // debug focus state
                if (el === document.activeElement) _log('focused', el);
                else _log('failed', document.activeElement);
                t1 = null;
                t2 = null;
                t3 = null;
              }, opts.refocusDelay);
            }, opts.refocusDelay);
          }, opts.focusDelay);
        });
      }, opts.initDelay);
    });

    const _findContainer = () => {
      let target;

      if (selector && typeof selector === 'string') {
        target = this.$el.querySelector(selector);
        _log('by selector=%s', selector, target);
      }
      else if (selector instanceof _Vue) {
        const vm = selector;
        target = vm.$refs.input || vm.$el;
        _log('by vue component', selector, target);
      }
      else {
        target = this.$el;
        _log('by component $el', target);
      }

      return target
    };

    function _log(msg, a1, a2, a3) {
      if (opts.debug) console.log.apply(console, arguments);
    }
  };
}

/*  */

class VueAutofocus {
  
  

  init (app /* Vue component instance */) {
    throw new Error(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueAutofocus)\` ` +
        `before creating root instance.`
      )
  }
}

VueAutofocus.install = install;
VueAutofocus.version = '1.0.2';

if (window && window.Vue) window.Vue.use(VueAutofocus);

export default VueAutofocus;
