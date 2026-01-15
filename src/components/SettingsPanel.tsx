'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch, RadioGroup } from '@/components/ui/FormControls';
import { Select } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { usePreferences } from '@/components/PreferencesProvider';

export function SettingsPanel() {
  const { preferences, updatePreference, resetPreferences } = usePreferences();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            name="theme"
            value={preferences.theme}
            onChange={(value) => updatePreference('theme', value as 'light' | 'dark' | 'system')}
            options={[
              { value: 'light', label: 'Light', description: 'Light theme for daytime use' },
              { value: 'dark', label: 'Dark', description: 'Dark theme for nighttime use' },
              { value: 'system', label: 'System', description: 'Follow system preference' },
            ]}
          />
          
          <div className="pt-4 border-t border-gray-700">
            <Switch
              checked={preferences.compactView}
              onChange={(checked) => updatePreference('compactView', checked)}
              label="Compact view"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Switch
            checked={preferences.notifications}
            onChange={(checked) => updatePreference('notifications', checked)}
            label="Enable notifications"
          />
          
          <Switch
            checked={preferences.sounds}
            onChange={(checked) => updatePreference('sounds', checked)}
            label="Sound effects"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Language</label>
            <Select
              value={preferences.language}
              onChange={(value) => updatePreference('language', value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' },
                { value: 'ja', label: '日本語' },
                { value: 'zh', label: '中文' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Currency</label>
            <Select
              value={preferences.currency}
              onChange={(value) => updatePreference('currency', value)}
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
                { value: 'JPY', label: 'JPY (¥)' },
                { value: 'ETH', label: 'ETH (Ξ)' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={resetPreferences}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
