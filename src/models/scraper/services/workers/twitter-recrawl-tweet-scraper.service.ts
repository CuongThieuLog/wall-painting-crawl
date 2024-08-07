import { Injectable } from '@nestjs/common'
import { Page } from 'puppeteer'
import {
  ehFactory,
  pptrDefineFunction,
  _findElementFn,
  _getFirstDigit,
  _mapElementFn,
  _scrollToEnoughPost,
  _serializeFollowNum
} from 'src/common'
import { ITweetBaseData } from '../../interfaces'

// must be redefined utils because nestjs build: import cannot work with puppeteer
const getFirstDigit = _getFirstDigit
const scrollToEnoughPost = _scrollToEnoughPost
const mapElementFn = _mapElementFn
const findElementFn = _findElementFn
const serializeFollowNum = _serializeFollowNum

@Injectable()
export class TwitterRecrawlTweetScraperService {
  async scrapeListTweet(page: Page) {
    // define evaluateHandle util
    const eh = ehFactory(page)
    // define required functions
    await this._defineFunction(eh)

    // scroll for enough tweets (10 tweets)
    await eh(this._scrollToEnoughTweets, 10)

    // crawl data
    const data = await eh(this._scrapeListTweet)
    const tweets = await data.jsonValue()
    return tweets.filter((tweet) => tweet.tweetUrl)
  }

  async scrapeRecrawlTopComment(page: Page) {
    // define evaluateHandle util
    const eh = ehFactory(page)
    try {
      // define required functions
      await this._defineFunction(eh)
    } catch (error) {
      throw error
    }

    // crawl data
    const commentsJSHandle = await eh(this._scrapeListComment)
    const commentData = await commentsJSHandle.jsonValue()

    return commentData
  }

  private _scrapeListTweet() {
    const allPresentTweets = this._findAllPresentTweets()
    const data = mapElementFn.call<
      NodeListOf<Element>,
      [(tweet: Element) => any],
      ITweetBaseData[]
    >(allPresentTweets, (tweet) => {
      return {
        replies: this._getReplyNumber(tweet),
        retweets: this._getRetweetNumber(tweet),
        likes: this._getLikeNumber(tweet),
        views: this._getViewNumber(tweet)
      }
    })
    return data
  }

  private _scrapeListComment() {
    return this._scrapeListTweet().slice(1, 2)
  }

  private _scrapeDiscoverMoreElPosition() {
    const discoverMoreEls = document.querySelectorAll(
      '[aria-level="2"][role="heading"]'
    )
    // get discoverMore element has text content "Discover more"
    const discoverMoreEl = findElementFn.call(
      discoverMoreEls,
      (el) => el.textContent === 'Discover more'
    )
    if (!discoverMoreEl) return 9999
    return discoverMoreEl.getBoundingClientRect().y
  }

  private async _defineFunction(eh: ReturnType<typeof ehFactory>) {
    await Promise.all(
      [
        getFirstDigit,
        scrollToEnoughPost,
        serializeFollowNum,
        // cannot pass function because Array.prototype.xxx is native code
        'const mapElementFn = Array.prototype.map',
        'const findElementFn = Array.prototype.find',
        'const findIndexElementFn = Array.prototype.findIndex',
        this._findAllPresentTweets,
        this._getAllPresentTweetsLength,
        this._getReplyNumber,
        this._getRetweetNumber,
        this._getLikeNumber,
        this._getViewNumber,
        this._scrapeDiscoverMoreElPosition,
        this._scrapeListTweet,
        this._scrapeListComment
      ].map((fn) => eh(pptrDefineFunction(fn)))
    )
  }

  private _scrollToEnoughTweets(count: number) {
    return scrollToEnoughPost(() => this._getAllPresentTweetsLength() >= count)
  }

  private _findAllPresentTweets() {
    return document.querySelectorAll('[data-testid="tweet"]')
  }
  private _getAllPresentTweetsLength() {
    return this._findAllPresentTweets().length
  }

  private _getReplyNumber(tweet: Element) {
    const ariaLabelString =
      tweet
        .querySelector('[data-testid="reply"]')
        ?.getAttribute('aria-label') || ''
    return getFirstDigit(ariaLabelString)
  }
  private _getRetweetNumber(tweet: Element) {
    const ariaLabelString =
      tweet
        .querySelector('[data-testid="retweet"]')
        ?.getAttribute('aria-label') || ''
    return getFirstDigit(ariaLabelString)
  }
  private _getLikeNumber(tweet: Element) {
    const ariaLabelString =
      tweet.querySelector('[data-testid="like"]')?.getAttribute('aria-label') ||
      ''
    return getFirstDigit(ariaLabelString)
  }
  private _getViewNumber(tweet: Element) {
    const ariaLabelString =
      tweet.querySelector('div[role="group"]')?.getAttribute('aria-label') || ''
    const splitArray = ariaLabelString?.split(',')
    const view = splitArray?.[splitArray.length - 1]
    return getFirstDigit(view)
  }
}
