import { useStore } from '@nanostores/react'
import { Flex, ScrollArea, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { HomeUtil } from '../home-util'
import { $bookmarksMap } from '../store'
import { BookmarkNode } from './bookmark-node'

export function FolderColumn({
  folderId,
  forDisplay = false,
  height,
  py,
  pt,
  pb,
}: {
  folderId: string
  /**
   * For pinned folders, only show bookmarks and not sub-folders.
   */
  forDisplay?: boolean
  height?: string
  py?: ComponentProps<typeof Flex>['py']
  pt?: ComponentProps<typeof Flex>['pt']
  pb?: ComponentProps<typeof Flex>['pb']
}) {
  const folder = useStore($bookmarksMap, { keys: [folderId] })[folderId]?.node

  if (!folder) return null

  let children = folder.children ?? []

  if (forDisplay) {
    children = children.filter((child) => !HomeUtil.checkIfFolder(child))
  }

  const empty = children.length === 0

  return (
    <Flex
      height={height ?? '100%'}
      className={clsx('folder-column', {
        empty,
      })}
    >
      <ScrollArea scrollbars="vertical" className="column-scroll-container">
        <Flex
          direction="column"
          p="4"
          py={py}
          pt={pt}
          pb={pb}
          className="column-bookmarks-container"
        >
          {children.length === 0 ? (
            <Flex align="center" justify="center" className="no-bookmarks">
              <Text size="2" color="gray">
                No Bookmarks
              </Text>
            </Flex>
          ) : (
            children.map((child) => (
              <BookmarkNode key={child.id} bookmarkId={child.id} />
            ))
          )}
        </Flex>
      </ScrollArea>
    </Flex>
  )
}
