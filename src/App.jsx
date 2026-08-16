import { useEffect, useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import Editor from './components/Editor'
import ScheduleCard from './components/ScheduleCard'
import ScaledPreview from './components/ScaledPreview'
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

// 画面幅が lg(1024px) 以上か（＝PCレイアウトか）を判定
function useIsDesktop() {
  const query = '(min-width: 1024px)'
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setIsDesktop(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return isDesktop
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
  const isDesktop = useIsDesktop()

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

  // 操作パネルとプレビューは1つだけ定義し、PC/スマホどちらのレイアウトでも使い回す
  const editorEl = (
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
  )

  const cardEl = (
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
  )

  return (
    <div className="min-h-full">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <h1 className="min-w-0 truncate text-base font-bold text-slate-800 sm:text-lg">
            🎬 配信スケジュールメーカー
          </h1>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 sm:px-4 sm:text-sm"
            >
              リセット<span className="hidden sm:inline"> ↺</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-60 sm:px-5 sm:text-sm"
            >
              {exporting ? '書き出し中…' : 'PNG保存 ⬇'}
            </button>
          </div>
        </div>
      </header>

      {isDesktop ? (
        // ===== PC：左に操作パネル / 右にプレビュー（従来のまま） =====
        <main className="mx-auto grid max-w-7xl grid-cols-[380px_1fr] gap-6 px-4 py-6">
          <div className="max-h-[calc(100vh-120px)] overflow-y-auto pr-1">{editorEl}</div>
          <div className="flex justify-center">
            <div className="w-full overflow-x-auto">
              <div className="mx-auto w-fit rounded-xl bg-slate-200 p-4 shadow-inner">
                <div className="shadow-xl">{cardEl}</div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        // ===== スマホ：上にプレビューを固定表示 / 下に操作パネル =====
        <main className="px-3 py-3">
          <div className="sticky top-0 z-20 -mx-3 mb-3 border-b border-slate-200 bg-slate-100/95 px-3 pb-2 pt-2 backdrop-blur">
            <div className="mb-1 text-center text-[11px] font-bold text-slate-400">
              プレビュー（操作するとすぐ反映されます）
            </div>
            <div className="rounded-lg bg-slate-200 p-2 shadow-inner">
              <div className="shadow">
                <ScaledPreview>{cardEl}</ScaledPreview>
              </div>
            </div>
          </div>
          <div>{editorEl}</div>
        </main>
      )}
    </div>
  )
}
