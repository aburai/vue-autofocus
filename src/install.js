// global defaults options
const _OPTIONS = {
  initDelay: 300,
  focusDelay: 100,
  refocusDelay: 100,
  select: true,
  debug: false
}

// order of _validNodes sets priority when find first focusable element
const _validNodesInput = ['INPUT', 'TEXTAREA']
const _validNodes = _validNodesInput.concat(['SELECT', 'BUTTON'])
// find a valid node inside target element
// if target element is valid return target
const _findNode = (target) => {
  if (!target) return
  if (typeof target.querySelector !== 'function') return

  // if target is valid, use target
  if (_validNodes.includes(target.nodeName) && !_isInvalid(target)) return target

  // if target is not valid, search inside target for attribute "autofocus"
  let el = target.querySelector('[autofocus]')
  if (!el) {
    const nodeName = _validNodes.find(vn => !_isInvalid(target.querySelector(vn)))
    if (nodeName) el = target.querySelector(nodeName)
  }
  return el
}

// valid means: not disabled (by attribute or class)
// - ignore readonly, element could be a wrapper ex. select
const _isInvalid = (el) => {
  if (!el) return 'el missing'

  const isDisabled = el.getAttribute('disabled') || el.classList.contains('disabled')
  if (isDisabled) return 'el disabled'

  return ''
}
const _isVisible = (el, opts) => {
  let parentWidth
  let parentHeight
  if (opts && opts.parent) {
    const parent = opts.parent
    parentWidth = parent.clientWidth
    parentHeight = parent.clientHeight
  }
  else {
    parentWidth = window.innerWidth
    parentHeight = window.innerHeight
  }
  const rect = el.getBoundingClientRect()
  return rect.left >= 0 && rect.left < parentWidth && rect.top >= 0 && rect.top < parentHeight
}

export let _Vue

export function install (Vue, options) {
  if (install.installed && _Vue === Vue) return
  install.installed = true
  _Vue = Vue

  // ## Default plugin options
  // Plugin defaults with options from Vue.use(VueAutofocus, {options})
  const _options = Object.assign({}, _OPTIONS, options)
  let t0, t1, t2, t3

  Vue.prototype.$autofocus = function(selector, copts) {
    // options for this focus trigger
    const opts = Object.assign({}, _options, copts)

    this.$nextTick(() => {
      clearTimeout(t0)
      // initial timeout is for possible transitions (ex. tabs changed)
      t0 = setTimeout(() => {
        // find container
        const container = _findContainer()
        // if container is not visible, maybe you must increase initDelay
        if (!_isVisible(container, opts)) return _log('selector is not visible')

        const el = _findNode(container)
        // check element
        if (!(el instanceof HTMLElement)) return _log('found no element to focus', el)
        if (el === document.activeElement) return _log('element already focused')
        const err = _isInvalid(el)
        if (err) return _log('error:', err, el)
        // TODO check visibility of el?

        _log('active element before', document.activeElement)
        this.$nextTick(() => {
          clearTimeout(t1)
          clearTimeout(t2)
          clearTimeout(t3)
          // first timeout is for possible transitions (ex. tabs changed)
          t1 = setTimeout(() => {
            el.focus()
            // second timeout is to check a focus lost
            t2 = setTimeout(() => {
              if (el !== document.activeElement) el.focus()
              // third timeout as safeguard
              t3 = setTimeout(() => {
                if (el !== document.activeElement) el.focus()
                // debug focus state
                if (el === document.activeElement) {
                  _selectText(el)
                  _log('focused', el)
                }
                else _log('failed', document.activeElement)
                t1 = null
                t2 = null
                t3 = null
              }, opts.refocusDelay)
            }, opts.refocusDelay)
          }, opts.focusDelay)
        })
      }, opts.initDelay)
    })

    const _selectText = (element, selectionStart, selectionEnd) => {
      if (!opts.select) return
      if (!element || !element.nodeName) return
      if (!_validNodesInput.includes(element.nodeName)) return

      if (element.createTextRange) {
        const range = element.createTextRange()
        range.move('character', selectionEnd)
        range.select()
      }
      else {
        try {
          // select part of text
          if (typeof selectionStart !== 'undefined' && typeof selectionEnd !== 'undefined') {
            element.setSelectionRange(selectionStart, selectionEnd)
          }
          else element.select() // select all text
        }
        catch (e) {
          // eslint-disable-next-line
          console.warn('The input element type does not support selection')
        }
      }
    }

    const _findContainer = () => {
      let target

      if (typeof selector === 'object' && selector.ref) {
        selector = this.$refs[selector.ref]
      }

      if (selector && typeof selector === 'string') {
        target = this.$el.querySelector(selector)
        _log('by selector=%s', selector, target)
      }
      else if (selector instanceof _Vue) {
        const vm = selector
        target = vm.$refs.input || vm.$el
        _log('by vue component', selector, target)
      }
      else {
        target = this.$el
        _log('by component $el', target)
      }

      return target
    }

    // Check if input field is fully selected
    const _isFullSelection = (value) => {
      try {
        const selection = window.getSelection() || document.getSelection() || ''
        return selection.toString().length === value.length
      }
      catch (ex) {
        // Ignore
      }

      return false
    }

    function _log(msg, a1, a2, a3) {
      if (opts.debug) console.log.apply(console, arguments)
    }
  }
}
