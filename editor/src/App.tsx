import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ScriptTable } from './components/script/ScriptTable';
import { SettingsForm } from './components/settings/SettingsForm';
import { useScript } from './hooks/useScript';
import { useSettings } from './hooks/useSettings';
import { useMetadata } from './hooks/useMetadata';

const ASPECT_PRESETS: Record<string, { width: number; height: number }> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
};

const getAspectKey = (width: number, height: number): string => {
  const matched = Object.entries(ASPECT_PRESETS).find(([, p]) => p.width === width && p.height === height);
  return matched ? matched[0] : 'custom';
};

function App() {
  const [currentTab, setCurrentTab] = useState<'script' | 'settings'>('script');
  const [isGenerating, setIsGenerating] = useState(false);
  const [focusVideoSizeTrigger, setFocusVideoSizeTrigger] = useState(0);

  const { script, loading: scriptLoading, error: scriptError, updateLine, createLine, deleteLine, refresh: refreshScript } = useScript();
  const { settings, loading: settingsLoading, error: settingsError, updateSettings, refresh: refreshSettings } = useSettings();
  const { metadata, loading: metadataLoading } = useMetadata();

  const handlePreview = () => {
    window.open('http://localhost:3000', '_blank');
  };

  const handleGenerateVoices = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/actions/generate-voices', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate voices');
      const result = await res.json();
      alert(result.message || 'Voices generated successfully!');
      refreshScript();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate voices');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBuildVideo = async () => {
    try {
      const res = await fetch('/api/actions/build-video', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start build');
      const result = await res.json();
      alert(result.message || 'Video build started!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to build video');
    }
  };

  const loading = scriptLoading || settingsLoading || metadataLoading;
  const error = scriptError || settingsError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {settings && (
        <Header
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          aspect={getAspectKey(settings.video.width, settings.video.height)}
          onAspectChange={async (aspect) => {
            if (aspect === 'custom') {
              setCurrentTab('settings');
              setFocusVideoSizeTrigger((v) => v + 1);
              return;
            }
            const preset = ASPECT_PRESETS[aspect];
            if (!preset) return;
            await updateSettings({
              ...settings,
              video: {
                ...settings.video,
                width: preset.width,
                height: preset.height,
              },
            });
            refreshSettings();
          }}
        />
      )}
      <div className="flex flex-1">
        <Sidebar
          onPreview={handlePreview}
          onGenerateVoices={handleGenerateVoices}
          onBuildVideo={handleBuildVideo}
          isGenerating={isGenerating}
        />
        <main className="flex-1 p-6 overflow-auto">
          {currentTab === 'script' && metadata && (
            <ScriptTable
              script={script}
              metadata={metadata}
              onUpdate={updateLine}
              onCreate={createLine}
              onDelete={deleteLine}
            />
          )}
          {currentTab === 'settings' && settings && (
            <SettingsForm
              settings={settings}
              focusVideoSizeTrigger={focusVideoSizeTrigger}
              onSave={async (data) => {
                await updateSettings(data);
                refreshSettings();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
