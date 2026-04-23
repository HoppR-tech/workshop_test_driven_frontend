/* eslint-disable no-restricted-syntax */

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TWENTY_MINUTES = 20 * ONE_MINUTE;

export abstract class Subscriber<Data> implements WithPayload {
  private subscriptions = new Set<Subscription>();

  public subscribe(subscription: Subscription) {
    this.subscriptions.add(subscription);

    return () => {
      this.subscriptions.delete(subscription);
    }
  }

  public getSnapshot() {
    return this.getPayload();
  }

  protected emitChanges() {
    console.log(this.subscriptions)
    this.subscriptions.forEach((subscription) => {
      subscription();
    });
  }

  abstract getPayload(): Data;
}

type SecretGuardMode = "visible" | "idle" | "hidden" | "locked";
type GracePeriod = number;
type InactivityDuration = number;

type SecretExposureGuardDriver = {
  addEventListener: typeof window.addEventListener;
  removeEventListener: typeof window.removeEventListener;
};

export class SecretExposureGuard extends Subscriber<SecretGuardMode> {
  getPayload(): SecretGuardMode {
    return this.mode;
  }

  private _mode: SecretGuardMode = "visible";
  private idle_timer_id: NodeJS.Timeout | null = null;
  private hidden_timer_id: NodeJS.Timeout | null = null;
  private locked_timer_id: NodeJS.Timeout | null = null;

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
    this._mode = mode;
    this.emitChanges();
  }

  public get mode(): SecretGuardMode {
    return this._mode;
  }

  public start(): void {
    this.add_user_activity_listeners();

    this.schedule_idle_timer();
    this.schedule_locked_timer();
  }

  public hide(): void {
    this.mode = "hidden";

    this.remove_user_activity_listeners();
    this.clear_idle_timer();
    this.clear_hidden_timer();
  }

  public show(): void {
    if (this.mode === "locked") return;

    this.add_user_activity_listeners();
    this.schedule_idle_timer();

    this.mode = "visible";
  }

  public stop(): void {
    this.remove_user_activity_listeners();

    this.clear_idle_timer();
    this.clear_hidden_timer();
    this.clear_locked_timer();
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
    this.mode = "visible";

    this.clear_hidden_timer();
    this.schedule_idle_timer();
  }

  private schedule_idle_timer(): void {
    this.clear_idle_timer();

    this.idle_timer_id = setTimeout(() => {
      this.mode = "idle";
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
      this.mode = "locked";
      this.stop();
    }, this.max_availability);
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type Subscription = Function;

interface WithPayload {
  getPayload(): unknown;
}
