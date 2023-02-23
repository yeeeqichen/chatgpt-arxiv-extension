import { Button, Card, Divider, Grid, Text, Textarea, useToasts } from '@geist-ui/core'
import Trash2 from '@geist-ui/icons/trash2'
import { useCallback, useState } from 'preact/hooks'

function SiteCard(props: {
  URL: string
  prompt: string
  bodyTag: string
  displayTag: string
  onSave: (
    newURL: string,
    newPrompt: string,
    newBodyTag: string,
    newDisplayTag: string,
  ) => Promise<void>
  onDismiss?: () => Promise<void>
}) {
  const { URL, prompt, bodyTag, displayTag, onSave, onDismiss } = props
  const [promptValue, setPromptValue] = useState<string>(prompt)
  const [URLValue, setURLValue] = useState<string>(URL)
  const [bodyTagValue, setBodyTagValue] = useState<string>(bodyTag)
  const [displayTagValue, setDisplayTagValue] = useState<string>(displayTag)
  const { setToast } = useToasts()

  const onClickSave = useCallback(() => {
    setURLValue(URLValue)
    setPromptValue(promptValue)
    setBodyTagValue(bodyTagValue)
    setDisplayTagValue(displayTagValue)
    onSave(URLValue, promptValue, bodyTagValue, displayTagValue)
      .then(() => {
        setToast({ text: 'Site config changes saved', type: 'success' })
      })
      .catch(() => {
        setToast({ text: 'Failed to save site config', type: 'error' })
      })
  }, [onSave, setToast])

  return (
    <Card width="100%">
      <Card.Content>
        <Grid.Container gap={2} justify="center" alignItems="center" direction="column">
          <Grid xs>
            <Text b my={0}>
              Site URL:
              <Textarea
                value={URLValue}
                placeholder="Type site URL here"
                onChange={(event) => setURLValue(event.target.value)}
              >
                {URLValue}
              </Textarea>
            </Text>
          </Grid>
          <Grid xs>
            <Text b my={0}>
              Body Tag:
              <Textarea
                value={bodyTagValue}
                placeholder="Type body tag here"
                onChange={(event) => setBodyTagValue(event.target.value)}
              >
                {bodyTagValue}
              </Textarea>
            </Text>
          </Grid>
          <Grid xs>
            <Text b my={0}>
              Diaplay Tag:
              <Textarea
                value={displayTagValue}
                placeholder="Type display tag here"
                onChange={(event) => setDisplayTagValue(event.target.value)}
              >
                {displayTagValue}
              </Textarea>
            </Text>
          </Grid>
          {onDismiss && (
            <Grid xs={2} justify="center" alignItems="center">
              <Button
                style={{ border: 0 }}
                iconRight={<Trash2 size={18} />}
                auto
                px={0.6}
                onClick={() =>
                  onDismiss()
                    .then(() => {
                      setToast({ text: 'Site config removed', type: 'success' })
                    })
                    .catch(() => {
                      setToast({ text: 'Failed to remove site config', type: 'error' })
                    })
                }
              />
            </Grid>
          )}
        </Grid.Container>
      </Card.Content>

      <Divider h="1px" my={0} />

      <Card.Content>
        <Textarea
          value={promptValue}
          width="100%"
          height="10em"
          placeholder="Type prompt here"
          onChange={(event) => setPromptValue(event.target.value)}
        >
          {promptValue}
        </Textarea>
      </Card.Content>
      <Card.Footer>
        <Button width="100%" type="secondary" ghost onClick={() => onClickSave()} className="mt-3">
          Save Site Config
        </Button>
      </Card.Footer>
    </Card>
  )
}

export default SiteCard
