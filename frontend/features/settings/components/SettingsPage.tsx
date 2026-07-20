"use client";

import { Bell, Accessibility } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/features/settings/store/useSettings";

const INTERFACE_LANGUAGES = ["English", "French", "Swahili", "Kinyarwanda", "Arabic"];

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-foreground text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const notifications = useSettings((state) => state.notifications);
  const setNotifications = useSettings((state) => state.setNotifications);
  const accessibility = useSettings((state) => state.accessibility);
  const setAccessibility = useSettings((state) => state.setAccessibility);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage notifications and accessibility.</p>
      </div>

      <section className="bg-card border-border rounded-xl border p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Bell className="text-primary" size={18} />
          <h2 className="text-foreground text-base font-semibold">Notifications</h2>
        </div>

        <div className="divide-border divide-y">
          <SettingRow label="Messages" description="New messages from tandem partners">
            <Switch
              checked={notifications.messages}
              onCheckedChange={(checked) => setNotifications({ messages: checked })}
            />
          </SettingRow>
          <SettingRow label="Matches" description="Tandem requests and matches">
            <Switch
              checked={notifications.matches}
              onCheckedChange={(checked) => setNotifications({ matches: checked })}
            />
          </SettingRow>
          <SettingRow label="Reminders" description="Streak and lesson reminders">
            <Switch
              checked={notifications.reminders}
              onCheckedChange={(checked) => setNotifications({ reminders: checked })}
            />
          </SettingRow>
          <SettingRow label="Quiet hours" description="Pause notifications during set hours">
            <Switch
              checked={notifications.quietHoursEnabled}
              onCheckedChange={(checked) => setNotifications({ quietHoursEnabled: checked })}
            />
          </SettingRow>

          {notifications.quietHoursEnabled && (
            <div className="flex items-center gap-3 py-3">
              <div className="space-y-1">
                <Label htmlFor="quiet-start" className="text-xs">From</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={notifications.quietHoursStart}
                  onChange={(event) => setNotifications({ quietHoursStart: event.target.value })}
                  className="w-32"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quiet-end" className="text-xs">To</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={notifications.quietHoursEnd}
                  onChange={(event) => setNotifications({ quietHoursEnd: event.target.value })}
                  className="w-32"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-card border-border rounded-xl border p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Accessibility className="text-primary" size={18} />
          <h2 className="text-foreground text-base font-semibold">Accessibility</h2>
        </div>

        <div className="divide-border divide-y">
          <SettingRow label="Interface language" description="Language used for menus and buttons">
            <Select
              value={accessibility.interfaceLanguage}
              onValueChange={(value) => setAccessibility({ interfaceLanguage: value })}
            >
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INTERFACE_LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language}>{language}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label="Lite mode" description="Fewer images and animations to save data">
            <Switch
              checked={accessibility.liteMode}
              onCheckedChange={(checked) => setAccessibility({ liteMode: checked })}
            />
          </SettingRow>
        </div>
      </section>
    </div>
  );
}
