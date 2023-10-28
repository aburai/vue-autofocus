/*!
  * vue-autofocus v1.0.8
  * (c) 2023 André Bunse (aburai)
  * @license MIT
  */
// global defaults options
const _OPTIONS = {
    initDelay: 300,
    focusDelay: 100,
    refocusDelay: 100,
    select: true,
    debug: false
};

// order of _validNodes sets priority when find first focusable element
const _validNodesInput = ['INPUT', 'TEXTAREA'];
const _validNodes = _validNodesInput.concat(['SELECT', 'BUTTON', 'A']);
// find a valid node inside target element
// if target element is valid return target
const _findNode = (target) => {
    if (!target) return
    if (typeof target.querySelector !== 'function') return

    // if target is valid, use target
    if (_validNodes.includes(target.nodeName) && !_isInvalid(target)) return target

    // check tabindex of the target
    const tabindex = target.getAttribute('tabindex');
    if (tabindex && tabindex !== '-1') return target

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
    if (!el || typeof el.getBoundingClientRect !== 'function') {
        if (opts.debug) console.debug('invalid element', el);
        return false
    }

    // check if we have an open dialog
    const dialogs = document.querySelectorAll('body > dialog[open]');
    // get top-most dialog
    const dialog = dialogs[dialogs.length - 1];
    if (dialog && !dialog.contains(el)) {
        if (opts.debug) console.debug('not part of open dialog');
        return false
    }

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
        let userEvent = false;

        _log('vue-autofocus', selector || '');

        this.$nextTick(() => {
            if (t0) clearTimeout(t0);
            // initial timeout is for possible transitions (ex. tabs changed)
            t0 = setTimeout(() => {
                // find container
                const container = _findContainer();
                if (!container) return _log('container not found', selector)
                // if container is not visible, maybe you must increase initDelay
                if (!_isVisible(container, opts)) return _log('selector is not visible')

                const el = _findNode(container);
                // check element
                if (!(el instanceof HTMLElement)) return _log('found no element to focus', el)
                if (el === document.activeElement) return _log('element already focused')
                const err = _isInvalid(el);
                if (err) return _log('error:', err, el)
                // TODO check visibility of el?

                _start();
                _log('set focus to', el);
                _log('active element before', document.activeElement);
                this.$nextTick(() => {
                    if (t1) clearTimeout(t1);
                    if (t2) clearTimeout(t2);
                    if (t3) clearTimeout(t3);
                    // first timeout is for possible transitions (ex. tabs changed)
                    t1 = setTimeout(() => {
                        el.focus();

                        // second timeout is to check a focus lost
                        // skipped if an userEvent currently happened
                        t2 = setTimeout(() => {
                            if (el !== document.activeElement && !userEvent) el.focus();

                            // third timeout as safeguard
                            // skipped if an userEvent currently happened
                            t3 = setTimeout(() => {
                                if (el !== document.activeElement && !userEvent) el.focus();

                                // debug focus state
                                if (el === document.activeElement) {
                                    _selectText(el);
                                    _log('focused', el);
                                }
                                else if (!userEvent) _log('failed', document.activeElement);
                                else _log('user event: skipped');

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

        const _selectText = (element, selectionStart, selectionEnd) => {
            if (!opts.select) return // selection is disabled
            if (!element || !element.nodeName) return // no valid element
            if (!_validNodesInput.includes(element.nodeName)) return // not an input field
            if (!element.value) return // nothing to select

            if (element.createTextRange) {
                const range = element.createTextRange();
                range.move('character', selectionEnd);
                range.select();
            }
            else {
                try {
                    // select part of text
                    if (typeof selectionStart !== 'undefined' && typeof selectionEnd !== 'undefined') {
                        element.setSelectionRange(selectionStart, selectionEnd);
                    }
                    else element.select(); // select all text
                }
                catch (e) {
                    // eslint-disable-next-line
                    console.warn('The input element type does not support selection');
                }
            }
        };

        const _findContainer = () => {
            let target;

            if (selector && typeof selector === 'object' && selector.ref && this.$refs) {
                selector = this.$refs[selector.ref];
            }

            if (selector && typeof selector === 'string') {
                target = document.querySelector(selector);
                _log('by selector=%s', selector, target);
            }
            else if (selector instanceof _Vue) {
                const vm = selector;
                target = vm.$refs.input || vm.$el;
                _log('by vue component', selector, target);
            }
            else if (selector && selector.hasOwnProperty('jquery')) {
                target = selector[0];
            }
            else {
                target = this.$el;
                _log('by component $el', target);
            }

            return target
        };

        // listen to click and key events
        // set userEvent=true to skip focus flow
        // NOTE useCapture=true is important, ex. in dialogs
        const _start = () => {
            document.addEventListener('click', _onClick, true);
            document.addEventListener('keyup', _onKey, true);
        };
        const _finish = () => {
            document.removeEventListener('click', _onClick, true);
            document.removeEventListener('keyup', _onKey, true);
        };
        const _onClick = () => {userEvent = true;};
        const _onKey = () => {userEvent = true;};

        function _log() {
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
VueAutofocus.version = '1.0.8';

if (window && window.Vue) {
    window.Vue.use(VueAutofocus);
}

export { VueAutofocus };
