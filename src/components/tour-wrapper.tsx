import { useStore } from '@nanostores/react'
import { Button, Flex, Heading, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { atom } from 'nanostores'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Tour, { type ReactourStep } from 'reactour'
import { HomeConst } from '../constants'

export const $welcomeOpen = atom(false)
export const $tourOpen = atom(false)

export function TourWrapper() {
  const open = useStore($tourOpen)
  const [className, setClassName] = useState('tour')
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {}, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        // Tour popup jumps on first open.
        // So remove transition initially and add transition again after a delay.
        setClassName('tour initialized')
      }, 100)
    }
  }, [open])

  useEffect(() => {
    // Show bookmark node's pin manually on step 3.
    // If the bookmark node has the class 'for-tour', the pin will be explicitly shown.
    if (currentStep === 3) {
      document
        .querySelector('.breadcrumbs-container-wrapper .bookmark-node')
        ?.classList.add('for-tour')
    } else {
      document
        .querySelector('.breadcrumbs-container-wrapper .bookmark-node')
        ?.classList.remove('for-tour')
    }
  }, [currentStep])

  const steps: ReactourStep[] = [
    {
      selector: '.search-input-wrapper',
      action: (elm) => {
        elm.scrollIntoView({ block: 'center' })
        window.dispatchEvent(new Event('resize'))
      },
      content: (
        <Text>
          You can search Google directly from here. Just type and press Enter.
        </Text>
      ),
    },
    {
      selector: '.breadcrumbs-container-wrapper',
      action: (elm) => {
        elm.scrollIntoView({ block: 'center' })
        window.dispatchEvent(new Event('resize'))
      },
      content: (
        <Text>
          This is the Breadcrumbs. Here you can see and manage all your browser
          bookmarks at a glance. All data is synced with the browser.
        </Text>
      ),
    },
    {
      selector: '.breadcrumbs-container-wrapper .bookmark-node',
      action: (elm) => {
        elm.scrollIntoView({ block: 'center' })
        window.dispatchEvent(new Event('resize'))
      },
      content: (
        <Text>
          Click folder to expand. Click page to open. Right-click to see more
          actions.
        </Text>
      ),
    },
    {
      selector: '.breadcrumbs-container-wrapper .bookmark-node .pin',
      action: (elm) => {
        elm.scrollIntoView({ block: 'center' })
        window.dispatchEvent(new Event('resize'))
      },
      content: (
        <Text>Pin your favorite folders and pages to access them quickly.</Text>
      ),
    },
    // {
    //   selector: '.settings',
    //   action: (elm) => {
    //     elm.scrollIntoView({ block: 'center' })
    //     window.dispatchEvent(new Event('resize'))
    //   },
    //   content: (
    //     <Text>
    //       You can customize your Browser Home from here. More features will be
    //       added in the future, so stay tuned!
    //     </Text>
    //   ),
    // },
  ]

  const stepsLength = steps.length

  return (
    <>
      <Welcome />

      <Tour
        isOpen={open}
        steps={steps}
        onRequestClose={async () => {
          $tourOpen.set(false)

          await chrome.storage.local.set({
            [HomeConst.IS_FIRST_RUN_KEY]: false,
          })
        }}
        rounded={20}
        maskSpace={20}
        showNumber={false}
        showNavigationNumber={false}
        prevButton={
          <Button
            asChild
            radius="full"
            variant="soft"
            disabled={currentStep === 0}
          >
            <span>Back</span>
          </Button>
        }
        nextButton={
          <Button
            asChild
            radius="full"
            variant="soft"
            disabled={currentStep === stepsLength - 1}
          >
            <span>Next</span>
          </Button>
        }
        lastStepNextButton={
          <Button asChild radius="full" variant="solid" color="blue">
            <span>End the Tour</span>
          </Button>
        }
        showCloseButton={false}
        disableInteraction
        closeWithMask={false}
        className={className}
        showNavigation={false}
        getCurrentStep={(step) => {
          setCurrentStep(step)
        }}
      />
    </>
  )
}

function Welcome() {
  const open = useStore($welcomeOpen)

  return createPortal(
    <div
      className={clsx('welcome', {
        'welcome-open': open,
      })}
    >
      <Flex>
        <img
          className="welcome-icon animate-target"
          src="./icons/icon512.png"
          alt="ToolCat"
        />
      </Flex>
      <Heading size="8" align="center" mt="4" className="animate-target">
        Welcome to Browser Home
      </Heading>
      <Text size="4" mt="6" align="center" className="animate-target">
        Browser Home replaces your new tab page
        <br />
        with a clean and simple design.
      </Text>
      <Button
        color="blue"
        radius="full"
        size="4"
        mt="6"
        onClick={() => {
          $welcomeOpen.set(false)

          setTimeout(() => {
            $tourOpen.set(true)
          }, 500)
        }}
        className="animate-target"
      >
        Start Tour
      </Button>
    </div>,
    document.getElementById('welcome')!
  )
}
