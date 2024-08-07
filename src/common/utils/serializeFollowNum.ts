const serializeFollowNum = (str: string | null | undefined) => {
  const UnitMultiplier = {
    k: 1000,
    m: 1000000,
    b: 1000000000
  }
  if (!str) return 0
  const numStr = str.split(' ')[0].replace(/,/g, '')
  let unit = numStr.slice(-1).toLowerCase()
  let num = Number(numStr.slice(0, -1))
  if (!isNaN(Number(unit))) {
    unit = ''
    num = Number(numStr)
  }
  num = num * (UnitMultiplier[unit] || 1)
  return num
}

export { serializeFollowNum as _serializeFollowNum }
