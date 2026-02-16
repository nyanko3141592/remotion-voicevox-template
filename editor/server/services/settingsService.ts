import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const ROOT_DIR = path.resolve(process.cwd(), '..');
const YAML_PATH = path.join(ROOT_DIR, 'video-settings.yaml');

export interface VideoSettings {
  font: {
    family: string;
    size: number;
    weight: string;
    color: string;
    outlineColor: string;
    innerOutlineColor: string;
  };
  subtitle: {
    bottomOffset: number;
    maxWidthPercent: number;
    maxWidthPixels: number;
    outlineWidth: number;
    innerOutlineWidth: number;
  };
  character: {
    height: number;
    psdPaths?: Record<string, string>;
    useImages: boolean;
    imagesBasePath: string;
  };
  content: {
    topPadding: number;
    sidePadding: number;
    bottomPadding: number;
  };
  video: {
    width: number;
    height: number;
    fps: number;
    playbackRate: number;
  };
  colors: Record<string, string>;
}

export function getSettings(): VideoSettings {
  const content = fs.readFileSync(YAML_PATH, 'utf-8');
  return yaml.parse(content) as VideoSettings;
}

export function updateSettings(data: VideoSettings): VideoSettings {
  // Read existing file to preserve comments structure (basic preservation)
  const yamlContent = yaml.stringify(data, {
    lineWidth: 0, // Prevent line wrapping
  });

  // Add header comments back
  const header = `# ===========================================
# 動画設定ファイル
# このファイルを編集して動画のスタイルをカスタマイズできます
# ===========================================

`;

  fs.writeFileSync(YAML_PATH, header + yamlContent);
  return data;
}
