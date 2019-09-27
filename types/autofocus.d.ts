import Vue, { PluginFunction } from 'vue'

export declare class VueAutofocus {
  constructor(options?: AutofocusOptions)

  app: Vue

  static install: PluginFunction<never>
}

export interface AutofocusOptions {
  // routes?: RouteConfig[]
  // mode?: RouterMode
  // fallback?: boolean
  // base?: string
  // linkActiveClass?: string
  // linkExactActiveClass?: string
  // parseQuery?: (query: string) => Object
  // stringifyQuery?: (query: Object) => string
  // scrollBehavior?: (
  //   to: Route,
  //   from: Route,
  //   savedPosition: Position | void
  // ) => PositionResult | Promise<PositionResult> | undefined | null
}
