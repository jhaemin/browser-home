import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Tooltip,
} from '@radix-ui/themes'
import { ArrowUpDownIcon, SparklesIcon } from 'lucide-react'
import { atom, onMount } from 'nanostores'

const $panelVisible = atom(false)

onMount($panelVisible, () => {
  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      $panelVisible.set(false)
    }
  }

  function onMouseDown(event: MouseEvent) {
    const panel = document.querySelector<HTMLElement>('.cleanup')!
    if (!panel.contains(event.target as Node)) {
      $panelVisible.set(false)
    }
  }

  document.addEventListener('keydown', onKeydown)
  document.addEventListener('mousedown', onMouseDown)
})

$panelVisible.listen((visible) => {
  const panel = document.querySelector<HTMLElement>('.cleanup-panel')!
  panel.classList.toggle('visible')
})

export function Cleanup() {
  return (
    <Flex className="cleanup" position="relative">
      <Tooltip content="Cleanup">
        <IconButton
          variant="ghost"
          color="yellow"
          onClick={() => {
            $panelVisible.set(!$panelVisible.get())
          }}
        >
          <SparklesIcon
            strokeWidth={1.6}
            width="24px"
            height="24px"
            style={{
              opacity: 0.85,
            }}
          />
        </IconButton>
      </Tooltip>

      <Box className="cleanup-panel">
        <Heading size="3" mb="3" style={{ lineHeight: 1 }}>
          Cleanup
        </Heading>
        <Flex direction="column" gap="2">
          <Flex>
            <Button variant="ghost">
              <Flex align="center" justify="between" gap="4" minWidth="120px">
                현재 창 탭 정렬
                <ArrowUpDownIcon size="15px" strokeWidth="1.7" />
              </Flex>
            </Button>
          </Flex>
          <Flex>
            <Button variant="ghost">
              <Flex align="center" justify="between" gap="4" minWidth="120px">
                모든 창 탭 정렬
                <ArrowUpDownIcon size="15px" strokeWidth="1.6" />
              </Flex>
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  )
}
