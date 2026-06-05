import { type Functions, connectFunctionsEmulator, getFunctions } from 'firebase/functions';

import { EMULATOR_HOST, EMULATOR_PORTS, getFirebaseApp, shouldUseEmulator } from './client';

let _functions: Functions | null = null;
let _emulatorWired = false;

export function getFunctionsInstance(): Functions {
  if (!_functions) {
    _functions = getFunctions(getFirebaseApp());
  }
  if (!_emulatorWired && shouldUseEmulator()) {
    connectFunctionsEmulator(_functions, EMULATOR_HOST, EMULATOR_PORTS.functions);
    _emulatorWired = true;
  }
  return _functions;
}
