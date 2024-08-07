import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf
} from 'class-validator'

export enum TwitterTargetType {
  URL = 'URL',
  KEYWORDS = 'KEYWORDS',
  HASHTAGS = 'HASHTAGS'
}

export class TwitterTargetDto {
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  id: string

  @IsEnum(TwitterTargetType)
  @Expose()
  type: TwitterTargetType

  @IsArray()
  @IsString({ each: true })
  @ValidateIf((o) => o.type === TwitterTargetType.URL)
  // @StartsWith('https://twitter.com', { each: true })
  @Expose()
  url: string[]

  @IsArray()
  @IsString({ each: true })
  @ValidateIf((o) => o.type === TwitterTargetType.KEYWORDS)
  @Expose()
  keywords: string[]

  @IsArray()
  @IsString({ each: true })
  @ValidateIf((o) => o.type === TwitterTargetType.HASHTAGS)
  @Expose()
  hashtags: string[]
}

export class TwitterProfileDto {
  @IsNumber()
  @Expose()
  id: number

  @IsString()
  @Expose()
  username: string

  @IsDate()
  @Type(() => Date)
  @Expose()
  date: Date
}
