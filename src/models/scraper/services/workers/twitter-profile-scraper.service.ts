import { Injectable } from '@nestjs/common'
import { Page } from 'puppeteer'
import {
  ehFactory,
  pptrDefineFunction,
  _forEachElementFn,
  _serializeFollowNum
} from 'src/common'

// must be redefined utils because nestjs build: import cannot work with puppeteer
const forEachElementFn = _forEachElementFn
const serializeFollowNum = _serializeFollowNum

@Injectable()
export class TwitterProfileScraperService {
  private async defineFunction(eh: ReturnType<typeof ehFactory>) {
    await Promise.all(
      [
        serializeFollowNum,
        // cannot pass function because Array.prototype.map is native code
        'const forEachElementFn = Array.prototype.forEach',
        this.getProfileElement,
        this.getProfileName,
        this.getUserDescription,
        this.getUserLocation,
        this.getUserJoinedDate,
        this.getFollowNumber,
        this.getProfilePicture
      ].map((fn) => eh(pptrDefineFunction(fn)))
    )
  }

  getProfileElement() {
    return document.querySelector('[data-testid="UserName"]')?.parentElement
  }

  getProfileName(profile: Element): { name: string; username: string } {
    const names: string[] = []
    const usernameEl = profile
      .querySelector('[data-testid="UserName"]')
      ?.querySelectorAll('span')
    if (!usernameEl) return { name: '', username: '' }
    forEachElementFn.call(usernameEl, (el) => {
      const innerHTML = el.innerHTML
      if (!innerHTML.startsWith('<') && innerHTML) names.push(el.innerHTML)
    })
    return { name: names[0], username: names[1]?.replace('@', '') }
  }

  getProfilePicture(profile: Element) {
    const profilePictureURL = profile
      .querySelector('[data-testid*=UserAvatar-Container]')
      ?.querySelector('img')
      ?.getAttribute('src')
    if (!profilePictureURL) return ''
    return profilePictureURL
  }

  getUserDescription(profile: Element) {
    const description = profile.querySelector(
      '[data-testid=UserDescription]'
    )?.textContent
    return description || ''
  }

  getUserLocation(profile: Element) {
    const location = profile.querySelector(
      '[data-testid=UserLocation]'
    )?.textContent
    return location || ''
  }
  getUserJoinedDate(profile: Element) {
    const joinedDate = profile.querySelector(
      '[data-testid=UserJoinDate]'
    )?.textContent
    return joinedDate || ''
  }

  getFollowNumber(profile: Element) {
    const followingEl = profile.querySelector(
      'a[href*="/following"]'
    )?.textContent
    const followerEl = profile.querySelector(
      'a[href*="/verified_followers"]'
    )?.textContent
    return {
      follower: followerEl,
      following: followingEl
    }
  }

  scrapeData() {
    const profileElement = this.getProfileElement()
    if (!profileElement) return null

    return {
      ...this.getProfileName(profileElement),
      avatar: this.getProfilePicture(profileElement),
      description: this.getUserDescription(profileElement),
      location: this.getUserLocation(profileElement),
      joinDate: this.getUserJoinedDate(profileElement),
      ...this.getFollowNumber(profileElement)
    }
  }

  async scrape(page: Page) {
    // define evaluateHandle util
    const eh = ehFactory(page)
    // define required functions
    await this.defineFunction(eh)

    // crawl data
    const data = await eh(this.scrapeData)
    return await data.jsonValue()
  }
}
