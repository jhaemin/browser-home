import { Flex } from '@radix-ui/themes'

export function PinIcon({
  pinned,
  slashed,
  width,
}: {
  pinned?: boolean
  slashed?: boolean
  width?: string | number
}) {
  if (slashed) {
    return (
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 16.0405 16.3584"
        height="16.3584"
        role="presentation"
      >
        <g>
          <rect height="16.3584" opacity="0" width="16.0405" x="0" y="0" />
          <path
            d="M5.32473 7.80584C4.27047 8.34482 3.64191 9.19067 3.54956 9.94629C3.52222 10.1309 3.59741 10.2197 3.7478 10.2197L7.74129 10.2197L8.77466 11.252L8.38257 11.252L8.38257 14.4443C8.38257 15.4902 7.9519 16.3584 7.78101 16.3584C7.61011 16.3584 7.17944 15.4902 7.17944 14.4443L7.17944 11.252L3.47437 11.252C2.85913 11.252 2.46948 10.8691 2.46948 10.2881C2.46948 9.07827 3.28446 7.86102 4.60506 7.08696ZM12.2244 1.14844C12.2244 1.34668 12.1423 1.5791 11.9646 1.81152C11.6091 2.27637 10.7888 2.91895 9.92065 3.48633L10.1453 6.69249C11.9318 7.39399 13.0857 8.84632 13.0857 10.2881C13.0857 10.7362 12.854 11.0663 12.4651 11.1931L11.4912 10.2197L11.8074 10.2197C11.9646 10.2197 12.0398 10.1309 12.0125 9.94629C11.8786 8.85105 10.6128 7.56626 8.56972 7.29987L7.52777 6.2585C7.60986 6.24964 7.69511 6.24805 7.78101 6.24805C8.21843 6.24805 8.63913 6.28947 9.03646 6.37044L8.83374 2.98047C8.8269 2.88477 8.84058 2.85059 8.9021 2.81641C9.93433 2.29004 10.7205 1.66797 10.7751 1.53125C10.8298 1.44238 10.7751 1.3877 10.7 1.3877L4.85522 1.3877C4.78687 1.3877 4.72534 1.44238 4.78003 1.53125C4.83472 1.66797 5.62769 2.29004 6.65308 2.81641C6.72144 2.85059 6.73511 2.88477 6.72827 2.98047L6.58473 5.31598L5.57689 4.3087L5.63452 3.48633C4.77319 2.91895 3.94604 2.27637 3.59741 1.81152C3.41968 1.5791 3.33765 1.34668 3.33765 1.14844C3.33765 0.731445 3.6521 0.423828 4.13745 0.423828L11.4246 0.423828C11.9031 0.423828 12.2244 0.731445 12.2244 1.14844Z"
            fill="var(--gray-12)"
            fillOpacity="0.85"
          />
          <path
            d="M0.951904 2.31055L13.3113 14.6562C13.5232 14.8613 13.8582 14.8613 14.0564 14.6562C14.2615 14.4512 14.2683 14.1162 14.0564 13.9111L1.70386 1.56543C1.49878 1.36035 1.15698 1.35352 0.951904 1.56543C0.753662 1.76367 0.753662 2.10547 0.951904 2.31055Z"
            fill="var(--gray-12)"
            fillOpacity="0.85"
          />
        </g>
      </svg>
    )
  }

  if (pinned) {
    return (
      <Flex align="center" justify="center" style={{ width }}>
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="11.0947"
          height="16.3584"
          role="presentation"
        >
          <g>
            <rect height="16.3584" opacity="0" width="11.0947" x="0" y="0" />
            <path
              d="M0 10.2881C0 10.8691 0.389648 11.252 1.00488 11.252L4.70312 11.252L4.70312 14.4443C4.70312 15.4902 5.14062 16.3584 5.31152 16.3584C5.47559 16.3584 5.91309 15.4902 5.91309 14.4443L5.91309 11.252L9.61133 11.252C10.2266 11.252 10.6162 10.8691 10.6162 10.2881C10.6162 8.8457 9.46094 7.32129 7.54004 6.62402L7.31445 3.48633C8.3125 2.91895 9.13281 2.27637 9.48828 1.81836C9.66602 1.58594 9.75488 1.35352 9.75488 1.14844C9.75488 0.731445 9.43359 0.423828 8.95508 0.423828L1.66797 0.423828C1.18262 0.423828 0.868164 0.731445 0.868164 1.14844C0.868164 1.35352 0.950195 1.58594 1.12793 1.81836C1.4834 2.27637 2.30371 2.91895 3.30176 3.48633L3.07617 6.62402C1.15527 7.32129 0 8.8457 0 10.2881Z"
              fill="var(--orange-9)"
              fillOpacity="0.85"
            />
          </g>
        </svg>
      </Flex>
    )
  }

  return (
    <Flex align="center" justify="center" style={{ width }}>
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="11.0947"
        height="16.3584"
        role="presentation"
      >
        <g>
          <rect height="16.3584" opacity="0" width="11.0947" x="0" y="0" />
          <path
            d="M5.31152 16.3584C5.47559 16.3584 5.91309 15.4902 5.91309 14.4443L5.91309 10.6914L4.70312 10.6914L4.70312 14.4443C4.70312 15.4902 5.14062 16.3584 5.31152 16.3584ZM1.00488 11.252L9.61133 11.252C10.2266 11.252 10.6162 10.8691 10.6162 10.2881C10.6162 8.27832 8.37402 6.24805 5.31152 6.24805C2.24219 6.24805 0 8.27832 0 10.2881C0 10.8691 0.389648 11.252 1.00488 11.252ZM1.27832 10.2197C1.12109 10.2197 1.05273 10.1309 1.08008 9.94629C1.23047 8.71582 2.80273 7.24609 5.31152 7.24609C7.81348 7.24609 9.38574 8.71582 9.53613 9.94629C9.56348 10.1309 9.49512 10.2197 9.33789 10.2197ZM0.868164 1.14844C0.868164 1.34668 0.950195 1.5791 1.12793 1.81152C1.47656 2.27637 2.30371 2.91895 3.16504 3.48633L2.91211 7.0957L4.00586 7.0957L4.25879 2.98047C4.26562 2.88477 4.25195 2.85059 4.18359 2.81641C3.1582 2.29004 2.36523 1.66797 2.31055 1.53125C2.25586 1.44238 2.31055 1.3877 2.38574 1.3877L8.23047 1.3877C8.30566 1.3877 8.36035 1.44238 8.30566 1.53125C8.25098 1.66797 7.45801 2.29004 6.43262 2.81641C6.37109 2.85059 6.35059 2.88477 6.36426 2.98047L6.61035 7.0957L7.7041 7.0957L7.45117 3.48633C8.31934 2.91895 9.13965 2.27637 9.48828 1.81152C9.67285 1.5791 9.75488 1.34668 9.75488 1.14844C9.75488 0.731445 9.43359 0.423828 8.95508 0.423828L1.66797 0.423828C1.18262 0.423828 0.868164 0.731445 0.868164 1.14844Z"
            fill="var(--gray-12)"
            fillOpacity="0.85"
          />
        </g>
      </svg>
    </Flex>
  )
}