/*!
  * vue-autofocus v1.0.0
  * (c) 2019 André Bunse (aburai)
  * @license MIT
  */
var _Vue;

var _OPTIONS = {
  initDelay: 300,
  focusDelay: 100,
  refocusDelay: 100,
  debug: false
};

// find a valid node inside target element
// if target element is valid return target
var _validNodes = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
var _findNode = function (target) {
  if (!target) { return }
  if (typeof target.querySelector !== 'function') { return }

  // if target is valid, use target
  if (_validNodes.includes(target.nodeName) && !_isInvalid(target)) { return target }

  // if target is not valid, search inside target for attribute "autofocus"
  var el = target.querySelector('[autofocus]');
  if (!el) {
    var nodeName = _validNodes.find(function (vn) { return !_isInvalid(target.querySelector(vn)); });
    if (nodeName) { el = target.querySelector(nodeName); }
  }
  return el
};

// valid means: not disabled (by attribute or class)
// - ignore readonly, element could be a wrapper ex. select
var _isInvalid = function (el) {
  if (!el) { return 'el missing' }

  var isDisabled = el.getAttribute('disabled') || el.classList.contains('disabled');
  if (isDisabled) { return 'el disabled' }

  return ''
};
var _isVisible = function (el, opts) {
  var parentWidth;
  var parentHeight;
  if (opts && opts.parent) {
    var parent = opts.parent;
    parentWidth = parent.clientWidth;
    parentHeight = parent.clientHeight;
  }
  else {
    parentWidth = window.innerWidth;
    parentHeight = window.innerHeight;
  }
  var rect = el.getBoundingClientRect();
  return rect.left >= 0 && rect.left < parentWidth && rect.top >= 0 && rect.top < parentHeight
};

function install (Vue, options) {
  if (install.installed && _Vue === Vue) { return }
  install.installed = true;
  _Vue = Vue;

  // ## Default plugin options
  // Plugin defaults with options from Vue.use(VueAutofocus, {options})
  var _options = Object.assign({}, _OPTIONS, options);
  var t0, t1, t2, t3;

  Vue.prototype.$autofocus = function(selector, copts) {
    var this$1 = this;

    // options for this focus trigger
    var opts = Object.assign({}, _options, copts);

    this.$nextTick(function () {
      clearTimeout(t0);
      // initial timeout is for possible transitions (ex. tabs changed)
      t0 = setTimeout(function () {
        // find container
        var container = _findContainer();
        // if container is not visible, maybe you must increase initDelay
        if (!_isVisible(container, opts)) { return _log('selector is not visible') }

        var el = _findNode(container);
        // check element
        if (!(el instanceof HTMLElement)) { return _log('found no element to focus', el) }
        if (el === document.activeElement) { return _log('element already focused') }
        var err = _isInvalid(el);
        if (err) { return _log('error:', err, el) }
        // TODO check visibility of el?

        _log('active element before', document.activeElement);
        this$1.$nextTick(function () {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          // first timeout is for possible transitions (ex. tabs changed)
          t1 = setTimeout(function () {
            el.focus();
            // second timeout is to check a focus lost
            t2 = setTimeout(function () {
              if (el !== document.activeElement) { el.focus(); }
              // third timeout as safeguard
              t3 = setTimeout(function () {
                if (el !== document.activeElement) { el.focus(); }
                // debug focus state
                if (el === document.activeElement) { _log('focused', el); }
                else { _log('failed', document.activeElement); }
                t1 = null;
                t2 = null;
                t3 = null;
              }, opts.refocusDelay);
            }, opts.refocusDelay);
          }, opts.focusDelay);
        });
      }, opts.initDelay);
    });

    var _findContainer = function () {
      var target;

      if (selector && typeof selector === 'string') {
        target = this$1.$el.querySelector(selector);
        _log('by selector=%s', selector, target);
      }
      else if (selector instanceof _Vue) {
        var vm = selector;
        target = vm.$refs.input || vm.$el;
        _log('by vue component', selector, target);
      }
      else {
        target = this$1.$el;
        _log('by component $el', target);
      }

      return target
    };

    function _log(msg, a1, a2, a3) {
      if (opts.debug) { console.log.apply(console, arguments); }
    }
  };
}

/*  */

var VueAutofocus = function VueAutofocus () {};

VueAutofocus.prototype.init = function init (app /* Vue component instance */) {
  if (process.env.NODE_ENV !== 'production')
    { throw new Error(
      install.installed,
      "not installed. Make sure to call `Vue.use(VueAutofocus)` " +
      "before creating root instance."
    ) }
};

VueAutofocus.install = install;
VueAutofocus.version = '1.0.0';

if (window && window.Vue) { window.Vue.use(VueAutofocus); }

export default VueAutofocus;
