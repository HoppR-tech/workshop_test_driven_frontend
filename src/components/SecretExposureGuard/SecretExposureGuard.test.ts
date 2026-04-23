import { GracePeriod, SecretExposureGuard, SecretExposureGuardDriver } from "./SecretExposureGuard";

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const TWENTY_MINUTES = 20 * ONE_MINUTE;

/* eslint-disable no-restricted-syntax */
describe("SecretExposureGuard", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = new Fixture();
  });

  test("Rule: the guard is in 'visible' mode on start", async () => {
    await fixture.when_the_guard_start();

    fixture.then_the_guard_is_in_visible_mode();
  });

  test("Rule: after a defined _grace period_ of inactivity the guard goes to 'idle' mode", async () => {
    fixture.given_the_grace_period_is(ONE_SECOND);

    await fixture.when_the_user_is_inactive_for(ONE_SECOND);

    fixture.then_the_guard_is_in_idle_mode();
  });

  test.each([
    { action: "clicking" },
    { action: "moving_mouse" },
    { action: "typing" },
    { action: "moving_pointer" },
    { action: "moving_touch" },
    { action: "scrolling" },
  ])("Rule: the guard in 'idle' mode goes back to 'visible' mode on user activity by $action", async ({ action }: { action: UserActivityActions }) => {
    const one_second_and_a_half = ONE_SECOND * 1.5;

    fixture.given_the_grace_period_is(ONE_SECOND);
    fixture.given_the_user_is_inactive_for(one_second_and_a_half);

    await fixture.when_the_user_is_active_by(action);

    fixture.then_the_guard_is_in_visible_mode();
  });

  test("Rule: a user that stays active during the grace period should stay 'visible'", async () => {
    const zero_point_eight_seconds = 800;

    fixture.given_the_grace_period_is(ONE_SECOND);

    await fixture
      .when_user_activity_is()
      .inactive_for(zero_point_eight_seconds)
      .then()
      .active_by("clicking")
      .then()
      .inactive_for(zero_point_eight_seconds)
      .run();

    fixture.then_the_guard_is_in_visible_mode();
  });

  test("Rule: the guard should go to 'hidden' mode once the inactivity duration as been reached", async () => {
    const one_minute_and_one_second = ONE_MINUTE + ONE_SECOND;

    fixture.given_the_grace_period_is(ONE_SECOND);
    fixture.given_the_inactivity_duration_is(ONE_MINUTE)

    await fixture.when_the_user_is_inactive_for(one_minute_and_one_second);

    fixture.then_the_guard_is_in_hidden_mode();
  });

  test("Rule: the guard in 'idle' mode resets the 'hidden' timer on user activity as long as the 'hidden' mode has not been reached", async () => {
    const four_seconds = 4 * ONE_SECOND;
    const five_seconds = 5 * ONE_SECOND;

    fixture.given_the_grace_period_is(ONE_SECOND);
    fixture.given_the_inactivity_duration_is(five_seconds);

    await fixture.when_user_activity_is()
      .inactive_for(four_seconds)
      .then()
      .active_by("clicking")
      .then()
      .inactive_for(four_seconds)
      .run();

    fixture.then_the_guard_is_in_idle_mode();
  });

  test("Rule: once the 'hidden' mode has been reached, the guard stays in 'hidden' mode", async () => {
    const two_minutes = 2 * ONE_MINUTE;

    fixture.given_the_grace_period_is(ONE_SECOND);
    fixture.given_the_inactivity_duration_is(ONE_MINUTE);

    await fixture.when_user_activity_is()
      .inactive_for(two_minutes)
      .then()
      .active_by("clicking")
      .run();

    fixture.then_the_guard_is_in_hidden_mode();
  });

  test("Rule: the guard has a 'locked' mode which is reached once the max time availability is reached", async () => {
    fixture.given_the_grace_period_is(ONE_SECOND);
    fixture.given_the_inactivity_duration_is(ONE_MINUTE);
    fixture.given_the_max_availability_is(TWENTY_MINUTES);

    await fixture.when_the_user_is_inactive_for(TWENTY_MINUTES);

    fixture.then_the_guard_is_in_locked_mode();
  });

  describe("Rule: an 'hidden' timer can be shown again as long as the max availability as not been reached", () => {
    test("shown again BEFORE the max time availability is reached", async () => {
      const two_minutes = 2 * ONE_MINUTE;

      fixture.given_the_grace_period_is(ONE_SECOND);
      fixture.given_the_inactivity_duration_is(ONE_MINUTE);

      await fixture.when_user_activity_is()
        .inactive_for(two_minutes)
        .then()
        .show_again()
        .run();

      fixture.then_the_guard_is_in_visible_mode();
    });

    test("shown again AFTER the max time availability is reached", async () => {
      const two_minutes = 2 * ONE_MINUTE;

      fixture.given_the_grace_period_is(ONE_SECOND);
      fixture.given_the_inactivity_duration_is(ONE_MINUTE);
      fixture.given_the_max_availability_is(two_minutes);

      await fixture.when_user_activity_is()
        .inactive_for(two_minutes)
        .then()
        .show_again()
        .run();

      fixture.then_the_guard_is_in_locked_mode();
    });
  });

  describe("Rule: the grace period is subsctracted from the inactivity duration", () => {
    test("for a grace period of 1 second, the inactivity duration should be 1 minute and not 1 minute and 1 second", async () => {
      fixture.given_the_grace_period_is(ONE_SECOND);
      fixture.given_the_inactivity_duration_is(ONE_MINUTE);

      await fixture.when_the_user_is_inactive_for(ONE_MINUTE);

      fixture.then_the_guard_is_in_hidden_mode();
    });
  });

  test("Rule: the guard can manually be switched to 'hidden' mode", async () => {
    fixture.given_the_grace_period_is(ONE_SECOND);
    fixture.given_the_inactivity_duration_is(ONE_MINUTE);

    await fixture.when_the_user_hides();

    fixture.then_the_guard_is_in_hidden_mode();
  })

  describe("Rule: the guard notify each second the remaining time", () => {
    test("shown again BEFORE the max time availability is reached", async () => {
      const fake_now = 100_000;
      const five_minutes = 5 * ONE_MINUTE;
      const fifteen_minutes = 15 * ONE_MINUTE;

      fixture.given_now_is(fake_now);
      fixture.given_the_grace_period_is(ONE_SECOND);
      fixture.given_the_inactivity_duration_is(ONE_MINUTE);
      fixture.given_the_max_availability_is(TWENTY_MINUTES);

      await fixture.when_the_user_is_inactive_for(fifteen_minutes);

      fixture.then_the_remaining_time_is(five_minutes);
    });

    test("shown again AFTER the max time availability is reached", async () => {
      const fake_now = 100_000;
      const twenty_five_minutes = 25 * ONE_MINUTE;

      fixture.given_now_is(fake_now);
      fixture.given_the_grace_period_is(ONE_SECOND);
      fixture.given_the_inactivity_duration_is(ONE_MINUTE);
      fixture.given_the_max_availability_is(TWENTY_MINUTES);

      await fixture.when_the_user_is_inactive_for(twenty_five_minutes);

      fixture.then_the_remaining_time_is(0);
    });
  });
});

