# vue-autofocus

## UNDER CONSTRUCTION - not ready to use

### Introduction

`vue-autofocus` is a plugin for [Vue.js](http://vuejs.org). Features include:

- many supported selectors to define control to focus

### Development Setup

``` bash
# install deps
yarn install

# build dist files
yarn build
```

## Releasing

- `yarn release`
  - Ensure tests are passing `yarn test`
  - Build dist files `VERSION=<the_version> yarn build`
  - Build changelog `yarn changelog`
  - Commit dist files `git add dist CHANGELOG.md && git commit -m "[build $VERSION]"`
  - Publish a new version `npm version $VERSION --message "[release] $VERSION"
  - Push tags `git push origin refs/tags/v$VERSION && git push`
  - Publish to npm `npm publish`

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present André Bunse (aburai)
