import { BookmarkDeleteHistory } from '@/lib/bookmark-delete-history'
import { HomeConst } from './constants'
import { HomeUtil } from './home-util'
import {
  $bookmarkDeleteHistory,
  $bookmarksMap,
  $breadcrumbs,
  $folderPins,
  $pagePins,
} from './store'

chrome.bookmarks.onMoved.addListener(async (id, moveInfo) => {
  const moveNode = (await chrome.bookmarks.getSubTree(id))[0]
  const newParent = (await chrome.bookmarks.getSubTree(moveInfo.parentId))[0]
  const oldParent = (await chrome.bookmarks.getSubTree(moveInfo.oldParentId))[0]

  const moveToOtherFolder = moveInfo.parentId !== moveInfo.oldParentId

  $bookmarksMap.setKey(id, {
    ...$bookmarksMap.get()[id],
    node: moveNode,
    parent: newParent,
  })
  $bookmarksMap.setKey(moveInfo.parentId, {
    ...$bookmarksMap.get()[moveInfo.parentId],
    node: newParent,
  })

  if (moveToOtherFolder) {
    $bookmarksMap.setKey(moveInfo.oldParentId, {
      ...$bookmarksMap.get()[moveInfo.parentId],
      node: oldParent,
    })
  }

  HomeUtil.updateBookmarkAtomsRecursively(newParent, newParent.children)

  if (moveToOtherFolder) {
    HomeUtil.updateBookmarkAtomsRecursively(oldParent, oldParent.children)
  }

  // If moved item is in the breadcrumbs, remove it.
  if ($breadcrumbs.get().includes(id)) {
    chrome.storage.local.set({
      [HomeConst.BREADCRUMBS_KEY]: $breadcrumbs
        .get()
        .slice(0, $breadcrumbs.get().indexOf(id)),
    })
  }
})

chrome.bookmarks.onRemoved.addListener(async (id, removeInfo) => {
  const parent = (await chrome.bookmarks.getSubTree(removeInfo.parentId))[0]

  // Remove the folder from the folder pins
  if ($folderPins.get().includes(id)) {
    chrome.storage.local.set({
      [HomeConst.FOLDER_PINS_KEY]: $folderPins
        .get()
        .filter((folderId) => folderId !== id),
    })
  }

  if ($pagePins.get().includes(id)) {
    chrome.storage.local.set({
      [HomeConst.PAGE_PINS_KEY]: $pagePins
        .get()
        .filter((pageId) => pageId !== id),
    })
  }

  $bookmarksMap.setKey(removeInfo.parentId, {
    ...$bookmarksMap.get()[removeInfo.parentId],
    node: parent,
  })
  $bookmarksMap.setKey(removeInfo.node.id, undefined)

  HomeUtil.updateBookmarkAtomsRecursively(parent, parent.children)

  if ($breadcrumbs.get().includes(id)) {
    chrome.storage.local.set({
      [HomeConst.BREADCRUMBS_KEY]: $breadcrumbs
        .get()
        .slice(0, $breadcrumbs.get().indexOf(id)),
    })
  }
})

chrome.bookmarks.onCreated.addListener(async (id, bookmark) => {
  if (!bookmark.parentId) return

  const parent = (await chrome.bookmarks.getSubTree(bookmark.parentId))[0]

  $bookmarksMap.setKey(bookmark.id, {
    ...$bookmarksMap.get()[bookmark.id],
    node: bookmark,
    parent,
  })
  $bookmarksMap.setKey(bookmark.parentId, {
    ...$bookmarksMap.get()[bookmark.parentId],
    node: parent,
  })

  HomeUtil.updateBookmarkAtomsRecursively(parent, parent.children)
})

chrome.bookmarks.onChanged.addListener(async (id, changeInfo) => {
  const bookmark = (await chrome.bookmarks.getSubTree(id))[0]

  $bookmarksMap.setKey(id, {
    ...$bookmarksMap.get()[id],
    node: bookmark,
  })
})

/**
 * Sync the storage data with the atoms whenever the storage data changes.
 */
chrome.storage.local.onChanged.addListener(async (changes) => {
  if (changes[HomeConst.FOLDER_PINS_KEY]) {
    $folderPins.set(changes[HomeConst.FOLDER_PINS_KEY].newValue)
  }

  if (changes[HomeConst.PAGE_PINS_KEY]) {
    $pagePins.set(changes[HomeConst.PAGE_PINS_KEY].newValue)
  }

  if (changes[HomeConst.BREADCRUMBS_KEY]) {
    $breadcrumbs.set(changes[HomeConst.BREADCRUMBS_KEY].newValue)
  }

  if (changes[BookmarkDeleteHistory.STORAGE_KEY]) {
    $bookmarkDeleteHistory.set(
      changes[BookmarkDeleteHistory.STORAGE_KEY].newValue
    )
  }
})