class SecretExposureGuardDriverMock implements SecretExposureGuardDriver {
  private listeners = new Map<string, Set<EventListener>>();
  private _now = 0;

  public addEventListener(event: string, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public removeEventListener(event: string, listener: EventListener) {
    this.listeners.get(event)?.delete(listener);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit(event: string, payload?: any) {
    this.listeners.get(event)?.forEach((listener) => {
      listener(payload);
    });
  }

  public set_now(now: number) {
    this._now = now;
  }

  public now(): number {
    return this._now;
  }
}

interface PlayableAction {
  play(): Promise<void>;
}

class InactiveAction implements PlayableAction {
  constructor(private readonly time: number) { }

  public async play() {
    jest.advanceTimersByTime(this.time);
  }
}

class ActiveAction implements PlayableAction {
  constructor(private fixture: Fixture, private readonly action: UserActivityActions) { }

  public async play() {
    await this.fixture.when_the_user_action_is(this.action);
  }
}

class ShowAgainAction implements PlayableAction {
  constructor(private readonly fixture: Fixture) { }

  public async play() {
    this.fixture.when_show_again();
  }
}

class UserActivitySequence {
  private sequence: PlayableAction[] = [];

  constructor(private fixture: Fixture) {
  }

  public inactive_for(time: number) {
    this.sequence.push(new InactiveAction(time));
    return this;
  }

  public then() {
    return this;
  }

  public active_by(action: UserActivityActions) {
    this.sequence.push(new ActiveAction(this.fixture, action));
    return this;
  }

  public show_again() {
    this.sequence.push(new ShowAgainAction(this.fixture));
    return this;
  }

  public async run() {
    await this.fixture.when_the_guard_start();

    while (this.sequence.length > 0) {
      const action = this.sequence.shift()!;
      await action.play();
    }
  }
}

type UserActivityActions = "clicking" | "moving_mouse" | "typing" | "touching" | "pointing" | "scrolling";

const activityEvents = {
  moving_mouse: "mousemove",
  clicking: "mousedown",
  typing: "keydown",
  touching: "touchstart",
  pointing: "pointerdown",
  scrolling: "scroll",
}

class Fixture {
  private secretGuard: SecretExposureGuard;
  private driver_mock = new SecretExposureGuardDriverMock();
  private time_to_wait: number = undefined;

  private grace_period: number;
  private inactivity_duration: number;
  private max_availability: number;

  constructor() {
    jest.useFakeTimers();
  }

  private create_guard() {
    this.secretGuard = new SecretExposureGuard(this.driver_mock, this.grace_period, this.inactivity_duration, this.max_availability);
  }

  private should_wait(): boolean {
    return this.time_to_wait !== undefined;
  }

  private get_event(action: UserActivityActions) {
    return activityEvents[action] ?? activityEvents.clicking;
  }

  private start_guard() {
    this.create_guard();
    this.secretGuard.start();

    if (this.should_wait()) {
      jest.advanceTimersByTime(this.time_to_wait);
    }
  }

  //#region Given
  public given_the_grace_period_is(grace_period: GracePeriod) {
    this.grace_period = grace_period;
  }

  public given_the_inactivity_duration_is(inactivity_duration: number) {
    this.inactivity_duration = inactivity_duration;
  }

  public given_the_user_is_inactive_for(time: number) {
    this.time_to_wait = time;
  }

  public given_the_max_availability_is(max_availability: number) {
    this.max_availability = max_availability;
  }

  public given_now_is(now: number) {
    this.driver_mock.set_now(now);
  }
  //#endregion Given

  //#region When
  public async when_the_guard_start() {
    this.start_guard();
  }

  public async when_the_user_is_inactive() {
    this.start_guard();
    this.driver_mock.set_now(this.driver_mock.now() + this.grace_period + 1);
    jest.advanceTimersByTime(this.grace_period + 1);
  }

  public async when_the_user_is_inactive_for(duration: number) {
    this.start_guard();
    this.driver_mock.set_now(this.driver_mock.now() + duration);
    jest.advanceTimersByTime(duration);
  }

  public async when_the_user_action_is(action: UserActivityActions) {
    this.driver_mock.emit(this.get_event(action));
  }

  public async when_the_user_is_active_by(action: UserActivityActions) {
    this.start_guard();

    this.driver_mock.emit(this.get_event(action));
  }

  public when_user_activity_is() {
    return new UserActivitySequence(this);
  }

  public when_show_again() {
    this.secretGuard.show();
  }

  public async when_the_user_hides() {
    this.start_guard();

    this.secretGuard.hide();
  }
  //#endregion When

  //#region Then
  public then_the_guard_is_in_visible_mode() {
    expect(this.secretGuard.mode).toBe("visible");
  }

  public then_the_guard_is_in_idle_mode() {
    expect(this.secretGuard.mode).toBe("idle");
  }

  public then_the_guard_is_in_hidden_mode() {
    expect(this.secretGuard.mode).toBe("hidden");
  }

  public then_the_guard_is_in_locked_mode() {
    expect(this.secretGuard.mode).toBe("locked");
  }

  public then_the_remaining_time_is(remaining_time: number) {
    expect(this.secretGuard.remaining_time).toBe(remaining_time);
  }
  //#endregion Then
}
