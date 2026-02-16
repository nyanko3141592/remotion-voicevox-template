import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, Sequence, staticFile, Loop } from "remotion";
import { loadFont } from "@remotion/google-fonts/MPLUSRounded1c";
import { scriptData, scenes, ScriptLine, bgmConfig } from "./data/script";
import { COLORS, VIDEO_CONFIG } from "./config";
import { Subtitle } from "./components/Subtitle";
import { Character } from "./components/Character";
import { SceneVisuals } from "./components/SceneVisuals";

// Google Fontsをロード
const { fontFamily } = loadFont();

// 再生速度を考慮したフレーム数を計算
const getAdjustedFrames = (frames: number): number =>
  Math.ceil(frames / VIDEO_CONFIG.playbackRate);

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 縦動画（ショート等）の場合のみ、下側に黒塗りの安全領域を設ける（字幕/キャラはこの領域を避ける）
  const isVertical = height >= width;
  const safeAreaHeight = isVertical ? 400 : 0;
  const blackboardBottomOffset = isVertical ? safeAreaHeight : 160;

  // 現在のセリフを計算
  let accumulatedFrames = 0;
  let currentLine: ScriptLine | null = null;
  let currentLineStartFrame = 0;
  let currentScene = 1;
  let isSpeaking = false;

  for (const line of scriptData) {
    const adjustedDuration = getAdjustedFrames(line.durationInFrames);
    const adjustedPause = getAdjustedFrames(line.pauseAfter);
    const lineEndFrame = accumulatedFrames + adjustedDuration + adjustedPause;

    if (frame >= accumulatedFrames && frame < lineEndFrame) {
      currentLine = line;
      currentLineStartFrame = accumulatedFrames;
      currentScene = line.scene;
      // 音声再生中は adjustedDuration の間だけ
      isSpeaking = frame < accumulatedFrames + adjustedDuration;
      break;
    }
    accumulatedFrames = lineEndFrame;
    currentScene = line.scene;
  }

  const sceneInfo = scenes.find((s) => s.id === currentScene) || scenes[0];

  // 各セリフの開始フレームを計算
  const getLineStartFrame = (index: number): number => {
    let startFrame = 0;
    for (let i = 0; i < index; i++) {
      startFrame +=
        getAdjustedFrames(scriptData[i].durationInFrames) +
        getAdjustedFrames(scriptData[i].pauseAfter);
    }
    return startFrame;
  };

  // 各セリフの再生速度調整済み長さを取得
  const getLineDuration = (line: ScriptLine): number =>
    getAdjustedFrames(line.durationInFrames);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.background,
        fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      }}
    >
      {/* 下側の黒塗り安全領域（縦動画のみ） */}
      {safeAreaHeight > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: safeAreaHeight,
            background: COLORS.safeArea,
          }}
        />
      )}

      {/* 黒板背景 */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 60,
          right: 60,
          bottom: blackboardBottomOffset,
          background: COLORS.blackboard,
          borderRadius: 8,
        }}
      />
      {/* 黒板の茶色フチ（下部） */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: blackboardBottomOffset,
          height: 24,
          background: COLORS.blackboardBorder,
          borderRadius: "0 0 8px 8px",
        }}
      />
      {/* BGM再生 */}
      {bgmConfig && (
        <Audio
          src={staticFile(`bgm/${bgmConfig.src}`)}
          volume={bgmConfig.volume ?? 0.3}
          loop={bgmConfig.loop ?? true}
        />
      )}

      {/* 音声再生 */}
      {scriptData.map((line, index) => {
        const startFrame = getLineStartFrame(index);
        return (
          <Sequence
            key={`audio-${line.id}`}
            from={startFrame}
            durationInFrames={getLineDuration(line)}
            premountFor={fps}
          >
            <Audio
              src={staticFile(`voices/${line.voiceFile}`)}
              playbackRate={VIDEO_CONFIG.playbackRate}
            />
            {/* 効果音再生 */}
            {line.se && (
              <Audio
                src={staticFile(`se/${line.se.src}`)}
                volume={line.se.volume ?? 1}
              />
            )}
          </Sequence>
        );
      })}

      {/* シーンごとのビジュアル */}
      <SceneVisuals
        scene={currentScene}
        lineId={currentLine?.id ?? null}
        frame={frame}
        fps={fps}
        visual={currentLine?.visual}
      />

      {/* キャラクター */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: safeAreaHeight,
        }}
      >
        <Character
          characterId="metan"
          isSpeaking={isSpeaking && currentLine?.character === "metan"}
          emotion={currentLine?.character === "metan" ? currentLine.emotion : "normal"}
        />
        <Character
          characterId="zundamon"
          isSpeaking={isSpeaking && currentLine?.character === "zundamon"}
          emotion={currentLine?.character === "zundamon" ? currentLine.emotion : "normal"}
        />
      </div>

      {/* 字幕 */}
      {currentLine && (
        <Sequence
          key={`subtitle-${currentLine.id}`}
          from={currentLineStartFrame}
          durationInFrames={getLineDuration(currentLine)}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: safeAreaHeight,
            }}
          >
            <Subtitle
              text={currentLine.displayText ?? currentLine.text}
              character={currentLine.character}
            />
          </div>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
