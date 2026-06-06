export type SettingsStackParamList = {
  // The inner first screen is named `SettingsHome` (not `Settings`)
  // to avoid React Navigation's "screen with the same name nested
  // inside one another" warning, which fires whenever a child
  // route's name matches its parent (the `Settings` tab).
  SettingsHome: undefined;
  Profile: undefined;
  DeleteAccount: undefined;
};
