import { useStore } from '@nanostores/react'
import { Flex } from '@radix-ui/themes'
import { createPortal } from 'react-dom'
import {
  $bookmarkDeleteHistorySlideOverOpen,
  BOOKMARK_DELETE_HISTORY_SLIDE_OVER_WIDTH,
  BookmarkDeleteHistoryButton,
} from './bookmark-delete-history-button'
import { Settings } from './settings'

export function More() {
  const bookmarkDeleteHistorySlideOverOpen = useStore(
    $bookmarkDeleteHistorySlideOverOpen
  )

  return createPortal(
    <>
      <Flex
        className="stagger top-corner-more-wrapper"
        position="fixed"
        top="6"
        left="6"
      >
        <Flex
          gap="4"
          className="top-corner-more"
          style={{
            transform: bookmarkDeleteHistorySlideOverOpen
              ? `translateX(${BOOKMARK_DELETE_HISTORY_SLIDE_OVER_WIDTH}px)`
              : undefined,
          }}
        >
          <BookmarkDeleteHistoryButton />
        </Flex>
      </Flex>
      <Flex
        className="stagger top-corner-more-wrapper"
        position="fixed"
        top="6"
        right="6"
      >
        <Flex gap="4" className="top-corner-more">
          {/* <Cleanup /> */}
          <Settings />
        </Flex>
      </Flex>
    </>,
    document.getElementById('more')!
  )
}
