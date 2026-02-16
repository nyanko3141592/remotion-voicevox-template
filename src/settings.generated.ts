// このファイルは自動生成されます
// 編集する場合は video-settings.yaml を編集してください
// npm run sync-settings で再生成されます

export const SETTINGS = {
  "font": {
    "family": "M PLUS Rounded 1c",
    "size": 70,
    "weight": "900",
    "color": "#ffffff",
    "outlineColor": "character",
    "innerOutlineColor": "none"
  },
  "subtitle": {
    "bottomOffset": 40,
    "maxWidthPercent": 55,
    "maxWidthPixels": 1000,
    "outlineWidth": 14,
    "innerOutlineWidth": 8
  },
  "character": {
    "height": 275,
    "psdPaths": {
      "zundamon": "images/zunda_psd/ずんだもん立ち絵素材2.3.psd"
    },
    "useImages": true,
    "imagesBasePath": "images"
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
    "background": "#ffffff",
    "text": "#ffffff",
    "zundamon": "#228B22",
    "metan": "#FF1493"
  }
} as const;

// キャラクターごとの利用可能な画像ファイル
export const AVAILABLE_IMAGES: Record<string, string[]> = {
  "kuro_zunda": [
    "mouth_close.png",
    "mouth_open.png"
  ],
  "metan": [
    "mouth_close.png",
    "mouth_open.png"
  ],
  "zunda_psd": [],
  "zundamon": [
    "mouth_close.png",
    "mouth_open.png"
  ]
};

export type VideoSettings = typeof SETTINGS;
