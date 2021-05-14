const _emptyData = {
  products: [],
  problems: [],
  solutions: [],
  links: []
}

class GC {
  constructor (settings, data, prData) {
    this.octokit = {}
    this.githubUser = null

    this.settings = settings

    this.offline = null

    this.prData = prData

    this.editedData = data
    this.data = JSON.parse(JSON.stringify(_emptyData))
  }
}

class Cookies {
  constructor () {
    this.rawCookies = document.cookie
    this.cookies = new Map()

    this.parseCookies()
  }

  getCookie (cname) {
    return this.cookies.get(cname)
  }

  setCookie (cname, cvalue) {
    const today = new Date()
    const nextMonth = today.setMonth(today.getMonth() + 1)

    document.cookie = `${cname}=${JSON.stringify(cvalue)};expires=${new Date(nextMonth).toUTCString()};path=/;samesite=strict;`

    this.parseCookies()
  }

  parseCookies () {
    const cookies = this.rawCookies.split('; ').filter(string => string.length)

    for (let index = 0; index < cookies.length; index++) {
      const cookieStringArr = cookies[index].split('=')
      const cookieName = cookieStringArr[0].trim()
      const cookieValue = cookieStringArr[1].trim()

      this.cookies.set(cookieName, JSON.parse(cookieValue))
    }
  }
}

function loadEditedData () {
  let dataLocalStorage = window.localStorage.getItem('editedData')

  // If there is no data in storage, define one default empty data object.
  if (dataLocalStorage === null) {
    const defaultData = JSON.stringify(_emptyData)
    window.localStorage.setItem('editedData', defaultData)
    dataLocalStorage = defaultData
  }

  try {
    const json = JSON.parse(dataLocalStorage)

    return json
  } catch (error) {
    console.error(error)
    return JSON.parse(JSON.stringify(_emptyData))
  }
}

const _emptyPRData = []

function loadPRData () {
  let prDataLocalStorage = window.localStorage.getItem('prData')

  // If there is no data in storage, define one default empty data object.
  if (prDataLocalStorage === null) {
    const defaultPRData = JSON.stringify(_emptyPRData)
    window.localStorage.setItem('prData', defaultPRData)
    prDataLocalStorage = defaultPRData
  }

  try {
    const json = JSON.parse(prDataLocalStorage)

    return json
  } catch (error) {
    console.error(error)
    return JSON.parse(JSON.stringify([]))
  }
}

self.saveDataToStorage = (type, data) => {
  window.localStorage.setItem(type, JSON.stringify(data))
}

const _defaultSettings = {
  repo: {
    owner: 'repair-manual',
    name: 'ppsl-data'
  },
  commentsRepo: {
    owner: 'repair-manual',
    name: 'ppsl-discussion'
  },
  wikiURL: 'https://repair.wiki/w/'
}

function loadSettings () {
  let settingsLocalStorage = window.localStorage.getItem('settings')

  // If there is no settings in storage, define the default settings object.
  if (settingsLocalStorage === null) {
    const defaultSettings = JSON.stringify(_defaultSettings)
    window.localStorage.setItem('settings', defaultSettings)
    settingsLocalStorage = defaultSettings
  }

  try {
    const json = JSON.parse(settingsLocalStorage)

    return json
  } catch (error) {
    console.error(error)
    return _defaultSettings
  }
}

self.savePersonalAccessToken = (token) => {
  const cookies = new Cookies()

  cookies.setCookie('pat', encodeURIComponent(btoa(token)))
}

self.getPersonalAccessToken = () => {
  const cookies = new Cookies()

  const token = cookies.getCookie('pat')

  if (token) {
    return atob(decodeURIComponent(token))
  }
}

self.GlobalContext = new GC(loadSettings(), loadEditedData(), loadPRData())
