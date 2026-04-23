import React from "react";

import { SecretExposureGuard } from "./SecretExposureGuard";

// eslint-disable-next-line no-restricted-syntax
class SecretExposureGuardDriverBrowserEvents {
  public addEventListener(event: string, listener: EventListener) {
    window.addEventListener(event, listener);
  }

  public removeEventListener(event: string, listener: EventListener) {
    window.removeEventListener(event, listener);
  }
}

export function useSecretExposureGuard({
  onLock,
}: {
  onLock?: () => void;
}) {
  const guardRef = React.useRef<SecretExposureGuard | null>(null);

  if (guardRef.current === null) {
    guardRef.current = new SecretExposureGuard(
      new SecretExposureGuardDriverBrowserEvents(),
      1000,
      10_000,
      120_000
    );
  }
  const guard = guardRef.current;

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => guard.subscribe(onStoreChange),
    [guard]
  );

  const getSnapshot = React.useCallback(
    () => guard.getSnapshot(),
    [guard],
  );

  const mode = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  React.useEffect(() => {
    if (mode === "locked") {
      onLock?.();
    }

  }, [mode, onLock])

  React.useEffect(() => {
    guard.start();

    return () => {
      guard.stop();
    };
  }, [guard]);

  return {
    mode,
    start: () => guard.start(),
    stop: () => guard.stop(),
    hide: () => guard.hide(),
    show: () => guard.show(),
  };
}

