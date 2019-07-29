// ==UserScript==
// @name     Add language filter In Google search for each language defined in google search settings
// @version  1
// @grant    none
// ==/UserScript==
(function() {
  function addNewLangFilters() {
    let langItems = document.querySelectorAll('ul.hdtbU')[0].querySelectorAll('.hdtbItm')

    const primaryLang = langItems[1].querySelector('a') ? langItems[1] : langItems[0]

    let langList = Cookie.remember('google_search_langs', () => {

      const langKeys = primaryLang.id
        .replace(/lr_/g, '')
        .replace(/1/g, '')
        .split('|')

      const langTitles = primaryLang.textContent
        .replace('Search', '')
        .replace('pages', '')
        .split('and')
        .map(x => `Search ${x.trim()} pages`)

    if (langKeys.length !== langTitles.length) {
      return null
    }
    return langKeys
      .map((x, i) => [x, langTitles[i]])
  .reverse()
  })

    if (!langList) {
      return
    }

    // filter already selected language
    const lr = new URLSearchParams(document.location.href).get('lr')
    langList = langList.filter(ln => ln[0] !== lr)

    for (const [code, name] of langList) {
      const newLang = primaryLang.cloneNode(true)
      const newLink = newLang.querySelector('a')
      newLink.innerHTML = name
      const url = new URL(newLink.href)
      const qs = new URLSearchParams(url.search)
      qs.set('lr', code)
      url.search = qs.toString()
      newLink.href = url.href
      langItems[1].after(newLang)
    }
  }

  setTimeout(addNewLangFilters, 1000)
})()

class Cookie {
  static get(name) {
    const value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)')
    return value ? JSON.parse(value[2]) : null
  }

  static set(name, value, days = 30) {
    const d = new Date
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days)
    document.cookie = name + '=' + JSON.stringify(value) + ';path=/;expires=' + d.toUTCString()
    return value
  }

  static delete(name) {
    Cookie.set(name, '', -1)
  }

  static remember(name, fn, days = 30) {
    return Cookie.get(name) || Cookie.set(name, fn(), days)
  }
}