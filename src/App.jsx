import { useEffect, useMemo, useRef, useState } from 'react'
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

function makeDefaultState() {
  return {
    startDate: toDateInputValue(new Date()),
    dayCount: 7,
    avatar: null,
    avatarZoom: 1,
    avatarX: 0,
    avatarY: 0,
    title: 'WEEK',
    titleFont: "'Poppins', sans-serif",
    titleSpacing: 8,
    titleSize: 110,
    titleColor: DEFAULT_ACCENT,
    titleOffsetX: 0,
  }
}

const STORAGE_KEY = 'stream-schedule-v1'

// ブラウザ（localStorage）に保存した前回の入力を読み込む
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    // 既定値とマージして、項目が欠けていても壊れないようにする
    const state = { ...makeDefaultState(), ...(data.state ?? {}) }
    const rows = Array.isArray(data.rows) && data.rows.length ? data.rows : makeDefaultRows()
    return { state, rows }
  } catch {
    return null
  }
}

export default function App() {
  const saved = loadSaved()
  const [state, setStateRaw] = useState(saved?.state ?? makeDefaultState())
  const [rows, setRows] = useState(saved?.rows ?? makeDefaultRows())
  const [exporting, setExporting] = useState(false)

  // 入力が変わるたびに localStorage へ自動保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, rows }))
    } catch {
      // 画像が大きすぎて容量超過した場合などは保存をスキップ（動作は継続）
    }
  }, [state, rows])

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
    reader.onload = () => setState({ avatar: reader.result, avatarZoom: 1, avatarX: 0, avatarY: 0 })
    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    if (!window.confirm('すべての入力を初期状態に戻します。よろしいですか？（元に戻せません）')) return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 無視
    }
    setStateRaw(makeDefaultState())
    setRows(makeDefaultRows())
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              リセット ↺
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-lg bg-rose-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-60"
            >
              {exporting ? '書き出し中…' : 'PNG画像を保存 ⬇'}
            </button>
          </div>
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
