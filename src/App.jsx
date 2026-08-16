import { useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import Editor from './components/Editor'
import ScheduleCard from './components/ScheduleCard'
import { DEFAULT_ACCENT, MAX_DAYS } from './constants'
import { buildDates, toDateInputValue } from './utils/date'
import { getFontEmbedCss } from './utils/fontEmbed'

// 画像の見本に近いサンプル初期内容（自由に書き換え可能）
const SAMPLE = [
  { time: '19:00', content: 'ドラクエ10', note1: '（短め配信）', accent: true },
  { time: '19:00', content: 'ドラクエ10', note1: '（短め配信）', accent: true },
  { time: '21:00', content: 'ドラクエ10', note1: '（長時間の日！）', accent: true },
  { time: '', content: 'メン限配信のみ', note1: '' },
  { time: '', content: '未定', note1: '（配信やる予定ではあります！）' },
  { time: '', content: 'メン限配信のみ', note1: '' },
  { time: '19:00', content: 'フォートナイト', note1: '（長時間の日！）' },
]

function makeDefaultRows() {
  return Array.from({ length: MAX_DAYS }, (_, i) => ({
    time: SAMPLE[i]?.time ?? '',
    content: SAMPLE[i]?.content ?? '',
    note1: SAMPLE[i]?.note1 ?? '',
    note2: '',
    holiday: false,
    accent: SAMPLE[i]?.accent ?? false,
    accentColor: DEFAULT_ACCENT,
    // 見本と同じ 4 色ローテーション（ピンク→グリーン→オレンジ→ローズ）
    colorIndex: i % 4,
  }))
}

export default function App() {
  const [state, setStateRaw] = useState({
    startDate: toDateInputValue(new Date()),
    dayCount: 7,
    avatar: null,
    avatarZoom: 1,
    avatarX: 50,
    avatarY: 50,
    title: 'WEEK',
    titleFont: "'Poppins', sans-serif",
    titleSpacing: 8,
    titleSize: 110,
    titleColor: DEFAULT_ACCENT,
  })
  const [rows, setRows] = useState(makeDefaultRows)
  const [exporting, setExporting] = useState(false)

  const cardRef = useRef(null)

  const setState = (patch) => setStateRaw((prev) => ({ ...prev, ...patch }))

  const updateRow = (index, patch) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  const dates = useMemo(
    () => buildDates(state.startDate, state.dayCount),
    [state.startDate, state.dayCount],
  )

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setState({ avatar: reader.result, avatarZoom: 1, avatarX: 50, avatarY: 50 })
    reader.readAsDataURL(file)
  }

  const handleExport = async () => {
    if (!cardRef.current) return
    setExporting(true)
    try {
      // フォント（タイトル用 Latin）を確実に埋め込む
      await document.fonts.ready
      const fontEmbedCSS = await getFontEmbedCss()
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#ffffff',
        fontEmbedCSS,
      })
      const link = document.createElement('a')
      link.download = `schedule_${state.startDate}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error(err)
      alert('画像の書き出しに失敗しました。もう一度お試しください。')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-slate-800">
            🎬 配信スケジュールメーカー
          </h1>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-60"
          >
            {exporting ? '書き出し中…' : 'PNG画像を保存 ⬇'}
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[380px_1fr]">
        {/* 左：編集パネル */}
        <div className="lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-1">
          <Editor
            state={state}
            setState={setState}
            rows={rows}
            updateRow={updateRow}
            dates={dates}
            onAvatarUpload={handleAvatarUpload}
          />
        </div>

        {/* 右：プレビュー */}
        <div className="flex justify-center">
          <div className="w-full overflow-x-auto">
            <div className="mx-auto w-fit rounded-xl bg-slate-200 p-4 shadow-inner">
              <div className="shadow-xl">
                <ScheduleCard
                  ref={cardRef}
                  title={state.title}
                  titleFont={state.titleFont}
                  titleSpacing={state.titleSpacing}
                  titleColor={state.titleColor}
                  titleSize={state.titleSize}
                  avatar={state.avatar}
                  avatarZoom={state.avatarZoom}
                  avatarX={state.avatarX}
                  avatarY={state.avatarY}
                  dates={dates}
                  rows={rows}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
