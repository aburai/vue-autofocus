# vue-autofocus

## UNDER CONSTRUCTION - use at own risc and create issues

### Introduction

`vue-autofocus` is a plugin for [Vue.js](http://vuejs.org). Features include:

- many supported selectors to query control to focus
- options for finetuning (initDelay, focusDelay, refocusDelay)
- option for debugging (logs focus workflow)

## Install

From npm:

``` sh
$ npm install vue-autofocus --save
$ yarn add vue-autofocus
```

### Usage

#### append plugin to Vue
``` js
import Vue from 'vue'
import VueAutofocus from 'vue-autofocus'
Vue.use(VueAutofocus)
```

#### use plugin
``` js
mounted() {
    this.$autofocus() // use this.$el to find a focusable control
    this.$autofocus('#my-element') // find element by id in this.$el
    this.$autofocus(this.$refs.form)
    this.$autofocus(this.$refs.dialog, {initDelay: 600, debug: true})
}
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present André Bunse (aburai)

## Special Thanks

to [vue-router](https://github.com/vuejs/vue-router) as a boilerplate for a good vue plugin template
