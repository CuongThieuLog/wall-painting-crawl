import { Process, Processor } from '@nestjs/bull'
import { ConfigService } from '@nestjs/config'
import { Job } from 'bull'
import { AxiosService } from '../axios/axios.service'

@Processor('twitter-profile')
export class ScraperProfileConsumer {
  constructor(
    private configService: ConfigService,
    private readonly axiosService: AxiosService
  ) {}
  @Process()
  async twitterProfile(job: Job) {
    try {
      await this.axiosService.axiosRef.put(
        this.configService.get('DOMAIN_API') + '/profiles/update-by-username',
        job.data.info
      )
      console.log('call api save info profile success')
    } catch (error) {
      throw error
    }
  }
}

@Processor('tweet')
export class ScraperTweetConsumer {
  constructor(
    private configService: ConfigService,
    private readonly axiosService: AxiosService
  ) {}
  @Process()
  async tweet(job: Job) {
    try {
      await this.axiosService.axiosRef.post(
        this.configService.get('DOMAIN_API') + '/tweets/save',
        job.data
      )
      console.log('call api save tweet success')
    } catch (error) {
      throw error
    }
  }
}

@Processor('reply')
export class ScraperReplyConsumer {
  constructor(
    private configService: ConfigService,
    private readonly axiosService: AxiosService
  ) {}
  @Process()
  async reply(job: Job) {
    try {
      await this.axiosService.axiosRef.post(
        this.configService.get('DOMAIN_API') + '/replies/save',
        job.data
      )
      console.log('call api reply tweet success')
    } catch (error) {
      throw error
    }
  }
}
