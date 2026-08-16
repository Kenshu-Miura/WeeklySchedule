// 配信サイトのアイコン（インラインSVG＝PNG書き出し時もそのまま描画される）

export const PLATFORMS = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitch', label: 'Twitch' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'x', label: 'X' },
  { id: 'nico', label: 'ニコニコ' },
]

function YouTubeIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="YouTube">
      <rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#FF0000" />
      <path d="M10 8.5 L16 12 L10 15.5 Z" fill="#ffffff" />
    </svg>
  )
}

function TwitchIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Twitch">
      <path
        d="M4 3 H20 V14 L16 18 H12 L9 21 V18 H4 Z"
        fill="#9146FF"
      />
      <rect x="10" y="7" width="1.8" height="5" fill="#ffffff" />
      <rect x="14.5" y="7" width="1.8" height="5" fill="#ffffff" />
    </svg>
  )
}

function TikTokIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="TikTok">
      <rect width="24" height="24" rx="6" fill="#000000" />
      <path
        d="M14.2 5.5c.25 1.9 1.35 3.1 3.2 3.35v2.2c-1.15-.05-2.2-.45-3.1-1.1v4.75a3.85 3.85 0 1 1-3.85-3.85c.27 0 .53.03.78.08v2.35a1.55 1.55 0 1 0 1.12 1.49V5.5z"
        fill="#ffffff"
      />
    </svg>
  )
}

function XIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="X">
      <rect width="24" height="24" rx="6" fill="#000000" />
      <path
        d="M7 6 L11 11.3 L6.8 18 H8.6 L11.8 12.8 L15.6 18 H18.3 L13.6 11.6 L17.4 6 H15.6 L12.9 10.1 L9.7 6 Z"
        fill="#ffffff"
      />
    </svg>
  )
}

function NicoIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="niconico">
      <rect width="24" height="24" rx="6" fill="#252525" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="700"
        fill="#ffffff"
        fontFamily="sans-serif"
      >
        ニコ
      </text>
    </svg>
  )
}

const MAP = {
  youtube: YouTubeIcon,
  twitch: TwitchIcon,
  tiktok: TikTokIcon,
  x: XIcon,
  nico: NicoIcon,
}

export function PlatformIcon({ id, size = 26 }) {
  const Comp = MAP[id]
  return Comp ? <Comp size={size} /> : null
}
