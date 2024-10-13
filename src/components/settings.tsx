import { DashboardIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Link,
  Separator,
} from '@radix-ui/themes'
import { atom, onMount } from 'nanostores'
import { HomeUtil } from '../home-util'

const $panelVisible = atom(false)

onMount($panelVisible, () => {
  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      $panelVisible.set(false)
    }
  }

  function onMouseDown(event: MouseEvent) {
    const panel = document.querySelector<HTMLElement>('.settings')!
    if (!panel.contains(event.target as Node)) {
      $panelVisible.set(false)
    }
  }

  document.addEventListener('keydown', onKeydown)
  document.addEventListener('mousedown', onMouseDown)
})

$panelVisible.listen((visible) => {
  const panel = document.querySelector<HTMLElement>('.settings-panel')!
  panel.classList.toggle('visible')
})

export function Settings() {
  return (
    <Flex className="settings" position="relative">
      <IconButton
        variant="ghost"
        onClick={() => {
          $panelVisible.set(!$panelVisible.get())
        }}
      >
        <DashboardIcon
          width="24px"
          height="24px"
          style={{
            opacity: 0.85,
          }}
        />
      </IconButton>

      <Box className="settings-panel">
        <Heading size="3" mb="2">
          Widgets
        </Heading>
        <Flex direction="column" gap="1">
          Coming soon
        </Flex>

        <Separator size="4" my="3" />

        <Flex direction="column" gap="1">
          <Link size="2" href="">
            <Flex align="center" gap="2">
              See more
              <ExternalLinkIcon />
            </Flex>
          </Link>

          <Link size="2" href="">
            <Flex align="center" gap="2">
              Support
              <ExternalLinkIcon />
            </Flex>
          </Link>
        </Flex>
      </Box>
    </Flex>
  )
}
