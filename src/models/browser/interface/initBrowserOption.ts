import { Browser } from 'puppeteer'

export interface InitBrowserOption {
  isLogin?: boolean
  size?: 'normal' | 'big'
}

export interface BrowserList {
  BROWSER: Browser
  BROWSER_SMALL: Browser
  BROWSER_WITHOUT_LOGIN: Browser
}
