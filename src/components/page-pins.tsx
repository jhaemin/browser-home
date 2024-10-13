import { useStore } from '@nanostores/react'
import { Pencil1Icon } from '@radix-ui/react-icons'
import { ContextMenu, Flex, Grid, Text } from '@radix-ui/themes'
import { arrayMoveImmutable } from 'array-move'
import clsx from 'clsx'
import { animate, spring } from 'motion'
import { useEffect, useRef } from 'react'
import { Flipped, Flipper } from 'react-flip-toolkit'
import { PinIcon } from '../assets/pin-icon'
import { HomeConst } from '../constants'
import { HomeUtil } from '../home-util'
import { $bookmarksMap, $editBookmark, $pagePins } from '../store'

/**
 * Touch icon is a relatively large icon for a website.
 */
type TouchIconTheme = {
  pathname: string
  file: string
}

/**
 * A map of hostname to touch icon theme
 */
const touchIconThemes: TouchIconTheme[] = [
  { pathname: 'sentry.io', file: 'sentry-touch-icon.png' },
  { pathname: 'drive.google.com', file: 'drive-touch-icon.png' },
  { pathname: 'calendar.google.com', file: 'calendar-touch-icon.png' },
  { pathname: 'mail.google.com', file: 'gmail-touch-icon.png' },
  { pathname: 'chatgpt.com', file: 'chatgpt-touch-icon.png' },
  { pathname: 'figma.com', file: 'figma-touch-icon.png' },
  { pathname: 'youtube.com', file: 'youtube-touch-icon.png' },
  { pathname: 'slack.com', file: 'slack-touch-icon.png' },
  { pathname: 'copilot.microsoft.com', file: 'copilot-touch-icon.png' },
]

