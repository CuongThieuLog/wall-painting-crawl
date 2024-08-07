import { Injectable } from '@nestjs/common'
import { Page } from 'puppeteer'
import {
  ehFactory,
  getTopComment,
  pptrDefineFunction,
  _findElementFn,
  _findIndexElementFn,
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
const findIndexElementFn = _findIndexElementFn
const serializeFollowNum = _serializeFollowNum

@Injectable()
export class TwitterTweetScraperService {
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

  async scrapeTopComment(page: Page) {
    // define evaluateHandle util
    const eh = ehFactory(page)
    try {
      // define required functions
      await this._defineFunction(eh)

      // scroll for enough comment (5 comments)
      await eh(this._scrollToEnoughTweets, 5)
    } catch (error) {
      throw error
    }

    // crawl data
    const commentsJSHandle = await eh(this._scrapeListComment)
    const commentData = await commentsJSHandle.jsonValue()

    const topComment = getTopComment(commentData)
    if (!topComment) throw new Error('No top comment found')
    return topComment
  }

  private _scrapeListTweet() {
    const allPresentTweets = this._findAllPresentTweets()
    const data = mapElementFn.call<
      NodeListOf<Element>,
      [(tweet: Element) => ITweetBaseData],
      ITweetBaseData[]
    >(allPresentTweets, (tweet) => {
      const tweet_url = this._getTweetUrl(tweet)
      const content = this._getContent(tweet)
      return {
        tweetUrl: tweet_url,
        tweetId: tweet_url.split('/').pop() || '',
        username: tweet_url.split('/')[3] || '',
        name: this._getName(tweet),
        avatar: this._getProfilePicture(tweet),
        replies: this._getReplyNumber(tweet),
        retweets: this._getRetweetNumber(tweet),
        likes: this._getLikeNumber(tweet),
        views: this._getViewNumber(tweet),
        postedTime: this._getPostedTime(tweet),
        content,
        hashtags: content.match(/#\w+/g) || [],
        images: this._getImages(tweet)
      }
    })
    return data
  }

  private _scrapeListComment() {
    const discoverMoreElPosition = this._scrapeDiscoverMoreElPosition()
    const allPresentTweets = this._findAllPresentTweets()
    const satisfiedIndex = findIndexElementFn.call(
      allPresentTweets,
      (tweet) => tweet.getBoundingClientRect().y > discoverMoreElPosition
    )
    return this._scrapeListTweet().slice(0, satisfiedIndex)
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
        this._getTweetUrl,
        this._getName,
        this._getProfilePicture,
        this._getReplyNumber,
        this._getRetweetNumber,
        this._getLikeNumber,
        this._getViewNumber,
        this._getPostedTime,
        this._getContent,
        this._getImages,
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
  private _getTweetUrl(tweet: Element) {
    const _url =
      tweet
        .querySelector('[data-testid="User-Name"] a[aria-label][dir]')
        ?.getAttribute('href') || ''
    if (_url) return `https://twitter.com${_url}`
    else return ''
  }
  private _getProfilePicture(tweet: Element) {
    return (
      tweet.querySelector('img[alt][draggable="true"]')?.getAttribute('src') ||
      ''
    )
  }

  private _getName(tweet: Element) {
    return (
      tweet.querySelector('[data-testid="User-Name"] > div span > span')
        ?.textContent || ''
    )
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
  private _getPostedTime(tweet: Element) {
    return (
      tweet
        .querySelector('a[aria-label][dir] time')
        ?.getAttribute('datetime') || ''
    )
  }
  private _getContent(tweet: Element) {
    return tweet.querySelector('[data-testid="tweetText"]')?.textContent || ''
  }
  private _getImages(tweet: Element) {
    const allTweetImageEls = tweet.querySelectorAll(
      '[data-testid="tweetPhoto"]'
    )
    return mapElementFn.call<
      NodeListOf<Element>,
      [(element: Element) => string],
      string[]
    >(
      allTweetImageEls,
      (imgEl) => imgEl.querySelector('img')?.getAttribute('src') || ''
    )
  }
}
