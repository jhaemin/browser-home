import { useStore } from '@nanostores/react'
import { Flex } from '@radix-ui/themes'
import { $searchInput } from '../store'

export function Search() {
  const searchInput = useStore($searchInput)

  return (
    <Flex className="stagger search-container" px="5" mb="5">
      <Flex direction="column" align="center">
        <Flex className="search-input-wrapper" align="center">
          <img
            src="./icons/icon128.png"
            alt="ToolCat"
            className="search-input-icon"
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
              }
            }}
          />
          <Flex mr="4">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="19.4434"
              height="19.2676"
              role="presentation"
            >
              <g>
                <rect
                  height="19.2676"
                  opacity="0"
                  width="19.4434"
                  x="0"
                  y="0"
                />
                <path
                  d="M0 7.79297C0 12.0898 3.49609 15.5859 7.79297 15.5859C9.49219 15.5859 11.0449 15.0391 12.3242 14.1211L17.1289 18.9355C17.3535 19.1602 17.6465 19.2676 17.959 19.2676C18.623 19.2676 19.082 18.7695 19.082 18.1152C19.082 17.8027 18.9648 17.5195 18.7598 17.3145L13.9844 12.5098C14.9902 11.2012 15.5859 9.57031 15.5859 7.79297C15.5859 3.49609 12.0898 0 7.79297 0C3.49609 0 0 3.49609 0 7.79297ZM1.66992 7.79297C1.66992 4.41406 4.41406 1.66992 7.79297 1.66992C11.1719 1.66992 13.916 4.41406 13.916 7.79297C13.916 11.1719 11.1719 13.916 7.79297 13.916C4.41406 13.916 1.66992 11.1719 1.66992 7.79297Z"
                  style={{
                    transition: 'fill 0.2s ease',
                  }}
                  fill="var(--icon-color)"
                  fillOpacity="1"
                />
              </g>
            </svg>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}