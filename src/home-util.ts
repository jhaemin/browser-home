import type React from 'react'
import { HomeConst } from './constants'
import {
  $bookmarkDialogMode,
  $bookmarksMap,
  $editBookmark,
  $targetBookmark,
} from './store'

export namespace HomeUtil {
  export function checkIfFolder(
    bookmark: chrome.bookmarks.BookmarkTreeNode
  ): bookmark is chrome.bookmarks.BookmarkTreeNode & {
    children: chrome.bookmarks.BookmarkTreeNode[]
  } {
    return bookmark.url === undefined
  }

  export function isValidURL(url: string) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  export async function toggleBookmarkPin(
    bookmark: chrome.bookmarks.BookmarkTreeNode
  ) {
    if (checkIfFolder(bookmark)) {
      await toggleFolderPin(bookmark.id)
    } else {
      await togglePagePin(bookmark.id)
    }
  }

  export async function getPagePins() {
    return (
      (await chrome.storage.local.get(HomeConst.PAGE_PINS_KEY))[
        HomeConst.PAGE_PINS_KEY
      ] ?? []
    )
  }

  export async function getFolderPins() {
    return (
      (await chrome.storage.local.get(HomeConst.FOLDER_PINS_KEY))[
        HomeConst.FOLDER_PINS_KEY
      ] ?? []
    )
  }

  export async function togglePagePin(pinId: string) {
    const pagePins = await getPagePins()

    if (pagePins.includes(pinId)) {
      await removePagePin(pinId)
    } else {
      await addPagePin(pinId)
    }
  }

  export async function toggleFolderPin(pinId: string) {
    const folderPins = await getFolderPins()

    if (folderPins.includes(pinId)) {
      await removeFolderPin(pinId)
    } else {
      await addFolderPin(pinId)
    }
  }

  export async function addPagePin(pinId: string) {
    const pagePins = await getPagePins()

    await chrome.storage.local.set({
      [HomeConst.PAGE_PINS_KEY]: [...pagePins, pinId],
    })
  }

  export async function addFolderPin(pinId: string) {
    const folderPins = await getFolderPins()

    await chrome.storage.local.set({
      [HomeConst.FOLDER_PINS_KEY]: [...folderPins, pinId],
    })
  }

  export async function removePagePin(pinId: string) {
    const pagePins = await getPagePins()

    await chrome.storage.local.set({
      [HomeConst.PAGE_PINS_KEY]: pagePins.filter((id: string) => id !== pinId),
    })
  }

  export async function removePagePins(pinIds: string[]) {
    const pagePins = await getPagePins()

    await chrome.storage.local.set({
      [HomeConst.PAGE_PINS_KEY]: pagePins.filter(
        (id: string) => !pinIds.includes(id)
      ),
    })
  }

  export async function removeFolderPin(pinId: string) {
    const folderPins = await getFolderPins()

    await chrome.storage.local.set({
      [HomeConst.FOLDER_PINS_KEY]: folderPins.filter(
        (id: string) => id !== pinId
      ),
    })
  }

  export function openBookmarkEditDialog(
    bookmark: chrome.bookmarks.BookmarkTreeNode
  ) {
    $bookmarkDialogMode.set('edit')
    $editBookmark.set(bookmark)
  }

  export function openAddBookmarkDialog(
    target: chrome.bookmarks.BookmarkTreeNode,
    mode: 'addPage' | 'addFolder'
  ) {
    $bookmarkDialogMode.set(mode)
    $targetBookmark.set(target)
  }

  /**
   * Update the bookmark atoms recursively.
   */
  export function updateBookmarkAtomsRecursively(
    parent: chrome.bookmarks.BookmarkTreeNode | null,
    children: chrome.bookmarks.BookmarkTreeNode[] | undefined
  ) {
    for (const bookmark of children ?? []) {
      $bookmarksMap.setKey(bookmark.id, {
        node: bookmark,
        parent,
      })

      if (bookmark.children) {
        updateBookmarkAtomsRecursively(bookmark, bookmark.children)
      }
    }
  }

  export async function openURL(
    e: KeyboardEvent | MouseEvent | React.KeyboardEvent | React.MouseEvent,
    url?: string,
    newTab = false
  ) {
    if (e.metaKey || e.ctrlKey || newTab) {
      const currentTab = await chrome.tabs.getCurrent()

      if (!currentTab) return

      // Implement browser's default new tab open behavior
      await chrome.tabs.create({
        url,
        // Open the new tab next to the current tab.
        index: currentTab.index + 1,
        // If openerTabId is provided, when the new tab is closed, the focus will return to the opener tab.
        openerTabId: currentTab.id,
      })
    } else {
      // Replace the current tab with the new URL.
      await chrome.tabs.update({ url })
    }
  }

  /**
   * Check if the extension is running for the first time.
   * Then set the flag to false to prevent the tour from running again.
   */
  export async function isFirstRun() {
    const isFirstRun =
      ((await chrome.storage.local.get(HomeConst.IS_FIRST_RUN_KEY))[
        HomeConst.IS_FIRST_RUN_KEY
      ] as boolean | undefined) ?? true

    return isFirstRun
  }

  /**
   * Reset the first run flag. Only for development.
   */
  export async function resetFirstRun() {
    await chrome.storage.local.remove(HomeConst.IS_FIRST_RUN_KEY)
  }

  /**
   * Reset all related storage. Only for development.
   */
  export async function resetAllRelatedStorage() {
    await chrome.storage.local.remove([
      HomeConst.BREADCRUMBS_KEY,
      HomeConst.FOLDER_PINS_KEY,
      HomeConst.PAGE_PINS_KEY,
      HomeConst.IS_FIRST_RUN_KEY,
    ])
  }

  export async function insertBookmarkRecursively(
    bookmark: chrome.bookmarks.BookmarkTreeNode,
    parentId?: string,
    index?: number
  ) {
    if (checkIfFolder(bookmark)) {
      const folder = await chrome.bookmarks.create({
        title: bookmark.title,
        parentId,
        index,
      })

      for (const child of bookmark.children) {
        await insertBookmarkRecursively(child, folder.id)
      }
    } else {
      await chrome.bookmarks.create({
        title: bookmark.title,
        url: bookmark.url,
        parentId,
        index,
      })
    }
  }

  export async function clearBookmarkFolder(
    bookmark: chrome.bookmarks.BookmarkTreeNode
  ) {
    for (const child of bookmark.children ?? []) {
      if (checkIfFolder(child)) {
        await chrome.bookmarks.removeTree(child.id)
      } else {
        await chrome.bookmarks.remove(child.id)
      }
    }
  }
}
