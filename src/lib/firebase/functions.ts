import { type Functions, getFunctions } from 'firebase/functions';

import { getFirebaseApp } from './client';

/** Singleton Functions instance. */
let _functions: Functions | null = null;

export function getFunctionsInstance(): Functions {
  if (!_functions) {
    _functions = getFunctions(getFirebaseApp());
  }
  return _functions;
}
