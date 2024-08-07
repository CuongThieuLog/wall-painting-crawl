export interface ITweetBaseData {
  tweetUrl: string
  tweetId: string
  username: string
  avatar: string
  name: string
  replies: number
  retweets: number
  likes: number
  views: number
  postedTime: string
  content: string
  hashtags: string[]
  images: string[]
}

export interface IOwnerData {
  follower: string
  following: string
}

export type ITweetData = ITweetBaseData & {
  topComment: ITweetBaseData
  follower: string
  following: string
}

export interface ICreateTweetsData {
  target_id: number
  last_crawl_at: Date
  list_posts: ITweetBaseData[]
}

export interface ICreateProfileData {
  profile_id: number
  follower_count: number
  date: Date
}
