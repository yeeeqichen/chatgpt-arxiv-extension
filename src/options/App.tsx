import { Button, CssBaseline, GeistProvider, Radio, Text, Toggle, useToasts } from '@geist-ui/core'
import { Plus } from '@geist-ui/icons'
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'
import '../base.css'
import {
  defaultSiteConfigs,
  defaultSupportedURLs,
  getUserConfig,
  Language,
  SiteConfigs,
  Theme,
  TriggerMode,
  TRIGGER_MODE_TEXT,
  updateUserConfig,
} from '../config'
import logo from '../logo.png'
import { detectSystemColorScheme, getExtensionVersion } from '../utils'
import AddNewSiteConfigModal from './AddNewSiteConfigModal'
import ProviderSelect from './ProviderSelect'
import SiteCard from './SiteCard'

function OptionsPage(props: { theme: Theme; onThemeChange: (theme: Theme) => void }) {
  const [triggerMode, setTriggerMode] = useState<TriggerMode>(TriggerMode.Always)
  const [language, setLanguage] = useState<Language>(Language.Auto)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [supportedURLs, setSupportedURLs] = useState<string[]>(defaultSupportedURLs)
  const [siteConfigs, setSiteConfigs] = useState<SiteConfigs>(defaultSiteConfigs)
  const { setToast } = useToasts()

  useEffect(() => {
    getUserConfig().then((config) => {
      setTriggerMode(config.triggerMode)
      setLanguage(config.language)
      setSupportedURLs(config.supportedURLs)
      setSiteConfigs(config.siteConfigs)
    })
  }, [])

  const closeModalHandler = useCallback(() => {
    setModalVisible(false)
  }, [])

  const onTriggerModeChange = useCallback(
    (mode: TriggerMode) => {
      setTriggerMode(mode)
      updateUserConfig({ triggerMode: mode })
      setToast({ text: 'Changes saved', type: 'success' })
    },
    [setToast],
  )

  const onThemeChange = useCallback(
    (theme: Theme) => {
      updateUserConfig({ theme })
      props.onThemeChange(theme)
      setToast({ text: 'Changes saved', type: 'success' })
    },
    [props, setToast],
  )

  const onLanguageChange = useCallback(
    (language: Language) => {
      updateUserConfig({ language })
      setToast({ text: 'Changes saved', type: 'success' })
    },
    [setToast],
  )

  return (
    <div className="container mx-auto">
      <nav className="flex flex-row justify-between items-center mt-5 px-2">
        <div className="flex flex-row items-center gap-2">
          <img src={logo} className="w-10 h-10 rounded-lg" />
          <span className="font-semibold">ArixGPT(v{getExtensionVersion()})</span>
        </div>
        <div className="flex flex-row gap-3">
          <a
            href="https://github.com/hunkimForks/chatgpt-arxiv-extension/issues"
            target="_blank"
            rel="noreferrer"
          >
            Feedback
          </a>
          <a
            href="https://github.com/hunkimForks/chatgpt-arxiv-extension"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
        </div>
      </nav>
      <main className="w-[600px] mx-auto mt-14">
        <Text h2>Options</Text>
        <Text h3 className="mt-5">
          Site Config
        </Text>
        {supportedURLs &&
          supportedURLs.map((supportedURL, index) => {
            return (
              <div key={supportedURL} className="my-3">
                <SiteCard
                  prompt={siteConfigs[supportedURL].prompt}
                  URL={supportedURL}
                  bodyTag={siteConfigs[supportedURL].bodyTag}
                  displayTag={siteConfigs[supportedURL].displayTag}
                  onSave={(URLValue, promptValue, bodyTagValue, displayTagValue) => {
                    const updatedSupportedURLs: string[] = [...supportedURLs]
                    updatedSupportedURLs[index] = URLValue
                    const updatedSiteConfigs: SiteConfigs = JSON.parse(JSON.stringify(siteConfigs))
                    updatedSiteConfigs[URLValue] = {
                      prompt: promptValue,
                      bodyTag: bodyTagValue,
                      displayTag: displayTagValue,
                    }
                    return updateUserConfig({
                      supportedURLs: updatedSupportedURLs,
                      siteConfigs: updatedSiteConfigs,
                    })
                  }}
                  onDismiss={() => {
                    const updatedSupportedURLs: string[] = [...supportedURLs]
                    updatedSupportedURLs.splice(index, 1)
                    const updatedSiteConfigs: SiteConfigs = JSON.parse(JSON.stringify(siteConfigs))
                    delete updatedSiteConfigs[supportedURL]
                    setSupportedURLs(updatedSupportedURLs)
                    return updateUserConfig({
                      supportedURLs: updatedSupportedURLs,
                      siteConfigs: updatedSiteConfigs,
                    })
                  }}
                />
              </div>
            )
          })}

        <Button mt={1} type="secondary" width={'100%'} onClick={() => setModalVisible(true)}>
          <Plus size={16} className="mx-2" />
          Add Site Config
        </Button>

        <AddNewSiteConfigModal
          visible={modalVisible}
          onClose={closeModalHandler}
          supportedURLs={supportedURLs}
          onSave={(update) => {
            supportedURLs[supportedURLs.length] = update.site
            siteConfigs[update.site] = {
              prompt: update.prompt,
              bodyTag: update.bodyTag,
              displayTag: update.displayTag,
            }
            return updateUserConfig({
              supportedURLs: supportedURLs,
              siteConfigs: siteConfigs,
            })
          }}
        />

        <Text h3 className="mt-8">
          Trigger Mode
        </Text>

        <Radio.Group
          value={triggerMode}
          onChange={(val) => onTriggerModeChange(val as TriggerMode)}
        >
          {Object.entries(TRIGGER_MODE_TEXT).map(([value, texts]) => {
            return (
              <Radio key={value} value={value}>
                {texts.title}
                <Radio.Description>{texts.desc}</Radio.Description>
              </Radio>
            )
          })}
        </Radio.Group>
        <Text h3 className="mt-5">
          Theme
        </Text>
        <Radio.Group value={props.theme} onChange={(val) => onThemeChange(val as Theme)} useRow>
          {Object.entries(Theme).map(([k, v]) => {
            return (
              <Radio key={v} value={v}>
                {k}
              </Radio>
            )
          })}
        </Radio.Group>
        <Text h3 className="mt-5 mb-0">
          AI Provider
        </Text>
        <ProviderSelect />
        <Text h3 className="mt-8">
          Misc
        </Text>
        <div className="flex flex-row items-center gap-4">
          <Toggle initialChecked disabled />
          <Text b margin={0}>
            Auto delete conversations generated by search
          </Text>
        </div>
      </main>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState(Theme.Auto)

  const themeType = useMemo(() => {
    if (theme === Theme.Auto) {
      return detectSystemColorScheme()
    }
    return theme
  }, [theme])

  useEffect(() => {
    getUserConfig().then((config) => setTheme(config.theme))
  }, [])

  return (
    <GeistProvider themeType={themeType}>
      <CssBaseline />
      <OptionsPage theme={theme} onThemeChange={setTheme} />
    </GeistProvider>
  )
}

export default App
