// このファイルは自動生成されます
// 編集する場合は video-settings.yaml を編集してください
// npm run sync-settings で再生成されます

export const SETTINGS = {
  "font": {
    "family": "Noto Sans JP",
    "size": 48,
    "weight": "bold",
    "color": "#ffffff",
    "outlineColor": "#000000",
    "innerOutlineColor": "character"
  },
  "subtitle": {
    "bottomOffset": 40,
    "maxWidthPercent": 55,
    "maxWidthPixels": 1000,
    "outlineWidth": 14,
    "innerOutlineWidth": 8
  },
  "character": {
    "height": 367,
    "useImages": false
  },
  "content": {
    "topPadding": 0,
    "sidePadding": 0,
    "bottomPadding": 0
  },
  "video": {
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "playbackRate": 1.2
  },
  "colors": {
    "background": "#f8fafc",
    "text": "#1e293b",
    "zundamon": "#059669",
    "metan": "#db2777"
  }
} as const;

export type VideoSettings = typeof SETTINGS;
