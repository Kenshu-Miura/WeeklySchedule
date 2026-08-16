import { forwardRef } from 'react'
import { PALETTE } from '../constants'
import { formatDayLabel } from '../utils/date'

const LINE_COLOR = '#3f4a5a'

// 1日分の行
function Row({ date, row, isFirst }) {
  const palette = PALETTE[row.colorIndex % PALETTE.length]
  const accentColor = row.accent ? row.accentColor : '#2b2f36'

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
  } else if (!row.time) {
    // 時間なし → 中央寄せ（「メン限配信のみ」「未定」など）
    inner = (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <span className="text-2xl font-bold" style={{ color: accentColor }}>
          {row.content || ' '}
        </span>
        {row.note1 && <span className="mt-1 text-xl text-slate-600">{row.note1}</span>}
        {row.note2 && <span className="text-xl text-slate-600">{row.note2}</span>}
      </div>
    )
  } else {
    inner = (
      <div className="flex items-center gap-4 py-5">
        <span
          className="w-32 shrink-0 text-3xl font-semibold tabular-nums"
          style={{ color: accentColor }}
        >
          {row.time}
        </span>
        <div className="flex flex-col">
          <span className="text-2xl font-bold leading-snug" style={{ color: accentColor }}>
            {row.content || ' '}
          </span>
          {row.note1 && <span className="text-xl leading-snug text-slate-600">{row.note1}</span>}
          {row.note2 && <span className="text-xl leading-snug text-slate-600">{row.note2}</span>}
        </div>
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
  { title, titleFont, titleSpacing, titleColor, titleSize, avatar, avatarZoom, avatarX, avatarY, dates, rows },
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
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-[3px] border-slate-800 bg-slate-100">
          {avatar ? (
            <img
              src={avatar}
              alt="icon"
              className="h-full w-full object-cover"
              style={{
                transform: `scale(${avatarZoom})`,
                objectPosition: `${avatarX}% ${avatarY}%`,
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
          }}
        >
          {title}
        </h1>
      </div>

      {/* 本体グリッド */}
      <div
        className="grid"
        style={{ gridTemplateColumns: '96px 1fr' }}
      >
        {dates.map((date, i) => (
          <Row key={i} date={date} row={rows[i]} isFirst={i === 0} />
        ))}
      </div>
    </div>
  )
})

export default ScheduleCard
