import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { AxiosModule } from '../axios/axios.module'
import { BrowserModule } from '../browser/browser.module'
import {
  ScraperProfileConsumer,
  ScraperReplyConsumer,
  ScraperTweetConsumer
} from './scraper.consumer'
import { ScraperController } from './scraper.controller'
import {
  ScraperService,
  TwitterProfileScraperService,
  TwitterTweetScraperService
} from './services'
import { TwitterRecrawlTweetScraperService } from './services/workers/twitter-recrawl-tweet-scraper.service'

@Module({
  imports: [
    AxiosModule,
    BrowserModule,
    BullModule.registerQueue({
      name: 'twitter-profile'
    }),
    BullModule.registerQueue({
      name: 'tweet'
    }),
    BullModule.registerQueue({
      name: 'reply'
    })
  ],
  controllers: [ScraperController],
  providers: [
    ScraperService,
    TwitterTweetScraperService,
    TwitterProfileScraperService,
    TwitterRecrawlTweetScraperService,
    ScraperProfileConsumer,
    ScraperTweetConsumer,
    ScraperReplyConsumer
  ],
  exports: [
    ScraperService,
    TwitterTweetScraperService,
    TwitterProfileScraperService,
    TwitterRecrawlTweetScraperService
  ]
})
export class ScraperModule {}
