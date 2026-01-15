import { Metadata } from 'next';
import { SettingsPanel } from '@/components/SettingsPanel';
import { PreferencesProvider } from '@/components/PreferencesProvider';

export const metadata: Metadata = {
  title: 'Settings | TriVault',
  description: 'Customize your TriVault experience',
};

export default function SettingsPage() {
  return (
    <PreferencesProvider>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-2">
              Customize your TriVault experience
            </p>
          </div>

          <SettingsPanel />
        </div>
      </div>
    </PreferencesProvider>
  );
}
