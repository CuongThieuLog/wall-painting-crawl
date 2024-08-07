import { Body, Controller, Get, Post } from '@nestjs/common'
import { TwitterProfileDto, TwitterTargetDto } from './dto'
import { ScraperService } from './services'

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('list-tweet')
  listTweet() {
    return this.scraperService.listTweet()
  }

  @Get('list-reply')
  listReply() {
    return this.scraperService.listReply()
  }

  @Post('twitter')
  twitterScrap(@Body() twitterScrapDto: TwitterTargetDto) {
    return this.scraperService.tweetScrape(twitterScrapDto)
  }

  @Get('list-twitter-profile')
  listTwitterProfileScrape() {
    return this.scraperService.listTwitterProfileScrape()
  }

  @Post('twitter-profile')
  twitterProfileScrape(@Body() twitterProfileDto: TwitterProfileDto) {
    return this.scraperService.twitterProfileScrape(twitterProfileDto.username)
  }
}
