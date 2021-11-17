import { useRef, useState, useCallback } from 'react'
import { css } from '@emotion/react'

import EventsList from './EventsList'
import Scroll from './Scroll'
import ActionsToolbox from './ActionsToolbox'

import { IEventPayload } from '../../redux/eventRecorderSlice'

interface IEventsProps {
  isWideScreen: boolean
  events: IEventPayload[]
  toggleHighlightedElement: React.MouseEventHandler<Element>
}

export default function Events({
  events,
  toggleHighlightedElement,
  isWideScreen,
}: IEventsProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [eventsListScroll, setEventsListScroll] = useState(0)

  const handleEventsScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollPosition = (e.target as any).scrollLeft
      setEventsListScroll(scrollPosition)
    },
    [setEventsListScroll],
  )

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        position: relative;
        width: ${isWideScreen ? '100vw' : '80vw'};
      `}
    >
      <div
        css={css`
          display: flex;
          justify-content: row;
          overflow-x: scroll;

          height: calc(100% - 44px);
          &::-webkit-scrollbar {
            display: none;
          }
        `}
        onScroll={handleEventsScroll}
        onMouseOver={toggleHighlightedElement}
        onMouseOut={toggleHighlightedElement}
        ref={wrapperRef}
      >
        <EventsList events={events} />
      </div>
      <Scroll
        wrapper={wrapperRef.current}
        events={events}
        scrollPosition={eventsListScroll}
        isWideScreen={isWideScreen}
      />
      <ActionsToolbox />
    </div>
  )
}
