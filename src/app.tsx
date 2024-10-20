import { useStore } from '@nanostores/react'
import { Box, Flex, Link, ScrollArea, Separator, Text } from '@radix-ui/themes'
import { useEffect } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { BookmarkDialog } from './components/bookmark-dialog'
import { FolderColumn } from './components/folder-column'
import { FolderPins } from './components/folder-pins'
import { More } from './components/more'
import { PagePins } from './components/page-pins'
import { Search } from './components/search'
import { TourWrapper } from './components/tour-wrapper'
import { $breadcrumbs, $isFirstRun } from './store'

export function App() {
  const isFirstRun = useStore($isFirstRun)
  const breadcrumbs = useStore($breadcrumbs)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const wrapper = document.querySelector<HTMLElement>(
      '.breadcrumbs-container-wrapper'
    )
    const container = document.querySelector<HTMLElement>(
      '.breadcrumbs-container'
    )

    if (wrapper && container) {
      wrapper.style.transition = 'width 0.3s cubic-bezier(0.43, 0.47, 0.07, 1)'
      wrapper.style.width = `${container.getBoundingClientRect().width}px`
    }
  }, [breadcrumbs])

  return (
    <>
      {/* Render Tour only on first run */}
      {isFirstRun && <TourWrapper />}

      <Flex
        direction="column"
        align="center"
        justify="center"
        minHeight="100vh"
        pt="8"
        pb="5"
        id="home-container"
        position="relative"
      >
        <Search />
        <PagePins />
        <FolderPins />

        <Separator size="3" className="stagger blur-when-search" />

        <Flex width="100%" p="5" className="blur-when-search">
          <ScrollArea
            scrollbars="horizontal"
            type="scroll"
            style={{
              borderRadius: 'var(--radius-5)',
            }}
          >
            <Box
              className="stagger"
              height="80vh"
              maxHeight="600px"
              minHeight="340px"
            >
              <Flex
                className="breadcrumbs-container-wrapper"
                style={{
                  overflow: 'hidden',
                  backgroundColor: 'var(--slate-1)',
                  borderRadius: 'var(--radius-5)',
                  height: '100%',
                }}
              >
                <Flex
                  align="start"
                  justify="start"
                  className="breadcrumbs-container"
                >
                  {breadcrumbs.map((folderId, index) => (
                    <Fragment key={folderId}>
                      <FolderColumn folderId={folderId} />
                      {index < breadcrumbs.length - 1 && (
                        <Separator
                          orientation="vertical"
                          size="4"
                          style={{
                            flex: 'none',
                            backgroundColor: 'var(--slate-a4)',
                          }}
                        />
                      )}
                    </Fragment>
                  ))}
                </Flex>
              </Flex>
            </Box>
          </ScrollArea>
        </Flex>

        <Flex className="stagger blur-when-search">
          <Text
            as="span"
            weight="medium"
            color="gray"
            style={{ opacity: 0.5, letterSpacing: '0.05em' }}
            size="2"
          >
            Designed and developed by{' '}
            <Link
              href="https://jhaemin.com"
              target="_blank"
              style={{
                textDecoration: 'none',
              }}
            >
              Jang Haemin
            </Link>
          </Text>
        </Flex>

        {/* <More /> */}
      </Flex>

      <BookmarkDialog />
    </>
  )
}