export function PagePins() {
  const pagePins = useStore($pagePins)

  useEffect(() => {
    const homeContainer = document.getElementById('home-container')!

    /**
     * Intentionally update pins to trigger re-render and re-calculate the layout
     */
    const resizeObserver = new ResizeObserver(() => {
      $pagePins.set([...$pagePins.get()])
    })

    resizeObserver.observe(homeContainer)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  if (pagePins.length === 0) {
    return null
  }

  const pinItemWidth = 100
  /**
   * Maximum number of pins in a row. Maximum 10 pins in a row.
   */
  const maxPinsInRow = Math.min(
    Math.floor(
      ((document.getElementById('home-container')?.clientWidth ??
        window.innerWidth) -
        HomeConst.SPACE_5 * 2) /
        pinItemWidth
    ),
    10
  )
  const rows = Math.ceil(pagePins.length / maxPinsInRow)
  const balancedPinsInRow = Math.ceil(pagePins.length / rows)

  return (
    <Flipper
      flipKey={pagePins.map((id) => id)}
      spring={{
        stiffness: 200,
        damping: 25,
      }}
    >
      <Grid
        className="stagger page-pins blur-when-search"
        style={{
          gridTemplateColumns: `repeat(${balancedPinsInRow}, minmax(0, 1fr)`,
        }}
        p="5"
        align="start"
        justify="center"
        gapY="3"
      >
        {pagePins.map((pinId) => (
          <Flipped
            key={pinId}
            flipId={pinId}
            onAppear={(el) => {
              animate(
                el,
                {
                  opacity: [0, 1],
                  scale: [0.5, 1],
                  filter: ['blur(10px)', 'blur(0px)'],
                },
                { easing: spring({ damping: 24, stiffness: 240 }) }
              )
            }}
          >
            {/* Wrapper with another layer for react-flip-toolkit to animate */}
            <Flex>
              <PagePinItem pinId={pinId} />
            </Flex>
          </Flipped>
        ))}
      </Grid>
    </Flipper>
  )
}

function PagePinItem({ pinId }: { pinId: string }) {
  const ref = useRef<HTMLDivElement>(null!)
  const bookmark = useStore($bookmarksMap, { keys: [pinId] })[pinId]?.node

  if (!bookmark || !bookmark.url) {
    HomeUtil.removePagePin(pinId)
    return null
  }

  const hostname = new URL(bookmark.url).hostname

  /**
   * Find the touch icon theme for the hostname.
   * If not found, get favicon from the chrome.
   */
  const touchIcon =
    touchIconThemes.find((theme) => hostname.includes(theme.pathname))?.file ??
    chrome.runtime.getURL(`_favicon/?pageUrl=${bookmark.url}&size=32`)

  const isFavicon = touchIcon.startsWith('chrome')

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <Flex
            ref={ref}
            asChild
            className="page-pin-item"
            data-pin-id={pinId}
            direction="column"
            align="center"
            py="1"
            px="2"
            onMouseDown={(e) => {
              // Only left click
              if (e.button !== 0) return

              e.preventDefault()

              const startX = e.clientX
              const startY = e.clientY

              const rect = ref.current.getBoundingClientRect()
              let clone: HTMLElement | undefined

              /**
               * Whether the drag has been triggered.
               */
              let dragTriggered = false
              /**
               * All the page pin elements to temporarily attach mouseenter event.
               */
              let pagePinElms: HTMLElement[] = []

              function onMouseMove(e: MouseEvent) {
                const deltaX = e.clientX - startX
                const deltaY = e.clientY - startY

                // Trigger drag if moved more than 5px
                if (
                  dragTriggered === false &&
                  (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)
                ) {
                  dragTriggered = true

                  document.body.classList.add('dragging')

                  clone = ref.current.cloneNode(true) as HTMLElement
                  clone.style.position = 'fixed'
                  clone.style.zIndex = '9999'
                  clone.style.top = `${rect.top}px`
                  clone.style.left = `${rect.left}px`
                  clone.style.pointerEvents = 'none'
                  document.querySelector('.radix-themes')?.appendChild(clone)

                  // Hide the target pin element to only show the clone
                  ref.current.style.opacity = '0'

                  // Store all the page pin elements
                  pagePinElms = Array.from(
                    document.querySelectorAll('.page-pin-item')
                  )

                  // Attach mouseenter event to all page pin elements.
                  // Event listeners are removed when mouseup.
                  for (const elm of pagePinElms) {
                    elm.onmouseenter = async () => {
                      const targetId = elm.dataset.pinId

                      if (!targetId || targetId === pinId) return

                      const pagePins = $pagePins.get()
                      const moved = arrayMoveImmutable(
                        pagePins,
                        pagePins.indexOf(pinId),
                        pagePins.indexOf(targetId)
                      )

                      await chrome.storage.local.set({
                        [HomeConst.PAGE_PINS_KEY]: moved,
                      })
                    }
                  }
                }

                if (dragTriggered && clone) {
                  clone.style.transform = `translate(${deltaX}px, ${deltaY}px)`
                }
              }

              function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)

                document.body.classList.remove('dragging')

                // Reset the opacity the target pin element
                ref.current.style.opacity = '1'

                if (clone) {
                  clone.remove()
                }

                // Clear all the mouseenter events
                for (const elm of pagePinElms) {
                  elm.onmouseenter = null
                }

                // Emulate click if not dragged
                // TODO: Add loading indicator while opening the page
                if (!dragTriggered) {
                  e.preventDefault()

                  if (e.metaKey || e.ctrlKey) {
                    chrome.tabs.create({
                      url: bookmark?.url,
                    })
                  } else {
                    chrome.tabs.update({
                      url: bookmark?.url,
                    })
                  }
                }
              }

              document.addEventListener('mousemove', onMouseMove)
              document.addEventListener('mouseup', onMouseUp)
            }}
          >
            <a
              href={bookmark.url}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.click()
                }
              }}
              onClick={(e) => e.preventDefault()}
            >
              <Flex className="page-pin-icon-wrapper">
                <img
                  alt=""
                  className={clsx('page-pin-icon', {
                    'page-pin-icon--favicon': isFavicon,
                  })}
                  src={touchIcon}
                  width="60"
                  height="60"
                />
              </Flex>
              {bookmark.title && (
                <Text className="page-pin-title" size="1" mt="2">
                  {bookmark.title}
                </Text>
              )}
            </a>
          </Flex>
        </ContextMenu.Trigger>

        <ContextMenu.Content variant="soft">
          <ContextMenu.Item
            onClick={async () => {
              const pins = $pagePins.get()

              await chrome.storage.local.set({
                [HomeConst.PAGE_PINS_KEY]: pins.filter((id) => id !== pinId),
              })
            }}
          >
            <Flex width="100%" align="center" gap="5" justify="between">
              Unpin
              <PinIcon slashed />
            </Flex>
          </ContextMenu.Item>
          <ContextMenu.Item
            onClick={() => {
              $editBookmark.set(bookmark)
            }}
          >
            <Flex width="100%" align="center" gap="5" justify="between">
              Edit Page
              <Pencil1Icon />
            </Flex>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>
    </>
  )
}
