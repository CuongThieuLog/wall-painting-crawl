import { Module } from '@nestjs/common'
import { BrowserService } from './browser.service'
import { PageService } from './page.service'

@Module({
  imports: [],
  providers: [BrowserService, PageService],
  exports: [BrowserService, PageService]
})
export class BrowserModule {}
