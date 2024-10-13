import { useStore } from '@nanostores/react'
import {
  ClipboardIcon,
  Pencil1Icon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons'
import { ContextMenu, Flex, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { type ReactNode, useRef } from 'react'
import { FolderIcon } from '../assets/folder-icon'
import { PinIcon } from '../assets/pin-icon'
import { HomeConst } from '../constants'
import { HomeUtil } from '../home-util'
import {
  $bookmarkDialogMode,
  $bookmarksMap,
  $breadcrumbs,
  $editBookmark,
  $pinsMap,
} from '../store'

export function BookmarkNode({ bookmarkId }: { bookmarkId: string }) {
  const ref = useRef<HTMLDivElement>(null!)
  const pinned = useStore($pinsMap, { keys: [bookmarkId] })[bookmarkId]
  const bookmarkMapData = useStore($bookmarksMap, { keys: [bookmarkId] })[
    bookmarkId
  ]
  const bookmark = bookmarkMapData?.node

  /**
   * Get the parent folder of the bookmark.
   */
  const parentFolder = useStore($bookmarksMap, {
    keys: [bookmark?.parentId ?? ''],
  })[bookmark?.parentId ?? '']?.node

  const isFolder = bookmark ? HomeUtil.checkIfFolder(bookmark) : false
  const isPage = !isFolder
  const breadcrumbs = useStore($breadcrumbs)
  const nextBreadcrumb = parentFolder
    ? breadcrumbs[breadcrumbs.indexOf(parentFolder.id) + 1]
    : undefined

  /**
   * If the folder's parent doesn't exist, the bookmark is a root bookmark.
   */
  const isRoot = parentFolder?.parentId === undefined

  const canDelete = !isRoot

  if (!bookmark || !parentFolder) return null

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            ref={ref}
            className={clsx('bookmark-node', {
              folder: isFolder,
              page: isPage,
              selected: nextBreadcrumb === bookmark.id,
              pinned,
            })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.click()
              }
            }}
            onMouseDown={async (e) => {
              // Only left click
              if (e.button !== 0) return

              const startX = e.clientX
              const startY = e.clientY

              const rect = ref.current.getBoundingClientRect()
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

                  // If root bookmarks(Bookmarks Bar, Other Bookmarks),
                  // just mark drag trigger and return
                  if (isRoot) {
                    return
                  }

                  document.body.classList.add(draggingClass)

                  clone = ref.current.cloneNode(true) as HTMLElement
                  for (const elm of clone.querySelectorAll(
                    '.drag-over-target'
                  )) {
                    elm.remove()
                  }
                  clone.querySelector('.pin')?.remove()
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

                    // Can't move a folder to itself.
                    if (folderId === bookmark.id) {
                      return
                    }

                    // If dragged over a folder, move the bookmark to the folder
                    if (folderId) {
                      await chrome.bookmarks.move(bookmark.id, {
                        parentId: folderId,
                      })
                    }
                    // If dragged over between bookmarks, move the bookmark to the new position
                    else {
                      await chrome.bookmarks.move(bookmark.id, {
                        parentId,
                        index: index ? Number(index) : undefined,
                      })
                    }
                  }
                }
                // Emulate click event if not dragged
                else {
                  if (isFolder) {
                    const breadcrumbs = $breadcrumbs.get()

                    // If the folder is already in the breadcrumbs, remove it and all the following folders
                    if (breadcrumbs.includes(bookmark.id)) {
                      const newBreadCrumbs = breadcrumbs.slice(
                        0,
                        breadcrumbs.indexOf(bookmark.id)
                      )

                      await chrome.storage.local.set({
                        [HomeConst.BREADCRUMBS_KEY]: newBreadCrumbs,
                      })

                      return
                    }

                    // If the folder is not in the breadcrumbs, add it.
                    const index = breadcrumbs.indexOf(parentFolder.id)
                    await chrome.storage.local.set({
                      [HomeConst.BREADCRUMBS_KEY]: [
                        ...breadcrumbs.slice(0, index + 1),
                        bookmark.id,
                      ],
                    })
                  } else {
                    await HomeUtil.openURL(e, bookmark.url)
                  }
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
            <Flex gap="2" align="center" className="icon-and-name">
              {isFolder ? (
                <Flex
                  align="center"
                  justify="center"
                  width="16px"
                  height="16px"
                >
                  <FolderIcon />
                </Flex>
              ) : (
                <img
                  src={chrome.runtime.getURL(
                    `_favicon/?pageUrl=${bookmark.url}&size=32`
                  )}
                  width="16"
                  height="16"
                  alt=""
                />
              )}
              {bookmark.title && (
                <Text size="2" className="bookmark-name">
                  {bookmark.title}
                </Text>
              )}
            </Flex>

            {/* Display pin */}
            <Flex
              align="center"
              justify="center"
              className="pin"
              // Stop event bubbling and prevent navigation
              onMouseDown={(e) => e.stopPropagation()}
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()

                await HomeUtil.toggleBookmarkPin(bookmark)
              }}
            >
              <PinIcon pinned={pinned} />
            </Flex>

            {/* Drag over target */}
            {!isRoot && (
              <div
                className={clsx('drag-over-target', 'drag-over-target--top', {
                  'drag-over-target--for-page': isPage,
                })}
                data-parent-id={bookmark.parentId}
                data-index={bookmark.index}
              >
                <div className="drag-over-target-indicate" />
              </div>
            )}

            {isFolder && (
              <div
                className="drag-over-target drag-over-target--middle"
                data-folder-id={bookmark.id}
              />
            )}

            {!isRoot && (
              <div
                className={clsx(
                  'drag-over-target',
                  'drag-over-target--bottom',
                  {
                    'drag-over-target--for-page': isPage,
                  }
                )}
                data-parent-id={bookmark.parentId}
                data-index={
                  bookmark.index ? String(bookmark.index + 1) : undefined
                }
              >
                <div className="drag-over-target-indicate" />
              </div>
            )}
          </div>
        </ContextMenu.Trigger>

        <ContextMenu.Content variant="soft">
          {/* Can't change root bookmarks */}
          {!isRoot && (
            <>
              <ContextMenu.Item
                onClick={() => {
                  $bookmarkDialogMode.set('edit')
                  $editBookmark.set(bookmark)
                }}
              >
                <DialogItemFlex>
                  {isFolder ? 'Edit Folder' : 'Edit Page'}
                  <Pencil1Icon />
                </DialogItemFlex>
              </ContextMenu.Item>

              {isPage && (
                <ContextMenu.Item
                  onClick={() => {
                    if (bookmark.url) {
                      navigator.clipboard.writeText(bookmark.url)
                    }
                  }}
                >
                  <DialogItemFlex>
                    Copy URL
                    <ClipboardIcon />
                  </DialogItemFlex>
                </ContextMenu.Item>
              )}
            </>
          )}

          {isFolder && (
            <>
              <ContextMenu.Item
                onClick={() => {
                  HomeUtil.openAddBookmarkDialog(bookmark, 'addPage')
                }}
              >
                <DialogItemFlex>
                  Add Page
                  <PlusIcon />
                </DialogItemFlex>
              </ContextMenu.Item>

              <ContextMenu.Item
                onClick={() => {
                  HomeUtil.openAddBookmarkDialog(bookmark, 'addFolder')
                }}
              >
                <DialogItemFlex>
                  Add Folder
                  <PlusIcon />
                </DialogItemFlex>
              </ContextMenu.Item>
            </>
          )}

          <ContextMenu.Item
            onClick={async () => {
              await HomeUtil.toggleBookmarkPin(bookmark)
            }}
          >
            <DialogItemFlex>
              {pinned
                ? `Unpin ${isFolder ? 'Folder' : 'Page'}`
                : `Pin ${isFolder ? 'Folder' : 'Page'}`}
              <PinIcon slashed={pinned} width={14} />
            </DialogItemFlex>
          </ContextMenu.Item>

          {/* Can't remove root bookmarks */}
          {canDelete && (
            <ContextMenu.Item
              color="red"
              onClick={async () => {
                await chrome.bookmarks.removeTree(bookmark.id)
              }}
            >
              <DialogItemFlex>
                Delete
                <TrashIcon />
              </DialogItemFlex>
            </ContextMenu.Item>
          )}
        </ContextMenu.Content>
      </ContextMenu.Root>
    </>
  )
}

function DialogItemFlex({ children }: { children: ReactNode }) {
  return (
    <Flex width="100%" align="center" gap="6" justify="between">
      {children}
    </Flex>
  )
}
