import { Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, delayRender, continueRender } from "remotion";
import { DEFAULT_CHARACTERS, CharacterId } from "../config";
import { SETTINGS, AVAILABLE_IMAGES } from "../settings.generated";
import { useEffect, useMemo, useState } from "react";

type PsdAny = any;

const isMouthLayerName = (name: string) => {
  const n = name.toLowerCase();
  return n.includes("mouth") || name.includes("口") || name.includes("くち");
};

const isMouthOpenName = (name: string) => {
  const n = name.toLowerCase();
  return n.includes("open") || name.includes("開") || name.includes("あ");
};

const isMouthCloseName = (name: string) => {
  const n = name.toLowerCase();
  return n.includes("close") || name.includes("閉") || name.includes("い");
};

type LeafLayer = {
  name?: string;
  hidden?: boolean;
  canvas?: HTMLCanvasElement;
  left?: number;
  top?: number;
  children?: LeafLayer[];
};

const collectLeafLayers = (node: LeafLayer, parentHidden = false): LeafLayer[] => {
  const hidden = parentHidden || Boolean(node.hidden);
  if (node.children && node.children.length > 0) {
    // draw order: bottom -> top
    return node.children.flatMap((child) => collectLeafLayers(child, hidden));
  }
  if (hidden) return [];
  if (!node.canvas) return [];
  return [node];
};

const renderComposite = (
  psd: { width: number; height: number; children?: LeafLayer[] },
  includeMouthLayer: LeafLayer | null
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = psd.width;
  canvas.height = psd.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const roots = psd.children ?? [];
  const leafLayers = roots.flatMap((r) => collectLeafLayers(r, false));

  const mouthLayers = leafLayers.filter((l) => isMouthLayerName(l.name ?? ""));
  const include = includeMouthLayer;

  // Best-effort: draw from bottom to top
  for (const layer of leafLayers.slice().reverse()) {
    const isMouth = mouthLayers.includes(layer);
    if (isMouth) {
      if (!include || layer !== include) continue;
    }

    const left = layer.left ?? 0;
    const top = layer.top ?? 0;
    ctx.drawImage(layer.canvas as HTMLCanvasElement, left, top);
  }

  return canvas;
};

