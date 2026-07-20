export interface NotificationPreferences {
  messages: boolean;
  matches: boolean;
  reminders: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface AccessibilityPreferences {
  interfaceLanguage: string;
  liteMode: boolean;
}
