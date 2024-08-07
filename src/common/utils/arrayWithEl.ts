const mapElementFn = (Array.prototype as Array<Element>).map
const forEachElementFn = (Array.prototype as Array<Element>).forEach
const findElementFn = (Array.prototype as Array<Element>).find
const findIndexElementFn = (Array.prototype as Array<Element>).findIndex

export {
  mapElementFn as _mapElementFn,
  forEachElementFn as _forEachElementFn,
  findElementFn as _findElementFn,
  findIndexElementFn as _findIndexElementFn
}
