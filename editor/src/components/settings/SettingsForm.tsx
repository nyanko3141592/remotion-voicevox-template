import { useState, useEffect, useRef } from 'react';
import type { VideoSettings } from '../../types';

interface SettingsFormProps {
  settings: VideoSettings;
  onSave: (data: VideoSettings) => Promise<void>;
  focusVideoSizeTrigger?: number;
}

const VIDEO_PRESETS = {
  landscape_16_9: { label: '16:9 (1920×1080)', width: 1920, height: 1080 },
  portrait_9_16: { label: '9:16 (1080×1920)', width: 1080, height: 1920 },
  square_1_1: { label: '1:1 (1080×1080)', width: 1080, height: 1080 },
} as const;

export function SettingsForm({ settings, onSave, focusVideoSizeTrigger }: SettingsFormProps) {
  const [formData, setFormData] = useState<VideoSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [videoPreset, setVideoPreset] = useState<string>('custom');
  const [flashVideoSize, setFlashVideoSize] = useState(false);
  const widthInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    const w = formData.video.width;
    const h = formData.video.height;
    const matched = Object.entries(VIDEO_PRESETS).find(([, p]) => p.width === w && p.height === h);
    setVideoPreset(matched ? matched[0] : 'custom');
  }, [formData.video.width, formData.video.height]);

  useEffect(() => {
    if (!focusVideoSizeTrigger) return;
    const input = widthInputRef.current;
    if (!input) return;

    // Settingsタブへ切り替え直後でも確実にフォーカスする
    const t = window.setTimeout(() => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus();
      setFlashVideoSize(true);
      window.setTimeout(() => setFlashVideoSize(false), 900);
    }, 50);

    return () => window.clearTimeout(t);
  }, [focusVideoSizeTrigger]);

  const handleChange = (section: keyof VideoSettings, field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  const handleColorChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };

  const handleVideoPresetChange = (presetKey: string) => {
    setVideoPreset(presetKey);
    if (presetKey === 'custom') return;
    const preset = (VIDEO_PRESETS as Record<string, { width: number; height: number }>)[presetKey];
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      video: {
        ...prev.video,
        width: preset.width,
        height: preset.height,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await onSave(formData);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Settings</h2>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Font Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Font</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Family
            </label>
            <input
              type="text"
              value={formData.font.family}
              onChange={(e) => handleChange('font', 'family', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <input
              type="number"
              value={formData.font.size}
              onChange={(e) => handleChange('font', 'size', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Weight
            </label>
            <select
              value={formData.font.weight}
              onChange={(e) => handleChange('font', 'weight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extrabold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.font.color}
                onChange={(e) => handleChange('font', 'color', e.target.value)}
                className="h-10 w-16 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={formData.font.color}
                onChange={(e) => handleChange('font', 'color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Subtitle</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bottom Offset
            </label>
            <input
              type="number"
              value={formData.subtitle.bottomOffset}
              onChange={(e) => handleChange('subtitle', 'bottomOffset', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Width (%)
            </label>
            <input
              type="number"
              value={formData.subtitle.maxWidthPercent}
              onChange={(e) => handleChange('subtitle', 'maxWidthPercent', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Width (px)
            </label>
            <input
              type="number"
              value={formData.subtitle.maxWidthPixels}
              onChange={(e) => handleChange('subtitle', 'maxWidthPixels', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outline Width
            </label>
            <input
              type="number"
              value={formData.subtitle.outlineWidth}
              onChange={(e) => handleChange('subtitle', 'outlineWidth', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inner Outline Width
            </label>
            <input
              type="number"
              value={formData.subtitle.innerOutlineWidth}
              onChange={(e) => handleChange('subtitle', 'innerOutlineWidth', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Character Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Character</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              type="number"
              value={formData.character.height}
              onChange={(e) => handleChange('character', 'height', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Use Images
            </label>
            <select
              value={formData.character.useImages ? 'true' : 'false'}
              onChange={(e) => handleChange('character', 'useImages', e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images Base Path
            </label>
            <input
              type="text"
              value={formData.character.imagesBasePath}
              onChange={(e) => handleChange('character', 'imagesBasePath', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Video Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Video</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aspect Preset
            </label>
            <select
              value={videoPreset}
              onChange={(e) => handleVideoPresetChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="custom">Custom</option>
              {Object.entries(VIDEO_PRESETS).map(([key, p]) => (
                <option key={key} value={key}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              type="number"
              value={formData.video.width}
              onChange={(e) => handleChange('video', 'width', parseInt(e.target.value, 10))}
              ref={widthInputRef}
              className={`w-full px-3 py-2 border rounded-lg transition ${
                flashVideoSize ? 'border-blue-400 ring-4 ring-blue-200 animate-pulse' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              type="number"
              value={formData.video.height}
              onChange={(e) => handleChange('video', 'height', parseInt(e.target.value, 10))}
              className={`w-full px-3 py-2 border rounded-lg transition ${
                flashVideoSize ? 'border-blue-400 ring-4 ring-blue-200 animate-pulse' : 'border-gray-300'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FPS
            </label>
            <input
              type="number"
              value={formData.video.fps}
              onChange={(e) => handleChange('video', 'fps', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Playback Rate
            </label>
            <input
              type="number"
              value={formData.video.playbackRate}
              onChange={(e) => handleChange('video', 'playbackRate', parseFloat(e.target.value))}
              step={0.1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Colors</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(formData.colors).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="h-10 w-16 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Content</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top Padding
            </label>
            <input
              type="number"
              value={formData.content.topPadding}
              onChange={(e) => handleChange('content', 'topPadding', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Side Padding
            </label>
            <input
              type="number"
              value={formData.content.sidePadding}
              onChange={(e) => handleChange('content', 'sidePadding', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bottom Padding
            </label>
            <input
              type="number"
              value={formData.content.bottomPadding}
              onChange={(e) => handleChange('content', 'bottomPadding', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
