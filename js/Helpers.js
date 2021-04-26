function getParentType (child = '') {
  return child === 'solutions'
    ? 'problem'
    : child === 'problems'
      ? 'product'
      : child === 'links'
        ? 'solution'
        : child === 'urls'
          ? 'link'
          : undefined
}

function getChildType (parent = '') {
  return parent === 'solutions'
    ? 'link'
    : parent === 'problems'
      ? 'solution'
      : undefined
}

function getParentChildType (content = {}) {
  if (content.problems) {
    return 'problem'
  } else if (content.solutions) {
    return 'solution'
  } else if (content.links) {
    return 'link'
  } else if (typeof content.url === 'string') {
    return 'url'
  } else return undefined
}

// https://stackoverflow.com/a/30106551 CC-BY-SA 4.0
function b64DecodeUnicode (str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
