/*!
  * vue-autofocus v1.0.7
  * (c) 2022 André Bunse (aburai)
  * @license MIT
  */
// global defaults options
var _OPTIONS = {
    initDelay: 300,
    focusDelay: 100,
    refocusDelay: 100,
    select: true,
    debug: false
};

// order of _validNodes sets priority when find first focusable element
var _validNodesInput = ['INPUT', 'TEXTAREA'];
var _validNodes = _validNodesInput.concat(['SELECT', 'BUTTON', 'A']);
// find a valid node inside target element
// if target element is valid return target
var _findNode = function (target) {
    if (!target) { return }
    if (typeof target.querySelector !== 'function') { return }

    // if target is valid, use target
    if (_validNodes.includes(target.nodeName) && !_isInvalid(target)) { return target }

    // check tabindex of the target
    var tabindex = target.getAttribute('tabindex');
    if (tabindex && tabindex !== '-1') { return target }

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
    if (!el || typeof el.getBoundingClientRect !== 'function') { return false }

    // check if we have an open dialog
    var dialog = document.querySelector('body > dialog[open]');
    if (dialog && !dialog.contains(el)) { return false }

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

var _Vue;

function install (Vue, options) {
    if (install.installed && _Vue === Vue) { return }
    install.installed = true;
    _Vue = Vue;

    // ## Default plugin options
    // Plugin defaults with options from Vue.use(VueAutofocus, {options})
    var _options = Object.assign({}, _OPTIONS, options);
    var t0, t1, t2, t3;

    Vue.prototype.$autofocus = function(selector, copts) {
        var this$1$1 = this;

        // options for this focus trigger
        var opts = Object.assign({}, _options, copts);
        var userEvent = false;

        _log('vue-autofocus', selector || '');

        this.$nextTick(function () {
            if (t0) { clearTimeout(t0); }
            // initial timeout is for possible transitions (ex. tabs changed)
            t0 = setTimeout(function () {
                // find container
                var container = _findContainer();
                if (!container) { return _log('container not found', selector) }
                // if container is not visible, maybe you must increase initDelay
                if (!_isVisible(container, opts)) { return _log('selector is not visible') }

                var el = _findNode(container);
                // check element
                if (!(el instanceof HTMLElement)) { return _log('found no element to focus', el) }
                if (el === document.activeElement) { return _log('element already focused') }
                var err = _isInvalid(el);
                if (err) { return _log('error:', err, el) }
                // TODO check visibility of el?

                _start();
                _log('set focus to', el);
                _log('active element before', document.activeElement);
                this$1$1.$nextTick(function () {
                    if (t1) { clearTimeout(t1); }
                    if (t2) { clearTimeout(t2); }
                    if (t3) { clearTimeout(t3); }
                    // first timeout is for possible transitions (ex. tabs changed)
                    t1 = setTimeout(function () {
                        el.focus();

                        // second timeout is to check a focus lost
                        // skipped if an userEvent currently happened
                        t2 = setTimeout(function () {
                            if (el !== document.activeElement && !userEvent) { el.focus(); }

                            // third timeout as safeguard
                            // skipped if an userEvent currently happened
                            t3 = setTimeout(function () {
                                if (el !== document.activeElement && !userEvent) { el.focus(); }

                                // debug focus state
                                if (el === document.activeElement) {
                                    _selectText(el);
                                    _log('focused', el);
                                }
                                else if (!userEvent) { _log('failed', document.activeElement); }
                                else { _log('user event: skipped'); }

                                t1 = null;
                                t2 = null;
                                t3 = null;
                                _finish();
                            }, opts.refocusDelay);
                        }, opts.refocusDelay);
                    }, opts.focusDelay);
                });
            }, opts.initDelay);
        });

        var _selectText = function (element, selectionStart, selectionEnd) {
            if (!opts.select) { return } // selection is disabled
            if (!element || !element.nodeName) { return } // no valid element
            if (!_validNodesInput.includes(element.nodeName)) { return } // not an input field
            if (!element.value) { return } // nothing to select

            if (element.createTextRange) {
                var range = element.createTextRange();
                range.move('character', selectionEnd);
                range.select();
            }
            else {
                try {
                    // select part of text
                    if (typeof selectionStart !== 'undefined' && typeof selectionEnd !== 'undefined') {
                        element.setSelectionRange(selectionStart, selectionEnd);
                    }
                    else { element.select(); } // select all text
                }
                catch (e) {
                    // eslint-disable-next-line
                    console.warn('The input element type does not support selection');
                }
            }
        };

        var _findContainer = function () {
            var target;

            if (selector && typeof selector === 'object' && selector.ref && this$1$1.$refs) {
                selector = this$1$1.$refs[selector.ref];
            }

            if (selector && typeof selector === 'string') {
                target = document.querySelector(selector);
                _log('by selector=%s', selector, target);
            }
            else if (selector instanceof _Vue) {
                var vm = selector;
                target = vm.$refs.input || vm.$el;
                _log('by vue component', selector, target);
            }
            else if (selector && selector.hasOwnProperty('jquery')) {
                target = selector[0];
            }
            else {
                target = this$1$1.$el;
                _log('by component $el', target);
            }

            return target
        };

        // listen to click and key events
        // set userEvent=true to skip focus flow
        // NOTE useCapture=true is important, ex. in dialogs
        var _start = function () {
            document.addEventListener('click', _onClick, true);
            document.addEventListener('keyup', _onKey, true);
        };
        var _finish = function () {
            document.removeEventListener('click', _onClick, true);
            document.removeEventListener('keyup', _onKey, true);
        };
        var _onClick = function () {userEvent = true;};
        var _onKey = function () {userEvent = true;};

        function _log() {
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
VueAutofocus.version = '1.0.7';

if (window && window.Vue) {
    window.Vue.use(VueAutofocus);
}

export { VueAutofocus };
