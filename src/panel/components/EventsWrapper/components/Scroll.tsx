import { useRef, useEffect, useState, memo, useMemo } from 'react'
import { css } from '@emotion/react'
import { useSelector } from 'react-redux'

import { getExpandedEventId } from 'store/eventSelectors'
import { getActiveEvents } from 'store/eventSelectors'

interface IScrollProps {
  wrapper: HTMLDivElement | null
  scrollPosition: number
  prefersDarkMode: boolean
}

const ORIGINAL_BAR_WIDTH = 88
const EXPANDED_BAR_WIDTH = 340
const ORIGINAL_GAP = 4

function Scroll({ wrapper, scrollPosition, prefersDarkMode }: IScrollProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scaleFactorRef = useRef<number>(1)
  const expandedId = useSelector(getExpandedEventId)
  const events = useSelector(getActiveEvents)

  const [scrollLeftOffset, setScrollLeftOffset] = useState(0)
  const [scrollWindowSize, setScrollWindowSize] = useState(0)
  const [toggleUpdate, setToggleUpdate] = useState(false)

  const resizeObserver = useMemo(
    () =>
      new ResizeObserver(() => {
        setToggleUpdate((t) => !t)
      }),
    [],
  )

  useEffect(() => {
    wrapper && resizeObserver.observe(wrapper)

    return () => {
      wrapper && resizeObserver.unobserve(wrapper)
    }
  }, [resizeObserver, wrapper])

  useEffect(() => {
    if (!canvasRef.current || !events || !wrapper) {
      return
    }
    const ctx = canvasRef.current.getContext('2d')
    const { width } = wrapper.getBoundingClientRect()
    const scrollWidth = wrapper.scrollWidth
    const scaleFactor = width / scrollWidth
    scaleFactorRef.current = scaleFactor
    const slidingWindowSize = width * scaleFactor

    setScrollLeftOffset(scrollPosition * scaleFactor)
    setScrollWindowSize(slidingWindowSize)

    if (ctx) {
      ctx.canvas.width = width
      ctx.canvas.height = 30

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      ctx.fillStyle = `${prefersDarkMode ? '#eee' : '#A9A9A9'}`

      const barWidth = Math.floor(ORIGINAL_BAR_WIDTH * scaleFactor)
      const extendedBarWidth = Math.floor(EXPANDED_BAR_WIDTH * scaleFactor)

      events.reduce((prevOffset, event) => {
        const isExpanded = event.id === expandedId
        const offset = prevOffset + ORIGINAL_GAP
        ctx.fillRect(
          offset * scaleFactor,
          0,
          isExpanded ? extendedBarWidth : barWidth,
          30,
        )
        return offset + (isExpanded ? EXPANDED_BAR_WIDTH : ORIGINAL_BAR_WIDTH)
      }, 0)
    }
  }, [
    events,
    scrollPosition,
    wrapper,
    expandedId,
    prefersDarkMode,
    toggleUpdate,
  ])

  const handleScrollClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (wrapper) {
      wrapper.scrollLeft =
        (e.pageX - scrollWindowSize / 2) / scaleFactorRef.current
    }
  }

  const HandleScrollWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (wrapper) {
      wrapper.scrollLeft += e.deltaX / scaleFactorRef.current
    }
  }

  const isScrollVisible = !!events && !!events.length

  if (!isScrollVisible) {
    return null
  }

  return (
    <div
      css={css`
        position: relative;
        padding-top: 8px;
        padding-bottom: 8px;
        cursor: pointer;
        height: 38px;
      `}
      onClick={handleScrollClick}
      onWheel={HandleScrollWheel}
    >
      <div
        css={css`
          position: absolute;
          left: ${scrollLeftOffset}px;
          width: ${scrollWindowSize}px;
          height: 38px;
          border: 2px solid #aaa;
          top: 4px;
        `}
      />
      <canvas ref={canvasRef} />
    </div>
  )
}

export default memo(Scroll)
