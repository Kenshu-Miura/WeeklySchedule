import { PALETTE, TITLE_FONTS, MAX_DAYS, MAX_BLOCKS } from '../constants'
import { toDateInputValue, formatDayLabel } from '../utils/date'
import { PLATFORMS, PlatformIcon } from './PlatformIcons'

function Section({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-700">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300'

// 1つの配信ブロックの編集UI
function BlockEditor({ block, rowIndex, blockIndex, blockCount, updateBlock, removeBlock }) {
  const togglePlatform = (pid) => {
    const has = block.platforms.includes(pid)
    const next = has ? block.platforms.filter((p) => p !== pid) : [...block.platforms, pid]
    updateBlock(rowIndex, blockIndex, { platforms: next })
  }

  return (
    <div className="rounded-lg bg-slate-50 p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">配信 {blockIndex + 1}</span>
        {blockCount > 1 && (
          <button
            type="button"
            onClick={() => removeBlock(rowIndex, blockIndex)}
            className="text-xs font-bold text-rose-500 hover:text-rose-600"
          >
            削除 ✕
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Field label="配信時間">
            <input
              type="text"
              className={inputCls}
              value={block.time}
              onChange={(e) => updateBlock(rowIndex, blockIndex, { time: e.target.value })}
            />
          </Field>
          <div className="col-span-2">
            <Field label="配信内容">
              <input
                type="text"
                className={inputCls}
                value={block.content}
                onChange={(e) => updateBlock(rowIndex, blockIndex, { content: e.target.value })}
              />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="補足1行目">
            <input
              type="text"
              className={inputCls}
              value={block.note1}
              onChange={(e) => updateBlock(rowIndex, blockIndex, { note1: e.target.value })}
            />
          </Field>
          <Field label="補足2行目">
            <input
              type="text"
              className={inputCls}
              value={block.note2}
              onChange={(e) => updateBlock(rowIndex, blockIndex, { note2: e.target.value })}
            />
          </Field>
        </div>

        {/* 配信サイト */}
        <div>
          <span className="mb-1 block text-xs font-medium text-slate-500">
            配信サイト（複数選択で同時配信）
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => {
              const active = block.platforms.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium transition ${
                    active
                      ? 'border-slate-800 bg-white text-slate-800'
                      : 'border-slate-200 bg-white text-slate-400 opacity-60'
                  }`}
                >
                  <PlatformIcon id={p.id} size={16} />
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 強調色 */}
        <div className="flex flex-wrap items-center gap-3 pt-0.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <input
              type="checkbox"
              checked={block.accent}
              onChange={(e) => updateBlock(rowIndex, blockIndex, { accent: e.target.checked })}
            />
            文字を強調（色付き）
          </label>
          {block.accent && (
            <input
              type="color"
              className="h-6 w-10 cursor-pointer rounded border border-slate-300"
              value={block.accentColor}
              onChange={(e) => updateBlock(rowIndex, blockIndex, { accentColor: e.target.value })}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function Editor({
  state,
  setState,
  rows,
  updateRow,
  updateBlock,
  addBlock,
  removeBlock,
  dates,
  onAvatarUpload,
}) {
  const s = state

  return (
    <div className="space-y-4">
      {/* 基本設定 */}
      <Section title="① 期間・日付">
        <Field label="開始日">
          <div className="flex gap-2">
            <input
              type="date"
              className={inputCls}
              value={s.startDate}
              onChange={(e) => setState({ startDate: e.target.value })}
            />
            <button
              type="button"
              className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
              onClick={() => setState({ startDate: toDateInputValue(new Date()) })}
            >
              今日
            </button>
          </div>
        </Field>
        <Field label={`日数：${s.dayCount}日間`}>
          <input
            type="range"
            min={1}
            max={MAX_DAYS}
            value={s.dayCount}
            className="w-full"
            onChange={(e) => setState({ dayCount: Number(e.target.value) })}
          />
        </Field>
      </Section>

      {/* アイコン */}
      <Section title="② 配信者アイコン（丸型）">
        <Field label="画像をアップロード">
          <input type="file" accept="image/*" className="w-full text-xs" onChange={onAvatarUpload} />
        </Field>
        {s.avatar && (
          <>
            <Field label={`ズーム：${s.avatarZoom.toFixed(2)}倍`}>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={s.avatarZoom}
                className="w-full"
                onChange={(e) => setState({ avatarZoom: Number(e.target.value) })}
              />
            </Field>
            <p className="text-[11px] leading-tight text-slate-400">
              ※ 位置調整はズームを上げると動かせる範囲が広がります
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label={`左右位置：${s.avatarX}px`}>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={s.avatarX}
                  className="w-full"
                  onChange={(e) => setState({ avatarX: Number(e.target.value) })}
                />
              </Field>
              <Field label={`上下位置：${s.avatarY}px`}>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={s.avatarY}
                  className="w-full"
                  onChange={(e) => setState({ avatarY: Number(e.target.value) })}
                />
              </Field>
            </div>
          </>
        )}
      </Section>

      {/* タイトル */}
      <Section title="③ タイトル文字（WEEK）">
        <Field label="文字">
          <input
            type="text"
            className={inputCls}
            value={s.title}
            onChange={(e) => setState({ title: e.target.value })}
          />
        </Field>
        <Field label="フォント">
          <select
            className={inputCls}
            value={s.titleFont}
            onChange={(e) => setState({ titleFont: e.target.value })}
          >
            {TITLE_FONTS.map((f) => (
              <option key={f.css} value={f.css}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label={`字間：${s.titleSpacing}px`}>
            <input
              type="range"
              min={-10}
              max={60}
              value={s.titleSpacing}
              className="w-full"
              onChange={(e) => setState({ titleSpacing: Number(e.target.value) })}
            />
          </Field>
          <Field label={`サイズ：${s.titleSize}px`}>
            <input
              type="range"
              min={48}
              max={160}
              value={s.titleSize}
              className="w-full"
              onChange={(e) => setState({ titleSize: Number(e.target.value) })}
            />
          </Field>
        </div>
        <Field label={`左右位置：${s.titleOffsetX}px`}>
          <input
            type="range"
            min={-120}
            max={220}
            value={s.titleOffsetX}
            className="w-full"
            onChange={(e) => setState({ titleOffsetX: Number(e.target.value) })}
          />
        </Field>
        <Field label="文字色">
          <input
            type="color"
            className="h-9 w-full cursor-pointer rounded-lg border border-slate-300"
            value={s.titleColor}
            onChange={(e) => setState({ titleColor: e.target.value })}
          />
        </Field>
      </Section>

      {/* 各日の内容 */}
      <Section title="④ 各日の配信内容">
        <div className="space-y-4">
          {dates.map((date, i) => {
            const row = rows[i]
            return (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{formatDayLabel(date)}</span>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={row.holiday}
                      onChange={(e) => updateRow(i, { holiday: e.target.checked })}
                    />
                    お休み
                  </label>
                </div>

                {!row.holiday && (
                  <div className="space-y-2">
                    {row.blocks.map((block, bi) => (
                      <BlockEditor
                        key={bi}
                        block={block}
                        rowIndex={i}
                        blockIndex={bi}
                        blockCount={row.blocks.length}
                        updateBlock={updateBlock}
                        removeBlock={removeBlock}
                      />
                    ))}
                    {row.blocks.length < MAX_BLOCKS && (
                      <button
                        type="button"
                        onClick={() => addBlock(i)}
                        className="w-full rounded-lg border border-dashed border-slate-300 py-1.5 text-xs font-bold text-slate-500 hover:border-rose-300 hover:text-rose-500"
                      >
                        ＋ 配信を追加（この日 最大{MAX_BLOCKS}件）
                      </button>
                    )}
                  </div>
                )}

                {/* 色選択 */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">色</span>
                  {PALETTE.map((p, pi) => (
                    <button
                      key={pi}
                      type="button"
                      title={p.name}
                      onClick={() => updateRow(i, { colorIndex: pi })}
                      className={`h-5 w-5 rounded-full border-2 ${
                        row.colorIndex === pi ? 'border-slate-700' : 'border-white'
                      }`}
                      style={{ backgroundColor: p.bg }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
