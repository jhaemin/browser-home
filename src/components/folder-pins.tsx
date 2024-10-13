import { useStore } from '@nanostores/react'
import { Box, Flex, Grid, Heading, Spinner } from '@radix-ui/themes'
import { arrayMoveImmutable } from 'array-move'
import clsx from 'clsx'
import { animate, spring } from 'motion'
import { useEffect, useRef } from 'react'
import { Flipped, Flipper } from 'react-flip-toolkit'
import { PinIcon } from '../assets/pin-icon'
import { HomeConst } from '../constants'
import { HomeUtil } from '../home-util'
import { $bookmarksMap, $folderPins } from '../store'
import { FolderColumn } from './folder-column'

export function FolderPins() {
  const pins = useStore($folderPins)

  useEffect(() => {
    const homeContainer = document.getElementById('home-container')!

    /**
     * Intentionally update pins to trigger re-render and re-calculate the layout
     */
    const resizeObserver = new ResizeObserver(() => {
      $folderPins.set([...$folderPins.get()])
    })

    resizeObserver.observe(homeContainer)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  if (pins.length === 0) {
    return null
  }

  // Folder column width + padding
  const columnWidth = HomeConst.FOLDER_COLUMN_WIDTH + HomeConst.SPACE_5

  // How many columns can fit in the window. Maximum 4 columns for better look.
  const maxPinsInRow = Math.min(
    Math.floor(
      ((document.getElementById('home-container')?.clientWidth ??
        window.innerWidth) -
        HomeConst.SPACE_5) /
        columnWidth
    ),
    4
  )
  // How many rows are needed to display all the pins
  const rows = Math.ceil(pins.length / maxPinsInRow)
  // How many pins should be in each row for balanced layout
  const balancedPinsInRow = Math.ceil(pins.length / rows)

  return (
    <Box p="5" className="folder-pins blur-when-search">
      <Flex direction="column" gap="5">
        <Flipper
          flipKey={pins.map((id) => id)}
          spring={{
            stiffness: 200,
            damping: 25,
          }}
        >
          <Grid
            className="stagger"
            columns="2"
            gap="5"
            style={{
              gridTemplateColumns: `repeat(${balancedPinsInRow}, minmax(0, 1fr))`,
              justifyItems: 'center',
            }}
          >
            {pins.map((pinId) => (
              <Flipped
                key={pinId}
                flipId={pinId}
                onStart={(el) => {
                  el.classList.add('flip-moving')
                }}
                onComplete={(el) => {
                  el.classList.remove('flip-moving')
                }}
                onAppear={(el) => {
                  animate(
                    el,
                    {
                      opacity: [0, 1],
                      scale: [0.2, 1],
                      filter: ['blur(10px)', 'blur(0px)'],
                    },
                    { easing: spring({ damping: 24, stiffness: 240 }) }
                  )
                }}
              >
                {/* Wrapper with another layer for react-flip-toolkit to animate */}
                <Flex>
                  <FolderPinItem pinId={pinId} />
                </Flex>
              </Flipped>
            ))}
          </Grid>
        </Flipper>
      </Flex>
    </Box>
  )
}

function FolderPinItem({ pinId }: { pinId: string }) {
  const ref = useRef<HTMLDivElement>(null!)
  const folder = useStore($bookmarksMap, { keys: [pinId] })[pinId]?.node

  if (!folder) {
    HomeUtil.removeFolderPin(pinId)
    return null
  }

  return (
    <Flex
      ref={ref}
      className={clsx('folder-pin-item')}
      data-pin-id={pinId}
      key={pinId}
      direction="column"
      align="start"
      justify="start"
      width="340px"
      height="100%"
    >
      <Flex
        position="relative"
        className="folder-pin-header"
        px="4"
        width="100%"
        height="50px"
        align="center"
        justify="between"
        gap="1"
        onMouseDown={(e) => {
          // Only left click
          if (e.button !== 0) return

          e.preventDefault()

          const startX = e.clientX
          const startY = e.clientY

          const rect = ref.current.getBoundingClientRect()
          let clone: HTMLElement | undefined

          let dragTriggered = false
          let folderPinElms: HTMLElement[] = []

          function onMouseMove(e: MouseEvent) {
            const deltaX = e.clientX - startX
            const deltaY = e.clientY - startY

            // Trigger drag if moved more than 5px
            if (
              dragTriggered === false &&
              (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)
            ) {
              dragTriggered = true

              document.body.classList.add('folder-pin-dragging')

              clone = ref.current.cloneNode(true) as HTMLElement
              clone.style.position = 'fixed'
              clone.style.zIndex = '9999'
              clone.style.top = `${rect.top}px`
              clone.style.left = `${rect.left}px`
              clone.style.width = `${rect.width}px`
              clone.style.height = `${rect.height}px`
              clone.style.pointerEvents = 'none'
              clone.style.transition = 'box-shadow 0.2s ease'
              document.querySelector('.radix-themes')?.appendChild(clone)

              // Apply box shadow after next context to apply transition
              setTimeout(() => {
                if (clone) {
                  clone.style.boxShadow = 'var(--shadow-5)'
                }
              }, 0)

              ref.current.style.opacity = '0'

              folderPinElms = Array.from(
                document.querySelectorAll('.folder-pin-item')
              )

              for (const elm of folderPinElms) {
                elm.onmouseenter = async () => {
                  const targetId = elm.dataset.pinId

                  if (!targetId || targetId === pinId) return

                  const folderPins = $folderPins.get()
                  const moved = arrayMoveImmutable(
                    folderPins,
                    folderPins.indexOf(pinId),
                    folderPins.indexOf(targetId)
                  )

                  await chrome.storage.local.set({
                    [HomeConst.FOLDER_PINS_KEY]: moved,
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

            document.body.classList.remove('folder-pin-dragging')

            ref.current.style.opacity = '1'

            if (clone) {
              clone.remove()
            }

            for (const elm of folderPinElms) {
              elm.onmouseenter = null
            }

            // Emulate click if not dragged
            if (!dragTriggered) {
              e.preventDefault()

              if (e.metaKey || e.ctrlKey) {
                chrome.tabs.create({
                  url: folder?.url,
                })
              } else {
                chrome.tabs.update({
                  url: folder?.url,
                })
              }
            }
          }

          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp)
        }}
      >
        <Heading
          size="3"
          ml="2"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {folder.title}
        </Heading>

        <Flex
          className="folder-pin pin-pinned"
          width="20px"
          height="20px"
          align="center"
          justify="center"
          onClick={async () => {
            const pins = $folderPins.get()

            await chrome.storage.local.set({
              [HomeConst.FOLDER_PINS_KEY]: pins.filter((id) => id !== pinId),
            })
          }}
        >
          <PinIcon pinned />
        </Flex>
      </Flex>
      <Flex height="340px">
        <FolderColumn folderId={pinId} forDisplay pt="2" />
      </Flex>
    </Flex>
  )
}
