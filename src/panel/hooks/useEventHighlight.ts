import { MouseEventHandler, useCallback } from 'react'

import { IEventBlock } from 'store/eventRecorderSlice'

import { HIGHLIGHT_ELEMENT, REDIRECT_STARTED } from 'constants/messageTypes'
import { internalEventsMap } from 'constants/internalEventsMap'

function highlightElement(
  tabId: number,
  highlightedEventIndexes: number[],
  events: Record<number, IEventBlock[]>,
) {
  if (tabId === -1) {
    return
  }
  const payload: { type: string; selector: string | null } = {
    type: HIGHLIGHT_ELEMENT,
    selector: null,
  }

  if (highlightedEventIndexes.length) {
    const item = events[tabId][highlightedEventIndexes[0]]
    if (Array.isArray(item)) {
      payload.selector = item[highlightedEventIndexes[1]]?.selector ?? null
    } else {
      const selector = item.element?.selector || item.selector
      payload.selector = selector ?? null
    }
  }

  chrome.tabs.sendMessage(tabId, payload)
}

export default function useEventHighlight(
  events: Record<number, IEventBlock[]>,
  activeTabID: number,
) {
  const toggleHighlightedElement: MouseEventHandler = useCallback(
    (e) => {
      const eventIds: number[] =
        (e?.target as HTMLElement)?.dataset?.event_list_index
          ?.split('.')
          .map((it) => Number(it)) ?? []

      const shouldHighlight: boolean =
        !!eventIds.length &&
        (
          eventIds.reduce(
            (acc: unknown, id) => (acc as IEventBlock[])?.[id],
            events?.[activeTabID],
          ) as IEventBlock
        )?.type !== internalEventsMap[REDIRECT_STARTED]

      const ids = shouldHighlight ? eventIds : []

      highlightElement(activeTabID, ids, events)
    },
    [activeTabID, events],
  )

  return toggleHighlightedElement
}
