import { useLayoutEffect, useRef, useState } from 'react'

// 幅720pxの固定カードを、与えられた領域の幅に合わせて縮小表示する。
// スマホでプレビューを常時表示（sticky）するために使用。
export default function ScaledPreview({ children, cardWidth = 720, maxHeightVh = 46 }) {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const [scale, setScale] = useState(0.5)
  const [scaledHeight, setScaledHeight] = useState(0)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const update = () => {
      const availW = outer.clientWidth
      const s = availW > 0 ? availW / cardWidth : 0.5
      setScale(s)
      setScaledHeight(inner.offsetHeight * s)
    }

    update()
    // カードの内容（日数・ブロック数など）が変わると高さが変わるので監視
    const ro = new ResizeObserver(update)
    ro.observe(inner)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [cardWidth])

  return (
    <div
      ref={outerRef}
      className="overflow-y-auto overflow-x-hidden rounded-lg"
      style={{ maxHeight: `${maxHeightVh}vh` }}
    >
      {/* 縮小後の高さ分だけ場所を確保する箱 */}
      <div style={{ height: scaledHeight, position: 'relative' }}>
        <div
          ref={innerRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: cardWidth,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
