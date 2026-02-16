interface HeaderProps {
  currentTab: 'script' | 'settings';
  onTabChange: (tab: 'script' | 'settings') => void;
  aspect: string;
  onAspectChange: (aspect: string) => void;
}

export function Header({ currentTab, onTabChange, aspect, onAspectChange }: HeaderProps) {
  return (
    <header className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Script Editor</h1>
        <span className="text-gray-400 text-sm">Remotion + VOICEVOX</span>
      </div>
      <nav className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Aspect</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            {(['16:9', '9:16', '1:1', 'custom'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onAspectChange(key)}
                className={`px-3 py-2 text-sm transition-colors ${
                  aspect === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {key === 'custom' ? 'Custom' : key}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => onTabChange('script')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentTab === 'script'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Script
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Settings
        </button>
      </nav>
    </header>
  );
}
