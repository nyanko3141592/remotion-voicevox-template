import { SETTINGS } from "./settings.generated";

// 動画設定
export const VIDEO_CONFIG = {
  width: SETTINGS.video.width,
  height: SETTINGS.video.height,
  fps: SETTINGS.video.fps,
  playbackRate: SETTINGS.video.playbackRate, // 再生速度（音声生成時に考慮）
};

// カラーパレット（黒板風デザイン）
export const COLORS = {
  background: "#ffffff",      // 外側の白背景
  blackboard: "#2d5a3d",      // 黒板の緑
  blackboardBorder: "#8B4513", // 黒板の茶色フチ
  safeArea: "#000000",        // ショート向け下側の安全余白（黒）
  text: "#ffffff",            // 白文字
  textMuted: "#e0e0e0",
  primary: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  pink: "#ec4899",
  zundamon: "#228B22",        // フォレストグリーン（暗め）
  metan: "#FF1493",           // ディープピンク
};

// キャラクター定義
export type CharacterId = "zundamon" | "metan";

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  voicevoxSpeakerId: number;
  position: "left" | "right";
  color: string;
  // 画像設定（口パクアニメーション用）
  images: {
    mouthOpen: string; // 口開き画像パス
    mouthClose: string; // 口閉じ画像パス
  };
  flipX?: boolean; // 画像を左右反転するか
}

// デフォルトキャラクター設定
// めたん: 左下、ずんだもん: 右下
export const DEFAULT_CHARACTERS: CharacterConfig[] = [
  {
    id: "metan",
    name: "四国めたん",
    voicevoxSpeakerId: 2,
    position: "left",
    color: COLORS.metan,
    images: {
      mouthOpen: "images/metan/mouth_open.png",
      mouthClose: "images/metan/mouth_close.png",
    },
    flipX: true, // 元画像が左向きなので右向きに反転
  },
  {
    id: "zundamon",
    name: "ずんだもん",
    voicevoxSpeakerId: 3,
    position: "right",
    color: COLORS.zundamon,
    images: {
      mouthOpen: "images/zundamon/mouth_open.png",
      mouthClose: "images/zundamon/mouth_close.png",
    },
    flipX: false,
  },
];

// キャラクターIDからspeakerIdを取得するマップ
export const characterSpeakerMap: Record<CharacterId, number> = {
  zundamon: 3,
  metan: 2,
};

// シーン背景タイプ
export type BackgroundType = "gradient" | "solid" | "image";

export interface SceneConfig {
  id: number;
  title: string;
  background: BackgroundType;
  backgroundColor?: string;
  backgroundImage?: string;
}

// VOICEVOX設定
export const VOICEVOX_CONFIG = {
  host: "http://localhost:50021",
  defaultSpeedScale: 1.0,
  defaultPitchScale: 0.0,
  defaultIntonationScale: 1.0,
  defaultVolumeScale: 1.0,
};
