document.addEventListener('DOMContentLoaded', (_) => {

  const LANG = "ja"
  const LANG_safari = "ja-JP"

  /** @type {HTMLButtonElement} */
  const readAll = document.getElementById('read-all')

  /** @type {HTMLTextAreaElement} */
  const log = document.getElementById('log')

  const SS = window.speechSynthesis

  /** @type {HTMLSelectElement} */
  const voiceSelect = document.getElementById('voices')

  /** @type {SpeechSynthesisVoice[]} */
  let voices = []

  function isSafari() {
    return window.navigator.userAgent.toLowerCase().indexOf("safari") >= 0
  }

  function clearVoices() {
    voices = []
    for (const opt of voiceSelect.options) {
      opt.remove()
    }
  }

  function populateVoices() {
    clearVoices()

    if (isSafari()) {
      voices = SS.getVoices(LANG_safari)
    } else {
      voices = SS.getVoices()
    }
    console.log(`Enumerate voices... ${voices.length}`)
    let ix = 0
    for (const voice of voices) {
      const source = voice.localService ? 'on-device' : 'internet'
      console.log(`voices[${ix}] name:[${voice.name}] lang:[${voice.lang}] source:[${source}] default:${voice.default} is-ja:${voice.lang.startsWith(LANG)}`)
      ix++
      if (voice.lang.startsWith(LANG) !== true) continue

      console.log(`new voice (${voice.name})...`)
      const opt = document.createElement('option')
      opt.textContent = voice.name
      voiceSelect.appendChild(opt)
    }
  }

  /**
   * Read text by speech synthesis
   * @param {string} text 
   * @returns {void}
   */
  function readText(text) {
    console.log(`readText [${text}]`)
    if (text == null || text.length < 1) return

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = LANG_safari

    // Safari seems to inhibit to set these properties
    if (isSafari() !== true) {
      utter.pitch = 1
      utter.rate = 1
      if (voices.length > 0 && voiceSelect.selectedIndex < voices.length) {
        utter.voice = voices[voiceSelect.selectedIndex]
        console.log(`set voice as ${utter.voice.name}`)
      } else if (voices.length > 0) {
        utter.voice = voices[0]
        console.log(`set default-voice as ${utter.voice.name}`)
      }
    }

    utter.addEventListener('end', (_) => {
      setSpeakingState(false)
    })

    setSpeakingState(true)
    window.speechSynthesis.speak(utter)
  }

  /**
   * 
   * @param {HTMLElement} el 
   * @param {string} className 
   */
  function setClass(el, setClassName, removeClassName) {
    if (el.classList.contains(removeClassName)) {
      el.classList.remove(removeClassName)
    }
    if (el.classList.contains(setClassName) !== true) {
      el.classList.add(setClassName)
    }
  }

  /**
   * @param {boolean} isSpeaking 
   * @returns {void}
   */
  function setSpeakingState(isSpeaking) {
    if (isSpeaking === true) {
      setClass(log, 'speaking-now', 'not-speaking')
    } else if (isSpeaking === false) {
      setClass(log, 'not-speaking', 'speaking-now')
    }
  }

  // ========== ========== Event handler ========== ==========

  readAll.addEventListener('click', (_) => {
    const text = log.value
    readText(text)
  })

  // for chrome...
  SS.onvoiceschanged = (_) => {
    populateVoices()
  }

  // ========== ========== Procedures ========== ==========

  setSpeakingState(false)
  populateVoices()
  log.focus()
  console.log('prepared')
})
