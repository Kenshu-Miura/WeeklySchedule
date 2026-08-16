// html-to-image で PNG 書き出しする際、Google Fonts（クロスオリジン）の
// スタイルシートは JS から cssRules を読めずフォント埋め込みが失敗する。
// そこで CSS 本文を自前で fetch し、Latin サブセット（タイトルフォントに必要）だけ
// woff2 を data URI 化して @font-face を組み立て、fontEmbedCSS として渡す。
// 日本語（Noto Sans JP 等）はサブセットが非常に多く重いため埋め込まず、
// 書き出し時は端末のシステム日本語フォントにフォールバックさせる。

let cachedCss = null

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function getFontEmbedCss() {
  if (cachedCss !== null) return cachedCss

  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter((l) =>
    l.href.includes('fonts.googleapis.com'),
  )

  let result = ''

  for (const link of links) {
    try {
      const cssText = await (await fetch(link.href)).text()

      // 「/* subset */ @font-face { ... }」のペアを抽出
      const blockRegex = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g
      let match
      while ((match = blockRegex.exec(cssText)) !== null) {
        const subset = match[1]
        let block = match[2]
        // タイトル文字・数字に必要な Latin 系のみ埋め込む（軽量化）
        if (subset !== 'latin' && subset !== 'latin-ext') continue

        const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/)
        if (urlMatch) {
          try {
            const fontBlob = await (await fetch(urlMatch[1])).blob()
            const dataUrl = await blobToDataUrl(fontBlob)
            block = block.replace(urlMatch[1], dataUrl)
          } catch {
            // 個別フォントの取得失敗は無視（そのブロックはスキップ）
            continue
          }
        }
        result += block + '\n'
      }
    } catch {
      // スタイルシート取得失敗は無視
    }
  }

  cachedCss = result
  return result
}
