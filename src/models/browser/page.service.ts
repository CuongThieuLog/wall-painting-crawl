import { Injectable } from '@nestjs/common'
import { Browser, Page } from 'puppeteer'
import { RESOURCE_TYPE_IGNORE } from 'src/common'
import { BrowserService } from './browser.service'

@Injectable()
export class PageService {
  async initBrowserPage(pageNum = 1) {
    return Promise.all(
      Array.from({ length: pageNum }).map(() =>
        this._initPage(BrowserService.BROWSER_LIST.BROWSER)
      )
    )
  }
  async initBrowserSmallPage(pageNum = 1) {
    return Promise.all(
      Array.from({ length: pageNum }).map(() =>
        this._initPage(BrowserService.BROWSER_LIST.BROWSER_SMALL)
      )
    )
  }

  async initBrowserWithoutLoginPage(pageNum = 1) {
    return Promise.all(
      Array.from({ length: pageNum }).map(() =>
        this._initPage(BrowserService.BROWSER_LIST.BROWSER_WITHOUT_LOGIN)
      )
    )
  }

  closePages(pages: Page): void
  closePages(pages: Page[]): void
  closePages(pages: Page | Page[]): void {
    if (pages instanceof Page) pages.close()
    else pages.forEach((page) => page.close())
  }

  private async _initPage(browser: Browser) {
    const page = await browser.newPage()
    await page.setRequestInterception(true)
    page.on('request', (request) => {
      if (RESOURCE_TYPE_IGNORE.indexOf(request.resourceType()) !== -1)
        request.abort()
      else request.continue()
    })
    return page
  }
}
