import { InjectRedis } from '@nestjs-modules/ioredis'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import puppeteer, { Page } from 'puppeteer'
import { BrowserList, InitBrowserOption } from './interface'

@Injectable()
export class BrowserService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {}

  static BROWSER_LIST: BrowserList = {} as BrowserList

  private async onModuleInit() {
    await this.initAllBrowser()
  }

  initAllBrowser() {
    return Promise.all([
      this.initBrowser(),
      this.initBrowserSmall(),
      this.initBrowserWithoutLogin()
    ])
  }

  async initBrowser() {
    await this._initBrowserHandle('BROWSER')
  }
  async initBrowserSmall() {
    await this._initBrowserHandle('BROWSER_SMALL', { size: 'normal' })
  }
  async initBrowserWithoutLogin() {
    await this._initBrowserHandle('BROWSER_WITHOUT_LOGIN', { isLogin: false })
  }

  private async _initBrowserHandle(
    browserName: keyof typeof BrowserService.BROWSER_LIST,
    initBrowserOption?: InitBrowserOption
  ) {
    if (BrowserService.BROWSER_LIST[browserName])
      await BrowserService.BROWSER_LIST[browserName].close()
    BrowserService.BROWSER_LIST[browserName] = (
      await this._initBrowser(initBrowserOption)
    ).browser
  }

  private async _initBrowser(initBrowserOption?: InitBrowserOption) {
    if (!initBrowserOption) initBrowserOption = {}
    const { isLogin = true, size = 'big' } = initBrowserOption

    // Launch the browser
    const browser = await puppeteer.launch({
      headless: `new`,
      defaultViewport: null,
      ignoreHTTPSErrors: true,
      protocolTimeout: 30000,
      args: [
        `--window-size=1920,${size === 'normal' ? 1080 : 2300}`,
        '--disable-web-security',
        `--ignore-certificate-errors`,
        `--disable-notifications`,
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    })

    if (isLogin) {
      const [page] = await browser.pages()

      // handle twitter auth here
      const setAuthToken = await this.redis.get('twitter-auth-token')
      await page.goto('https://twitter.com/i/flow/login', {
        waitUntil: 'networkidle0'
      })
      if (!setAuthToken) await this._login(page)
      else {
        await page.evaluateHandle(
          (setAuthToken) => (document.cookie = setAuthToken),
          setAuthToken
        )
        await page.reload({ waitUntil: 'networkidle0' })
        const isLoginSuccess = await (
          await page.evaluateHandle(() =>
            document.cookie.includes('auth_token')
          )
        ).jsonValue()
        if (!isLoginSuccess) await this._login(page)
      }
      await page.authenticate({ username: 'username', password: 'password' })
    }

    return { browser }
  }

  private async _loginHandle(page: Page) {
    await page.waitForSelector('input[autocomplete="username"]')
    await page.waitForSelector('[role="button"]:not([data-testid])')

    // fill username
    await page.type(
      'input[autocomplete="username"]',
      this.configService.get('TWEET_USERNAME') || ''
    )
    await page.click('[role="button"]:not([data-testid])')
    await page.waitForSelector('input[autocomplete="current-password"]')

    // fill password
    await page.type(
      'input[autocomplete="current-password"]',
      this.configService.get('TWEET_PASSWORD') || ''
    )
    await page.waitForSelector(
      '[role="button"][data-testid="LoginForm_Login_Button"]'
    )
    await page.click('[role="button"][data-testid="LoginForm_Login_Button"]')
    await page.waitForSelector('[data-testid="tweet"]')
    return await page.cookies()
  }

  private async _login(page: Page) {
    const cookies = await this._loginHandle(page)
    const authTokenCookie = cookies.find(
      (cookie) => cookie.name === 'auth_token'
    )
    if (!authTokenCookie) return
    const setAuthToken = `${authTokenCookie.name}=${
      authTokenCookie.value
    };domain=${authTokenCookie.domain};path=${
      authTokenCookie.path
    };expires=${new Date(
      authTokenCookie.expires * 1000
    ).toUTCString()};SameSite=${authTokenCookie.sameSite}; Secure`
    await this.redis.setex(
      'twitter-auth-token',
      6 * 30 * 24 * 60 * 60,
      setAuthToken
    ) // 6 months
  }
}
