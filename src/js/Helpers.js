function getParentType (child = '') {
  const value = child === 'solutions'
    ? 'problem'
    : child === 'problems'
      ? 'product'
      : child === 'links'
        ? 'solution'
        : child === 'urls'
          ? 'link'
          : undefined

  if (value) {
    return { singular: value, plural: value + 's' }
  }
  // Returns undefined otherwise
}

function getChildType (parent = '') {
  const value = parent === 'solutions'
    ? 'link'
    : parent === 'problems'
      ? 'solution'
      : undefined

  if (value) {
    return { singular: value, plural: value + 's' }
  }
  // Returns undefined otherwise
}

function getParentChildType (content = {}) {
  let value
  if (content.problems) {
    value = 'problem'
  } else if (content.solutions) {
    value = 'solution'
  } else if (content.links) {
    value = 'link'
  } else if (typeof content.url === 'string') {
    value = 'url'
  }

  if (value) {
    return { singular: value, plural: value + 's' }
  }
  // Returns undefined otherwise
}

// https://stackoverflow.com/a/30106551 CC-BY-SA 4.0
function b64DecodeUnicode (str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
