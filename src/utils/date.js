import { WEEKDAY_JP } from '../constants'

// 'YYYY-MM-DD' 形式（input[type=date] 用）を返す
export function toDateInputValue(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 'YYYY-MM-DD' をローカル日付の Date に変換（タイムゾーンずれ防止）
export function parseDateInput(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// 開始日から count 日分の日付配列を生成
export function buildDates(startValue, count) {
  const start = parseDateInput(startValue)
  const dates = []
  for (let i = 0; i < count; i++) {
    const dt = new Date(start)
    dt.setDate(start.getDate() + i)
    dates.push(dt)
  }
  return dates
}

// 「8(土)」のような表示ラベル
export function formatDayLabel(date) {
  return `${date.getDate()}(${WEEKDAY_JP[date.getDay()]})`
}
