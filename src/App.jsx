import { useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import Editor from './components/Editor'
import ScheduleCard from './components/ScheduleCard'
import { DEFAULT_ACCENT, MAX_DAYS, MAX_BLOCKS } from './constants'
import { buildDates, toDateInputValue } from './utils/date'
import { getFontEmbedCss } from './utils/fontEmbed'

function makeBlock(sample = {}) {
  return {
    time: sample.time ?? '',
    content: sample.content ?? '',
    note1: sample.note1 ?? '',
    note2: sample.note2 ?? '',
    accent: sample.accent ?? false,
    accentColor: DEFAULT_ACCENT,
    platforms: sample.platforms ?? [],
  }
}

function makeDefaultRows() {
  return Array.from({ length: MAX_DAYS }, (_, i) => ({
    holiday: false,
    // 見本と同じ 4 色ローテーション（ピンク→グリーン→オレンジ→ローズ）
    colorIndex: i % 4,
    // 初期値は空（時間・内容・補足・配信サイトすべて未入力）
    blocks: [makeBlock()],
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
    titleOffsetX: 0,
  })
  const [rows, setRows] = useState(makeDefaultRows)
  const [exporting, setExporting] = useState(false)

  const cardRef = useRef(null)

  const setState = (patch) => setStateRaw((prev) => ({ ...prev, ...patch }))

  const updateRow = (index, patch) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  const updateBlock = (rowIndex, blockIndex, patch) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIndex
          ? { ...r, blocks: r.blocks.map((b, j) => (j === blockIndex ? { ...b, ...patch } : b)) }
          : r,
      ),
    )

  const addBlock = (rowIndex) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIndex && r.blocks.length < MAX_BLOCKS
          ? { ...r, blocks: [...r.blocks, makeBlock()] }
          : r,
      ),
    )

  const removeBlock = (rowIndex, blockIndex) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIndex && r.blocks.length > 1
          ? { ...r, blocks: r.blocks.filter((_, j) => j !== blockIndex) }
          : r,
      ),
    )

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
            updateBlock={updateBlock}
            addBlock={addBlock}
            removeBlock={removeBlock}
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
                  titleOffsetX={state.titleOffsetX}
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
