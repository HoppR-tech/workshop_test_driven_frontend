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

  public now(): number {
    return Date.now();
  }
}

export function useSecretExposureGuard({
  gracePeriod,
  inactivityDuration,
  maxAvailability,
  onLock,
}: {
  gracePeriod?: number;
  inactivityDuration?: number;
  maxAvailability?: number;
  onLock?: () => void;
}) {
  const guardRef = React.useRef<SecretExposureGuard | null>(null);

  if (guardRef.current === null) {
    guardRef.current = new SecretExposureGuard(
      new SecretExposureGuardDriverBrowserEvents(),
      gracePeriod,
      inactivityDuration,
      maxAvailability,
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

  const snapshot = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  React.useEffect(() => {
    if (snapshot.mode === "locked") {
      onLock?.();
    }

  }, [snapshot.mode, onLock])

  React.useEffect(() => {
    guard.start();

    return () => {
      guard.stop();
    };
  }, [guard]);

  return {
    mode: snapshot.mode,
    remainingTime: snapshot.remaining_time,
    start: () => guard.start(),
    stop: () => guard.stop(),
    hide: () => guard.hide(),
    show: () => guard.show(),
  };
}

