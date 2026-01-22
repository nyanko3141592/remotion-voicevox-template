import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadDefaultJapaneseParser } from "budoux";
import { useMemo } from "react";
import { CharacterId } from "../config";
import { SETTINGS } from "../settings.generated";

// BudouXパーサーを初期化（日本語の自然な改行位置を計算）
const parser = loadDefaultJapaneseParser();

interface SubtitleProps {
  text: string;
  character: CharacterId;
}

// BudouXで分割したテキストをレンダリングするコンポーネント
const BudouXText = ({ text, style }: { text: string; style: React.CSSProperties }) => {
  const segments = useMemo(() => parser.parse(text), [text]);

  return (
    <span style={style}>
      {segments.map((segment, index) => (
        <span
          key={index}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
        >
          {segment}
        </span>
      ))}
    </span>
  );
};

export const Subtitle: React.FC<SubtitleProps> = ({ text, character }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 設定から値を取得
  const { font, subtitle, colors } = SETTINGS;

  // フェードインアニメーション
  const opacity = interpolate(frame, [0, fps * 0.15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // キャラクター色を取得
  const characterColor = character === "zundamon" ? colors.zundamon : colors.metan;

  // フォント色の決定
  const getColor = (colorValue: string) => {
    if (colorValue === "character") {
      return characterColor;
    }
    return colorValue;
  };

  const textColor = getColor(font.color);
  const outerOutlineColor = getColor(font.outlineColor);
  const innerOutlineColorValue = getColor(font.innerOutlineColor);

  const baseTextStyle: React.CSSProperties = {
    fontSize: font.size,
    fontWeight: font.weight as React.CSSProperties["fontWeight"],
    lineHeight: 1.5,
    fontFamily: `'${font.family}', 'Hiragino Kaku Gothic ProN', sans-serif`,
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: subtitle.bottomOffset,
        left: "50%",
        transform: "translateX(-50%)",
        opacity,
        width: `${subtitle.maxWidthPercent}%`,
        maxWidth: subtitle.maxWidthPixels,
        textAlign: "center",
      }}
    >
      {/* 袋文字（アウトライン付きテキスト） */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {/* 外側アウトライン */}
        <BudouXText
          text={text}
          style={{
            ...baseTextStyle,
            position: "absolute",
            left: 0,
            top: 0,
            color: "transparent",
            WebkitTextStroke: `${subtitle.outlineWidth}px ${outerOutlineColor}`,
            paintOrder: "stroke fill",
          }}
        />
        {/* 内側アウトライン（キャラクター色） */}
        <BudouXText
          text={text}
          style={{
            ...baseTextStyle,
            position: "absolute",
            left: 0,
            top: 0,
            color: "transparent",
            WebkitTextStroke: `${subtitle.innerOutlineWidth}px ${innerOutlineColorValue}`,
            paintOrder: "stroke fill",
          }}
        />
        {/* メインテキスト */}
        <BudouXText
          text={text}
          style={{
            ...baseTextStyle,
            position: "relative",
            color: textColor,
          }}
        />
      </div>
    </div>
  );
};
