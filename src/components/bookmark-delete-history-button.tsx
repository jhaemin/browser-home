import { BookmarkDeleteHistory } from '@/lib/bookmark-delete-history'
import { useStore } from '@nanostores/react'
import { Cross1Icon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Separator,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { FolderIcon, HistoryIcon } from 'lucide-react'
import { atom } from 'nanostores'
import { createPortal } from 'react-dom'
import { HomeUtil } from '../home-util'
import { $bookmarkDeleteHistory } from '../store'

export const $bookmarkDeleteHistorySlideOverOpen = atom(false)
export const BOOKMARK_DELETE_HISTORY_SLIDE_OVER_WIDTH = 320

$bookmarkDeleteHistorySlideOverOpen.listen((open) => {
  const homeContainer = document.getElementById('home-container')

  if (!homeContainer) return

  if (open) {
    setTimeout(() => {
      homeContainer.style.width = `calc(100% - ${BOOKMARK_DELETE_HISTORY_SLIDE_OVER_WIDTH}px)`
      homeContainer.style.marginLeft = `${BOOKMARK_DELETE_HISTORY_SLIDE_OVER_WIDTH}px`
    }, 0)
  } else {
    homeContainer.style.width = '100%'
    homeContainer.style.marginLeft = '0'
  }
})

export function BookmarkDeleteHistoryButton() {
  return (
    <>
      <Flex className="speller">
        <Tooltip content="Deleted Bookmarks">
          <IconButton
            variant="ghost"
            color="gray"
            onClick={() => {
              $bookmarkDeleteHistorySlideOverOpen.set(
                !$bookmarkDeleteHistorySlideOverOpen.get()
              )
            }}
          >
            <HistoryIcon strokeWidth={1.6} width={24} height={24} />
          </IconButton>
        </Tooltip>
      </Flex>
      <SlideOver />
    </>
  )
}

function SlideOver() {
  const open = useStore($bookmarkDeleteHistorySlideOverOpen)
  const history = useStore($bookmarkDeleteHistory).toReversed()
  const element = document.getElementById('bookmark-delete-history-slide-over')

  if (!element) {
    throw new Error('Element not found')
  }

  return createPortal(
    <Flex
      className={clsx('bookmark-delete-history-slide-over', {
        'bookmark-delete-history-slide-over--open': open,
      })}
      width={`${BOOKMARK_DELETE_HISTORY_SLIDE_OVER_WIDTH}px`}
      p="5"
      pr="2"
    >
      <Flex
        className="bookmark-delete-history-slide-over-content"
        direction="column"
      >
        <Flex px="5" pt="4" mb="2" justify="between" align="center">
          <Heading size="4">Deleted Bookmarks</Heading>
          <IconButton
            variant="ghost"
            onClick={() => {
              $bookmarkDeleteHistorySlideOverOpen.set(false)
            }}
          >
            <Cross1Icon />
          </IconButton>
        </Flex>
        <Box px="5" mb="4">
          <Text size="2" color="gray">
            Drag and drop to restore bookmarks.
          </Text>
        </Box>
        <Separator size="4" />
        <ScrollArea>
          <Flex direction="column" gap="3" p="5" pt="4" height="100%">
            {history.length === 0 ? (
              <Flex align="center" justify="center" height="100%">
                <Text size="2" color="gray">
                  No Deleted Bookmarks
                </Text>
              </Flex>
            ) : (
              history.map((item) => {
                const isFolder = HomeUtil.checkIfFolder(item.bookmark)

                return (
                  <Card
                    key={item.id}
                    variant="classic"
                    onMouseDown={async (e) => {
                      // Only left click
                      if (e.button !== 0) return

                      const target = e.currentTarget as HTMLElement

                      const startX = e.clientX
                      const startY = e.clientY

                      const rect = target.getBoundingClientRect()
                      let clone: HTMLElement | undefined

                      /**
                       * Whether the drag has been triggered.
                       */
                      let dragTriggered = false
                      const draggingClass = 'dragging'

                      function onMouseMove(e: MouseEvent) {
                        const deltaX = e.clientX - startX
                        const deltaY = e.clientY - startY

                        // Trigger drag if moved more than 5px
                        if (
                          dragTriggered === false &&
                          (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)
                        ) {
                          dragTriggered = true

                          document.body.classList.add(draggingClass)

                          clone = target.cloneNode(true) as HTMLElement
                          clone.style.position = 'fixed'
                          clone.style.zIndex = '9999'
                          clone.style.width = `${rect.width}px`
                          clone.style.height = `${rect.height}px`
                          clone.style.top = `${rect.top}px`
                          clone.style.left = `${rect.left}px`
                          clone.style.opacity = '0.5'
                          clone.style.pointerEvents = 'none'

                          document.body.appendChild(clone)
                        }

                        if (dragTriggered && clone) {
                          clone.style.transform = `translate(${deltaX}px, ${deltaY}px)`
                        }
                      }

                      const onMouseUp = async (e: MouseEvent) => {
                        document.removeEventListener('mousemove', onMouseMove)
                        document.removeEventListener('mouseup', onMouseUp)

                        document.body.classList.remove(draggingClass)

                        if (clone) {
                          clone.remove()
                        }

                        if (dragTriggered) {
                          const dragOverTarget =
                            e.target instanceof HTMLElement &&
                            e.target.closest<HTMLElement>('.drag-over-target')

                          if (dragOverTarget) {
                            const parentId = dragOverTarget.dataset.parentId
                            const index = dragOverTarget.dataset.index
                            const folderId = dragOverTarget.dataset.folderId

                            // If dragged over a folder, move the bookmark to the folder
                            if (folderId) {
                              await HomeUtil.insertBookmarkRecursively(
                                item.bookmark,
                                folderId
                              )
                            }
                            // If dragged over between bookmarks, move the bookmark to the new position
                            else {
                              await HomeUtil.insertBookmarkRecursively(
                                item.bookmark,
                                parentId,
                                index ? Number.parseInt(index) : undefined
                              )
                            }
                          }
                        }
                        // Emulate click event if not dragged
                        else {
                          // TODO: Implement emulating click event
                        }
                      }

                      /**
                       * Cancel the drag if the escape key is pressed.
                       *
                       * Clear all the event listeners and remove the clone element.
                       */
                      const onKeyDown = (e: KeyboardEvent) => {
                        if (e.key === 'Escape' && dragTriggered) {
                          document.removeEventListener('mousemove', onMouseMove)
                          document.removeEventListener('mouseup', onMouseUp)

                          document.body.classList.remove(draggingClass)

                          if (clone) {
                            clone.remove()
                          }
                        }
                      }

                      document.addEventListener('mousemove', onMouseMove)
                      document.addEventListener('mouseup', onMouseUp)
                      document.addEventListener('keydown', onKeyDown)
                    }}
                  >
                    <Flex direction="column">
                      <Flex align="center" gap="2" mb="2">
                        {isFolder && <FolderIcon size={15} />}
                        <Text size="2" weight="bold">
                          {item.bookmark.title}
                        </Text>
                      </Flex>
                      <Details bookmark={item.bookmark} depth={0} />
                      <Flex mt="3" direction="column" gap="2" align="center">
                        <Separator size="4" />
                        <Text color="gray" size="1">
                          {dayjs(item.deletedAt).format('YYYY/MM/DD HH:mm')}
                        </Text>
                        <Button
                          color="red"
                          size="1"
                          variant="soft"
                          style={{ width: '100%' }}
                          onClick={() => {
                            BookmarkDeleteHistory.remove(item.id)
                          }}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                )
              })
            )}
          </Flex>
        </ScrollArea>
      </Flex>
    </Flex>,
    element
  )
}

function Details({
  bookmark,
  depth,
}: { bookmark: chrome.bookmarks.BookmarkTreeNode; depth: number }) {
  if (HomeUtil.checkIfFolder(bookmark)) {
    const children = bookmark.children ?? []

    return (
      <Flex direction="column">
        {depth > 0 && (
          <Flex align="center" gap="1">
            <FolderIcon size={12} />
            <Text size="1" weight="medium">
              {bookmark.title}
            </Text>
          </Flex>
        )}
        <Flex direction="column" pl={depth > 0 ? '2' : undefined}>
          {children.map((child) => (
            <Details key={child.id} bookmark={child} depth={depth + 1} />
          ))}
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex direction="column">
      {depth > 0 && (
        <Text size="1" weight="medium">
          {bookmark.title}
        </Text>
      )}
      <Text
        size="1"
        color="gray"
        // Allow text selection
        style={{ userSelect: 'text' }}
        // Prevent the drag event from bubbling up to the parent element
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
      >
        {bookmark.url}
      </Text>
    </Flex>
  )
}