const usePsdMouthVariants = (psdPublicPath: string | undefined) => {
  const [variants, setVariants] = useState<{ open: string; close: string } | null>(null);

  const renderHandle = useMemo(() => {
    if (!psdPublicPath) return null;
    return delayRender(`load-psd:${psdPublicPath}`);
  }, [psdPublicPath]);

  useEffect(() => {
    if (!psdPublicPath) return;
    let cancelled = false;

    (async () => {
      try {
        const url = staticFile(psdPublicPath);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch PSD (${res.status}): ${url}`);
        }
        const buffer = await res.arrayBuffer();

        const mod = (await import("ag-psd")) as PsdAny;
        const psd = mod.readPsd(buffer) as { width: number; height: number; children?: LeafLayer[] };

        const roots = psd.children ?? [];
        const leafLayers = roots.flatMap((r) => collectLeafLayers(r, false));
        const mouthCandidates = leafLayers.filter((l) => isMouthLayerName(l.name ?? ""));

        const openLayer = mouthCandidates.find((l) => isMouthOpenName(l.name ?? "")) ?? mouthCandidates[0] ?? null;
        const closeLayer = mouthCandidates.find((l) => isMouthCloseName(l.name ?? "")) ?? mouthCandidates[1] ?? mouthCandidates[0] ?? null;

        const openCanvas = renderComposite(psd, openLayer);
        const closeCanvas = renderComposite(psd, closeLayer);

        const open = openCanvas.toDataURL("image/png");
        const close = closeCanvas.toDataURL("image/png");

        if (!cancelled) {
          setVariants({ open, close });
        }
      } catch (e) {
        console.error("Failed to load PSD:", e);
      } finally {
        if (renderHandle) {
          continueRender(renderHandle);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [psdPublicPath, renderHandle]);

  return variants;
};

interface CharacterProps {
  characterId: CharacterId;
  isSpeaking: boolean;
  emotion?: string;
}

// 表情に応じた画像ファイル名を取得（存在チェック付き）
const getImageFileName = (
  characterId: string,
  emotion: string,
  mouthOpen: boolean
): string => {
  const state = mouthOpen ? "open" : "close";
  const availableFiles = AVAILABLE_IMAGES[characterId] || [];

  // 通常表情またはemotionがない場合
  if (emotion === "normal" || !emotion) {
    return `mouth_${state}.png`;
  }

  // 表情差分を試す: {emotion}_open.png, {emotion}_close.png
  const emotionFile = `${emotion}_${state}.png`;
  if (availableFiles.includes(emotionFile)) {
    return emotionFile;
  }

  // 表情の口開き画像だけある場合（口閉じがない）、口開き画像を使う
  const emotionOpenFile = `${emotion}_open.png`;
  if (availableFiles.includes(emotionOpenFile)) {
    return emotionOpenFile;
  }

  // 表情差分がない場合はデフォルトにフォールバック
  return `mouth_${state}.png`;
};

export const Character: React.FC<CharacterProps> = ({
  characterId,
  isSpeaking,
  emotion = "normal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const characterConfig = DEFAULT_CHARACTERS.find((c) => c.id === characterId);

  if (!characterConfig) {
    return null;
  }

  const isLeft = characterConfig.position === "left";

  // 口パクアニメーション（話している時、約6fpsで口を開閉）
  const mouthOpen = isSpeaking ? Math.floor(frame / 5) % 2 === 0 : false;

  // 話している時のアニメーション（上下に揺れる）
  const bounceY = isSpeaking
    ? interpolate(Math.sin(frame * 0.3), [-1, 1], [-3, 3])
    : 0;

  // 登場アニメーション（画面端からスライドイン）
  const slideIn = interpolate(frame, [0, fps * 0.5], [isLeft ? -200 : 200, 0], {
    extrapolateRight: "clamp",
  });

  // スケールは常に1（サイズ変更なし）
  const scale = 1;

  // 画像パスを取得（表情差分対応、存在チェック付き）
  const basePath = SETTINGS.character.imagesBasePath;
  const imageFileName = getImageFileName(characterId, emotion, mouthOpen);
  const currentImage = `${basePath}/${characterId}/${imageFileName}`;

  const psdPath = SETTINGS.character.psdPaths?.[characterId];
  const psdVariants = usePsdMouthVariants(psdPath);

  // 設定ファイルのuseImagesフラグをチェック
  const hasImage = SETTINGS.character.useImages;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        [characterConfig.position]: slideIn,
        transform: `translateY(${bounceY}px) scale(${scale})`,
        transformOrigin: isLeft ? "bottom left" : "bottom right",
      }}
    >
      {hasImage ? (
        psdPath ? (
          psdVariants ? (
            <Img
              src={mouthOpen ? psdVariants.open : psdVariants.close}
              style={{
                height: SETTINGS.character.height,
                objectFit: "contain",
                transform: characterConfig.flipX ? "scaleX(-1)" : "none",
              }}
            />
          ) : null
        ) : (
          <Img
            src={staticFile(currentImage)}
            style={{
              height: SETTINGS.character.height,
              objectFit: "contain",
              transform: characterConfig.flipX ? "scaleX(-1)" : "none",
            }}
          />
        )
      ) : (
        // 画像がない場合のプレースホルダー
        <div
          style={{
            width: 200,
            height: 300,
            background: `${characterConfig.color}20`,
            border: `4px solid ${characterConfig.color}`,
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 48 }}>
            {characterId === "zundamon" ? "🟢" : "🩷"}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: characterConfig.color,
              marginTop: 8,
            }}
          >
            {characterConfig.name}
          </div>
        </div>
      )}
    </div>
  );
};
