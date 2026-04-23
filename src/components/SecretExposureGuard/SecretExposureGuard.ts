/* eslint-disable no-restricted-syntax */

import { Subscriber } from "@/shared/Subscriber";

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TWENTY_MINUTES = 20 * ONE_MINUTE;

export type SecretGuardMode = "visible" | "idle" | "hidden" | "locked";
export type GracePeriod = number;
export type InactivityDuration = number;

export interface SecretExposureGuardDriver {
  addEventListener: typeof window.addEventListener;
  removeEventListener: typeof window.removeEventListener;
  now: () => number;
};

interface SecretExposureGuardSnapshot {
  mode: SecretGuardMode;
  remaining_time: number;
}

export class SecretExposureGuard extends Subscriber<SecretExposureGuardSnapshot> {
  getPayload(): SecretExposureGuardSnapshot {
    return this.snapshot;
  }

  private snapshot: SecretExposureGuardSnapshot = {
    mode: "visible",
    remaining_time: 0,
  };

  private availability_ends_at: number | null = null;

  private idle_timer_id: NodeJS.Timeout | null = null;
  private hidden_timer_id: NodeJS.Timeout | null = null;
  private locked_timer_id: NodeJS.Timeout | null = null;
  private remaining_time_interval_id: NodeJS.Timeout | null = null;

  constructor(
    private readonly driver: SecretExposureGuardDriver,
    private readonly grace_period: GracePeriod = ONE_SECOND,
    private readonly inactivity_duration: InactivityDuration = ONE_MINUTE,
    private readonly max_availability: InactivityDuration = TWENTY_MINUTES,
    private readonly user_activity_events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "pointerdown",
      "scroll",
    ],
  ) {
    super();
  }

  private set mode(mode: SecretGuardMode) {
    this.snapshot.mode = mode;
    this.emitChanges();
  }

  public get mode(): SecretGuardMode {
    return this.snapshot.mode;
  }

  public get remaining_time(): number {
    return this.snapshot.remaining_time;
  }

  public start(): void {
    this.add_user_activity_listeners();

    this.availability_ends_at = this.driver.now() + this.max_availability;
    this.update_snapshot({ remaining_time: this.max_availability });

    this.schedule_idle_timer();
    this.schedule_locked_timer();
    this.start_remaining_time_interval();
  }

  public hide(): void {
    this.update_snapshot({ mode: "hidden" });

    this.remove_user_activity_listeners();
    this.clear_idle_timer();
    this.clear_hidden_timer();
  }

  public show(): void {
    if (this.mode === "locked") return;

    this.add_user_activity_listeners();
    this.schedule_idle_timer();

    this.update_snapshot({ mode: "visible" });
  }

  public stop(): void {
    this.remove_user_activity_listeners();

    this.clear_idle_timer();
    this.clear_hidden_timer();
    this.clear_locked_timer();

    this.stop_remaining_time_interval();
  }

  private add_user_activity_listeners() {
    this.user_activity_events.forEach((event) => {
      this.driver.addEventListener(event, this.handle_user_activity);
    });
  }

  private remove_user_activity_listeners() {
    this.user_activity_events.forEach((event) => {
      this.driver.removeEventListener(event, this.handle_user_activity);
    });
  }

  // why an arroe function ? to preserve the context of `this` through the callbacks
  // I could have usee `this.handle_user_activity.bind(this)` too in the `addEventListener` call
  private handle_user_activity = () => {
    this.update_snapshot({ mode: "visible" });

    this.clear_hidden_timer();
    this.schedule_idle_timer();
  }

  private schedule_idle_timer(): void {
    this.clear_idle_timer();

    this.idle_timer_id = setTimeout(() => {
      this.update_snapshot({ mode: "idle" });
      this.schedule_hidden_timer();
    }, this.grace_period);
  }

  private schedule_hidden_timer(): void {
    const inactivity_duration = this.inactivity_duration - this.grace_period;

    this.hidden_timer_id = setTimeout(() => {
      this.hide();
    }, inactivity_duration);
  }

  private schedule_locked_timer(): void {
    this.locked_timer_id = setTimeout(() => {
      this.update_snapshot({ mode: "locked" });
      this.stop();
    }, this.max_availability);
  }

  private start_remaining_time_interval(): void {
    this.stop_remaining_time_interval();

    this.remaining_time_interval_id = setInterval(() => {
      const remaining_time_diff = this.availability_ends_at - this.driver.now();
      const remaining_time = Math.max(0, remaining_time_diff);

      this.update_snapshot({ remaining_time });
    }, ONE_SECOND);
  }

  private update_snapshot(patch: Partial<SecretExposureGuardSnapshot>): void {
    const nextSnapshot: SecretExposureGuardSnapshot = {
      ...this.snapshot,
      ...patch,
    };

    if (
      nextSnapshot.mode === this.snapshot.mode &&
      nextSnapshot.remaining_time === this.snapshot.remaining_time
    ) {
      return;
    }

    this.snapshot = nextSnapshot;
    this.emitChanges();
  }

  private stop_remaining_time_interval(): void {
    if (this.remaining_time_interval_id) {
      clearInterval(this.remaining_time_interval_id);
      this.remaining_time_interval_id = null;
    }
  }

  private clear_idle_timer(): void {
    if (this.idle_timer_id) {
      clearTimeout(this.idle_timer_id);
      this.idle_timer_id = null;
    }
  }

  private clear_hidden_timer(): void {
    if (this.hidden_timer_id) {
      clearTimeout(this.hidden_timer_id);
      this.hidden_timer_id = null;
    }
  }

  private clear_locked_timer(): void {
    if (this.locked_timer_id) {
      clearTimeout(this.locked_timer_id);
      this.locked_timer_id = null;
    }
  }
}

// type Listener<EventMap extends Record<string, any>, Key extends keyof EventMap = string> = (payload: EventMap[Key]) => void;

// export class EventEmitter<
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   EventMap extends Record<string, any>,
//   EventNames extends keyof EventMap = keyof EventMap,
// > {
//
//   private listeners = new Map<EventNames, Set<Listener<EventMap>>>();
//
//   public on<Key extends EventNames & string>(event: Key, listener: Listener<EventMap, Key>) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, new Set());
//     }
//     this.listeners.get(event)!.add(listener);
//     return () => this.off(event, listener);
//   }
//
//   public off<Key extends EventNames>(event: Key, listener: Listener<EventMap>) {
//     this.listeners.get(event)?.delete(listener);
//   }
//
//   public emit<Key extends EventNames>(event: Key, payload: EventMap[Key]) {
//     this.listeners.get(event)?.forEach((listener) => {
//       (listener as Listener<EventMap, Key>)(payload);
//     });
//   }
// }


