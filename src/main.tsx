import { BookmarkDeleteHistory } from '@/lib/bookmark-delete-history'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import type { WritableAtom } from 'nanostores'
import ReactDOM from 'react-dom/client'
import { SWRConfig } from 'swr'
import { App } from './app'
import { $welcomeOpen } from './components/tour-wrapper'
import { HomeConst } from './constants'
import './events'
import { HomeUtil } from './home-util'
import {
  $appReady,
  $bookmarkDeleteHistory,
  $bookmarksReady,
  $breadcrumbs,
  $folderPins,
  $isFirstRun,
  $pagePins,
  $syncStorageAtomsReady,
} from './store'

const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')

// Listen to dark mode change
matchMedia.addEventListener('change', (event) => {
  const isDark = event.matches
  handleDarkModeChange(isDark)
})

// Initial dark mode
handleDarkModeChange(matchMedia.matches)

/**
 * Handle dark mode change
 */
function handleDarkModeChange(isDark: boolean) {
  if (isDark) {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}

export type Bookmark = WritableAtom<chrome.bookmarks.BookmarkTreeNode>

/**
 * Read the storage and initialize the application state.
 * Get all keys at once to prevent multiple storage reads.
 */
chrome.storage.local
  .get([
    HomeConst.FOLDER_PINS_KEY,
    HomeConst.PAGE_PINS_KEY,
    HomeConst.BREADCRUMBS_KEY,
    HomeConst.IS_FIRST_RUN_KEY,
    BookmarkDeleteHistory.STORAGE_KEY,
  ])
  .then(async (data) => {
    // Initialize folder pins
    const folderPins = data[HomeConst.FOLDER_PINS_KEY] as string[] | undefined
    if (
      folderPins &&
      Array.isArray(folderPins) &&
      folderPins.every((id) => typeof id === 'string')
    ) {
      $folderPins.set(folderPins)
    }

    // Initialize page pins
    const pagePins = data[HomeConst.PAGE_PINS_KEY] as string[] | undefined

    if (
      pagePins &&
      Array.isArray(pagePins) &&
      pagePins.every((id) => typeof id === 'string')
    ) {
      $pagePins.set(pagePins)
    }

    // Initialize breadcrumbs
    const bookmarks = await chrome.bookmarks.getTree()
    const breadcrumbs = data[HomeConst.BREADCRUMBS_KEY] as string[] | undefined
    if (
      breadcrumbs &&
      Array.isArray(breadcrumbs) &&
      breadcrumbs.length > 0 &&
      breadcrumbs.every((id) => typeof id === 'string') &&
      breadcrumbs[0] === bookmarks[0].id
    ) {
      $breadcrumbs.set(breadcrumbs)
    } else {
      const root = bookmarks[0]
      $breadcrumbs.set(root ? [root.id] : [])
    }

    $isFirstRun.set(data[HomeConst.IS_FIRST_RUN_KEY] ?? true)

    // Mark as first run in debug mode
    if (DEBUG_TOUR) {
      $isFirstRun.set(true)
    }

    chrome.bookmarks.getTree().then((bookmarks) => {
      HomeUtil.updateBookmarkAtomsRecursively(null, bookmarks)
      $bookmarksReady.set(true)
    })

    $syncStorageAtomsReady.set(true)

    $bookmarkDeleteHistory.set(data[BookmarkDeleteHistory.STORAGE_KEY] ?? [])
  })

/**
 * Set global CSS variables
 */
document.documentElement.style.setProperty(
  '--folder-column-width',
  `${HomeConst.FOLDER_COLUMN_WIDTH}px`
)

/**
 * When the app is ready, stagger the top-level elements for a smooth entrance.
 */
$appReady.listen(async (ready) => {
  const root = document.getElementById('root')

  if (!root) {
    throw new Error('Root element not found')
  }

  // Render the app
  ReactDOM.createRoot(root).render(
    <SWRConfig
      value={{
        fetcher: async (url: string) => {
          const res = await fetch(url, { headers: {} })
          return res.json()
        },
      }}
    >
      <Theme accentColor="gray" hasBackground={false} grayColor="slate">
        <App />
      </Theme>
    </SWRConfig>
  )

  /**
   * Apply transition on the next tick.
   */
  setTimeout(() => {
    const staggers = document.querySelectorAll<HTMLElement>('.stagger')

    staggers.forEach((stagger, i) => {
      if (i === staggers.length - 1) {
        stagger.ontransitionend = () => {
          document.body.classList.add('ready')
        }
      }

      stagger.style.transitionDelay = `${i * 0.04}s`
      stagger.classList.add('ready')
    })
  }, 0)

  setTimeout(async () => {
    // Show the welcome screen on the first run
    // or in development mode
    if ((await HomeUtil.isFirstRun()) || DEBUG_TOUR) {
      const bookmarks = await chrome.bookmarks.getTree()

      // Top root bookmark (it should be the only one)
      const topRoot = bookmarks[0]
      const defaultBookmark = topRoot.children?.[0]

      // Set the default breadcrumbs on the first run
      if (defaultBookmark) {
        chrome.storage.local.set({
          [HomeConst.BREADCRUMBS_KEY]: [topRoot.id, defaultBookmark.id],
        })
      }

      setTimeout(() => {
        $welcomeOpen.set(true)
      }, 400)
    }
  }, 400)
})
