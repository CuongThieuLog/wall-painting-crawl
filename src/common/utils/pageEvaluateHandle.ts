import { EvaluateFunc, HandleFor, Page } from 'puppeteer'

export const ehFactory =
  (page: Page) =>
  <
    Params extends unknown[],
    Func extends EvaluateFunc<Params> = EvaluateFunc<Params>
  >(
    pageFunction: Func | string,
    ...args: Params
  ): Promise<HandleFor<Awaited<ReturnType<Func>>>> =>
    page.evaluateHandle(pageFunction, ...args)
