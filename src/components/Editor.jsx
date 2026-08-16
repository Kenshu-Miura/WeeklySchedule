import { PALETTE, TITLE_FONTS, MAX_DAYS } from '../constants'
import { toDateInputValue, buildDates, formatDayLabel } from '../utils/date'

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

export default function Editor({ state, setState, rows, updateRow, dates, onAvatarUpload }) {
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
            <div className="grid grid-cols-2 gap-2">
              <Field label={`左右位置：${s.avatarX}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.avatarX}
                  className="w-full"
                  onChange={(e) => setState({ avatarX: Number(e.target.value) })}
                />
              </Field>
              <Field label={`上下位置：${s.avatarY}%`}>
                <input
                  type="range"
                  min={0}
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
                  <span className="text-sm font-bold text-slate-700">
                    {formatDayLabel(date)}
                  </span>
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
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="配信時間">
                        <input
                          type="text"
                          placeholder="19:00"
                          className={inputCls}
                          value={row.time}
                          onChange={(e) => updateRow(i, { time: e.target.value })}
                        />
                      </Field>
                      <div className="col-span-2">
                        <Field label="配信内容">
                          <input
                            type="text"
                            placeholder="ドラクエ10"
                            className={inputCls}
                            value={row.content}
                            onChange={(e) => updateRow(i, { content: e.target.value })}
                          />
                        </Field>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="補足1行目">
                        <input
                          type="text"
                          placeholder="（短め配信）"
                          className={inputCls}
                          value={row.note1}
                          onChange={(e) => updateRow(i, { note1: e.target.value })}
                        />
                      </Field>
                      <Field label="補足2行目">
                        <input
                          type="text"
                          className={inputCls}
                          value={row.note2}
                          onChange={(e) => updateRow(i, { note2: e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <input
                          type="checkbox"
                          checked={row.accent}
                          onChange={(e) => updateRow(i, { accent: e.target.checked })}
                        />
                        文字を強調（色付き）
                      </label>
                      {row.accent && (
                        <input
                          type="color"
                          className="h-6 w-10 cursor-pointer rounded border border-slate-300"
                          value={row.accentColor}
                          onChange={(e) => updateRow(i, { accentColor: e.target.value })}
                        />
                      )}
                    </div>
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
