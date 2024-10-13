import { nanoid } from 'nanoid'

const MAX_HISTORY_LENGTH = 100

export type BookmarkDeleteHistoryItem = {
  id: string
  deletedAt: number
  bookmark: chrome.bookmarks.BookmarkTreeNode
}

const STORAGE_KEY = 'deleted-bookmarks'

export const BookmarkDeleteHistory = {
  STORAGE_KEY: STORAGE_KEY,

  async getHistory(): Promise<BookmarkDeleteHistoryItem[]> {
    const data = await chrome.storage.local.get(STORAGE_KEY)
    const history = data[STORAGE_KEY] ?? []

    if (!Array.isArray(history)) {
      return []
    }

    return history
  },

  async push(item: Omit<BookmarkDeleteHistoryItem, 'id' | 'deletedAt'>) {
    const history = await this.getHistory()

    if (history.length >= MAX_HISTORY_LENGTH) {
      history.shift()
    }

    history.push({
      id: nanoid(7),
      deletedAt: Date.now(),
      ...item,
    })

    await chrome.storage.local.set({
      [STORAGE_KEY]: history,
    })
  },

  async clear() {
    await chrome.storage.local.set({
      [STORAGE_KEY]: [],
    })
  },

  async remove(id: string) {
    const history = await this.getHistory()
    const index = history.findIndex((item) => item.id === id)

    if (index === -1) {
      return
    }

    history.splice(index, 1)

    await chrome.storage.local.set({
      [STORAGE_KEY]: history,
    })
  },
}
