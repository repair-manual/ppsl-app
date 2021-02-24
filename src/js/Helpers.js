function getParentType (child) {
  return child === 'solutions'
    ? 'problem'
    : child === 'problems'
      ? 'product'
      : child === 'links'
        ? 'solution'
        : undefined
}

function getChildType (parent) {
  return parent === 'solutions'
    ? 'links'
    : parent === 'problems'
      ? 'solutions'
      : undefined
}

// https://stackoverflow.com/a/30106551 CC-BY-SA 4.0
function b64DecodeUnicode (str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
