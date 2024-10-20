import { useStore } from '@nanostores/react'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Flex } from '@radix-ui/themes'
import { $searchInput } from '../store'

export function Search() {
  const searchInput = useStore($searchInput)

  return (
    <Flex className="stagger search-container" px="5" mb="5">
      <Flex direction="column" align="center">
        <Flex className="search-input-wrapper" align="center">
          <MagnifyingGlassIcon
            className="search-input-icon"
            color="var(--icon-color)"
          />
          <input
            className="search-input"
            type="text"
            value={searchInput}
            onChange={(e) => {
              $searchInput.set(e.target.value)
            }}
            placeholder="Search Google"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur()
              } else if (e.key === 'Enter') {
                // Prevent CJK triggering keydown event twice
                if (e.nativeEvent.isComposing) return

                if (e.nativeEvent.isTrusted) {
                  const url = `https://www.google.com/search?q=${searchInput}`
                  window.location.href = url
                }
              }
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
