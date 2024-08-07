function scrollToEnoughPost(isEnoughPostFn: () => boolean) {
  return new Promise<boolean>((resolve) => {
    let times = 20
    const timer = setInterval(() => {
      window.scrollBy(0, 120)
      times--
      if (isEnoughPostFn() || times < 0) {
        clearInterval(timer)
        resolve(true)
      }
    }, 100)
  })
}
export { scrollToEnoughPost as _scrollToEnoughPost }
