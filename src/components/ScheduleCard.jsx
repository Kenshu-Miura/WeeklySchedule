import { forwardRef } from 'react'
import { PALETTE } from '../constants'
import { formatDayLabel } from '../utils/date'
import { PlatformIcon } from './PlatformIcons'

const LINE_COLOR = '#3f4a5a'

function PlatformRow({ platforms, className = '' }) {
  if (!platforms || platforms.length === 0) return null
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {platforms.map((p) => (
        <PlatformIcon key={p} id={p} size={26} />
      ))}
    </div>
  )
}

// 1つの配信ブロック（時間・内容・補足・配信サイト）
function Block({ block, showDivider }) {
  const accentColor = block.accent ? block.accentColor : '#2b2f36'
  const centered = !block.time

  const body = (
    <div className="flex flex-col">
      <span className="text-2xl font-bold leading-snug" style={{ color: accentColor }}>
        {block.content || ' '}
      </span>
      {block.note1 && <span className="text-lg leading-snug text-slate-600">{block.note1}</span>}
      {block.note2 && <span className="text-lg leading-snug text-slate-600">{block.note2}</span>}
    </div>
  )

  return (
    <div
      className="flex items-center gap-3 py-2.5"
      style={showDivider ? { borderTop: `1px dashed #c7ccd4` } : undefined}
    >
      {centered ? (
        <div className="flex w-full flex-col items-center justify-center text-center">
          {body}
          <PlatformRow platforms={block.platforms} className="mt-1.5 justify-center" />
        </div>
      ) : (
        <>
          <span
            className="w-28 shrink-0 text-3xl font-semibold tabular-nums"
            style={{ color: accentColor }}
          >
            {block.time}
          </span>
          <div className="flex-1">{body}</div>
          <PlatformRow platforms={block.platforms} className="shrink-0" />
        </>
      )}
    </div>
  )
}

// 1日分の行
function Row({ date, row, isFirst }) {
  const palette = PALETTE[row.colorIndex % PALETTE.length]

  const contentCellStyle = {
    borderLeft: `3px solid ${LINE_COLOR}`,
    borderBottom: `2px solid ${LINE_COLOR}`,
    borderTop: isFirst ? `2px solid ${LINE_COLOR}` : 'none',
  }

  let inner
  if (row.holiday) {
    inner = (
      <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
        <span className="text-3xl">😴</span>
        <span className="text-3xl font-bold tracking-widest">お 休 み</span>
      </div>
    )
  } else {
    inner = (
      <div className="flex flex-col justify-center py-2">
        {row.blocks.map((block, bi) => (
          <Block key={bi} block={block} showDivider={bi > 0} />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* 日付チップ */}
      <div className="flex items-stretch py-1.5 pr-3">
        <div
          className="flex w-full flex-col items-center justify-center rounded-md px-2 py-3"
          style={{ backgroundColor: palette.bg, color: palette.text }}
        >
          <span className="text-lg font-bold leading-none">{formatDayLabel(date)}</span>
        </div>
      </div>
      {/* 内容セル */}
      <div className="px-6" style={contentCellStyle}>
        {inner}
      </div>
    </>
  )
}

const ScheduleCard = forwardRef(function ScheduleCard(
  {
    title,
    titleFont,
    titleSpacing,
    titleColor,
    titleSize,
    titleOffsetX,
    avatar,
    avatarZoom,
    avatarX,
    avatarY,
    dates,
    rows,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className="w-[720px] bg-white px-10 pb-10 pt-8"
      style={{ fontFamily: "'Noto Sans JP', 'M PLUS Rounded 1c', sans-serif" }}
    >
      {/* ヘッダー：アイコン + タイトル */}
      <div className="mb-6 flex items-center gap-2">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[3px] border-slate-800 bg-slate-100">
          {avatar ? (
            <img
              src={avatar}
              alt="icon"
              className="absolute left-1/2 top-1/2 max-w-none"
              style={{
                width: `${avatarZoom * 100}%`,
                height: `${avatarZoom * 100}%`,
                objectFit: 'cover',
                transform: `translate(-50%, -50%) translate(${avatarX}px, ${avatarY}px)`,
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
              📷
            </div>
          )}
        </div>
        <h1
          className="leading-none"
          style={{
            fontFamily: titleFont,
            letterSpacing: `${titleSpacing}px`,
            color: titleColor,
            fontSize: `${titleSize}px`,
            fontWeight: 600,
            transform: `translateX(${titleOffsetX}px)`,
          }}
        >
          {title}
        </h1>
      </div>

      {/* 本体グリッド */}
      <div className="grid" style={{ gridTemplateColumns: '96px 1fr' }}>
        {dates.map((date, i) => (
          <Row key={i} date={date} row={rows[i]} isFirst={i === 0} />
        ))}
      </div>
    </div>
  )
})

export default ScheduleCard
