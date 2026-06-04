import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import { App } from './src/app/App';

// registerRootComponent calls AppRegistry.registerComponent and ensures the
// environment is set up for Expo. Use this instead of AppRegistry.registerComponent
// directly.
registerRootComponent(App);
