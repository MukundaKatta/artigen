export class EventEmitter {
  addListener() { return { remove: () => {} }; }
  removeAllListeners() {}
  emit() {}
}
export class NativeModule {}
export function requireNativeModule() { return {}; }
export function requireOptionalNativeModule() { return null; }
