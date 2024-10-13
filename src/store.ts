import type { BookmarkDeleteHistoryItem } from '@/lib/bookmark-delete-history'
import { atom, batched, map } from 'nanostores'
import type { BookmarkMapData } from './types'

export const $breadcrumbs = atom<string[]>([])

export const $folderPins = atom<string[]>([])
export const $pagePins = atom<string[]>([])

/**
 * Map of all pinned pages and folders.
 * When page or folder is pinned, the value is true.
 * It is automatically updated when $folderPins or $pagePins are updated.
 */
export const $pinsMap = map<Record<string, boolean | undefined>>({})

$folderPins.subscribe(async (newPins, oldPins) => {
  if (oldPins) {
    for (const id of oldPins) {
      $pinsMap.setKey(id, undefined)
    }
  }

  for (const id of newPins) {
    $pinsMap.setKey(id, true)
  }
})

$pagePins.subscribe(async (newPins, oldPins) => {
  if (oldPins) {
    for (const id of oldPins) {
      $pinsMap.setKey(id, undefined)
    }
  }

  for (const id of newPins) {
    $pinsMap.setKey(id, true)
  }
})

/**
 * Get all bookmarks and store them in the map.
 */
export const $bookmarksMap = map<Record<string, BookmarkMapData | undefined>>(
  {}
)

/**
 * Ready when all the bookmarks data are mapped to atoms.
 */
export const $bookmarksReady = atom(false)
/**
 * Ready when all the storage data are synced with atoms.
 */
export const $syncStorageAtomsReady = atom(false)

/**
 * When all the other ready states are true, the app is ready.
 */
export const $appReady = batched(
  [$bookmarksReady, $syncStorageAtomsReady],
  (bookmarksReady, syncStorageAtomsReady) => {
    return bookmarksReady && syncStorageAtomsReady
  }
)

/**
 * The bookmark that is currently being edited.
 */
export const $editBookmark = atom<chrome.bookmarks.BookmarkTreeNode | null>(
  null
)
/**
 * The target bookmark to add a new bookmark or folder under.
 */
export const $targetBookmark = atom<chrome.bookmarks.BookmarkTreeNode | null>(
  null
)
/**
 * The mode of the bookmark dialog.
 */
export const $bookmarkDialogMode = atom<'addPage' | 'addFolder' | 'edit'>(
  'edit'
)

/**
 * The bookmarks that are currently selected with Shift + Click.
 */
export const $selectedBookmarks = atom<string[]>([])

/**
 * Actual search input value.
 */
export const $searchInput = atom('')
/**
 * Search query to send to the server. It is debounced.
 */
export const $searchQuery = atom('')

/**
 * Whether the search result container(popup) is active. (visible)
 */
export const $searchResultContainerActive = atom(false)

/**
 * Toggle body class for visual effects. Check the CSS for the actual effects.
 */
$searchResultContainerActive.listen((active) => {
  if (active) {
    document.body.classList.add('searching')
  } else {
    document.body.classList.remove('searching')
  }
})

/**
 * Debounce the search input change event.
 */
let searchInputChangeTimeout: Timer

/**
 * When the search input changes, set the search query.
 */
$searchInput.listen((value) => {
  clearTimeout(searchInputChangeTimeout)

  const trimmed = value.trim()

  if (trimmed === '') {
    $searchQuery.set('')
    return
  }

  searchInputChangeTimeout = setTimeout(() => {
    $searchQuery.set(trimmed)
  }, 300)
})

/**
 * Whether the extension is in the first run.
 *
 * Update once when the app is ready.
 * Do not update afterwards.
 */
export const $isFirstRun = atom<boolean>(true)

export const $bookmarkDeleteHistory = atom<BookmarkDeleteHistoryItem[]>([])
