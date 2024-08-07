function getFirstDigit(str: string) {
  const match = str?.match(/\d+/)
  return match ? +match[0] : 0
}
export { getFirstDigit as _getFirstDigit }
