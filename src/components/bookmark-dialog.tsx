import { useStore } from '@nanostores/react'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { useEffect, useRef, useState } from 'react'
import { HomeUtil } from '../home-util'
import { $bookmarkDialogMode, $editBookmark, $targetBookmark } from '../store'

export function BookmarkDialog() {
  const mode = useStore($bookmarkDialogMode)

  const nameFieldRef = useRef<HTMLInputElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  const editBookmark = useStore($editBookmark)
  const targetBookmark = useStore($targetBookmark)

  /**
   * Modal open state.
   */
  const open = editBookmark || targetBookmark ? true : false

  const [name, setName] = useState(editBookmark?.title ?? '')
  const [url, setUrl] = useState(editBookmark?.url ?? '')

  const [checkedURL, setCheckedURL] = useState(false)
  const [isValidURL, setIsValidURL] = useState(false)

  const isFolder = editBookmark ? HomeUtil.checkIfFolder(editBookmark) : false
  const isPage = !isFolder

  const dialogTitle =
    mode === 'edit'
      ? `Edit ${isPage ? 'Page' : 'Folder'}`
      : mode === 'addPage'
        ? 'Add Page'
        : 'Add Folder'

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setName(editBookmark?.title ?? '')
    setUrl(editBookmark?.url ?? '')
  }, [editBookmark, targetBookmark])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        // TODO: create an open state for the dialog and use it to open/close the dialog
        // the dialog UI jumps when $editBookmark or $targetBookmark change when closed

        if (!open) {
          $editBookmark.set(null)
          $targetBookmark.set(null)
        }
      }}
    >
      <Dialog.Content maxWidth="420px">
        <Dialog.Title>{dialogTitle}</Dialog.Title>

        <Flex direction="column" gap="3">
          <span>
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              ref={nameFieldRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                  confirmButtonRef.current?.click()
                }
              }}
            />
          </span>
          {isPage && mode !== 'addFolder' && (
            <span>
              <Text as="div" size="2" mb="1" weight="bold">
                URL
              </Text>
              <TextField.Root
                value={url}
                color={checkedURL && !isValidURL ? 'red' : undefined}
                onChange={(e) => {
                  setUrl(e.target.value)

                  setCheckedURL(true)
                  setIsValidURL(HomeUtil.isValidURL(e.target.value))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                    confirmButtonRef.current?.click()
                  }
                }}
              />
            </span>
          )}
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              ref={confirmButtonRef}
              onClick={async () => {
                if (editBookmark) {
                  await chrome.bookmarks.update(editBookmark.id, {
                    title: name.trim(),
                    url: isPage ? url.trim() : undefined,
                  })
                } else if (targetBookmark) {
                  await chrome.bookmarks.create({
                    parentId: targetBookmark.id,
                    title: name.trim(),
                    url: mode === 'addPage' ? url.trim() : undefined,
                  })
                }
              }}
              variant="soft"
              color="blue"
              disabled={mode === 'addPage' && !isValidURL}
            >
              Save
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
