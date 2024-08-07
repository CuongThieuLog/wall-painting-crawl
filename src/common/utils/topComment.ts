import { ITweetBaseData } from 'src/models/scraper/interfaces'

export const getTopComment = (commentData: ITweetBaseData[]) => {
  if (!commentData[0]?.tweetUrl) commentData.shift()
  if (commentData.length === 0) return null
  let topCommentIndex = 0
  let topCommentValue =
    commentData[0].replies + commentData[0].retweets + commentData[0].likes
  for (let i = 1; i < commentData.length; i++) {
    const value =
      commentData[i].replies + commentData[i].retweets + commentData[i].likes
    if (value > topCommentValue) {
      topCommentIndex = i
      topCommentValue = value
    }
  }
  return commentData[topCommentIndex]
}
