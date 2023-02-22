import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme, UserConfig } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import './styles.scss'
import { findSupportedURL, getPossibleElementByQuerySelector } from './utils'

async function mount(question: string, promptSource: string, siteConfig: any) {
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'

  const userConfig = await getUserConfig()
  let theme: Theme
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container.classList.add('gpt-dark')
  } else {
    container.classList.add('gpt-light')
  }

  const siderbarContainer = getPossibleElementByQuerySelector([siteConfig.displayTag])
  if (siderbarContainer) {
    siderbarContainer.prepend(container)
  } else {
    container.classList.add('sidebar-free')
    console.log('buggy')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }

  render(
    <ChatGPTContainer
      question={question}
      promptSource={promptSource}
      triggerMode={userConfig.triggerMode || 'always'}
    />,
    container,
  )
}

/**
 * mount html elements when requestions triggered
 * @param question question string
 * @param index question index
 */
export async function requeryMount(question: string, index: number) {
  const container = document.querySelector<HTMLDivElement>('.question-container')
  let theme: Theme
  const questionItem = document.createElement('div')
  questionItem.className = `question-${index}`

  const userConfig = await getUserConfig()
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container?.classList.add('gpt-dark')
    questionItem.classList.add('gpt-dark')
  } else {
    container?.classList.add('gpt-light')
    questionItem.classList.add('gpt-light')
  }
  questionItem.innerText = `Q${index + 1} : ${question}`
  container?.appendChild(questionItem)
}

async function run() {
  const host: string = location.hostname
  const userConfig: UserConfig = await getUserConfig()
  const [siteURL, supportedSite]: [string, boolean] = findSupportedURL(userConfig.supportedURLs, host)
  if (!supportedSite) {
    console.debug('unsupported site')
    return
  }
  const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>([])
  console.log('Try to Mount ChatGPT on', siteURL)
  const siteConfig = userConfig.siteConfigs[siteURL]
  if (siteConfig.bodyTag) {
    const bodyElement = getPossibleElementByQuerySelector([siteConfig.bodyTag])
    console.debug('bodyElement', bodyElement)

    if (bodyElement && bodyElement.textContent) {
      const bodyInnerText = bodyElement.textContent.trim().replace(/\s+/g, ' ').substring(0, 1500)
      console.log('Body: ' + bodyInnerText)
      const question = siteConfig.prompt
      const promptSource = 'default'
      mount(question + bodyInnerText, promptSource, siteConfig)
    }
  }

  //const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>(siteConfig.inputQuery)
  //if (searchInput && searchInput.value) {
  //  console.debug('Mount ChatGPT on', siteName)
  //  const userConfig = await getUserConfig()
  //  const searchValueWithLanguageOption =
  //    userConfig.language === Language.Auto
  //      ? searchInput.value
  //      : `${searchInput.value}(in ${userConfig.language})`
  //  mount(searchValueWithLanguageOption, siteConfig)
}

run()

// if (siteConfig.watchRouteChange) {
//   siteConfig.watchRouteChange(run)
// }
