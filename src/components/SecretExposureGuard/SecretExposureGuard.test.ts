import { Subscriber } from "./SecretExposureGuard";

const ONE_SECOND = 1000;

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
    await fixture.when_the_user_is_inactive();
    fixture.then_the_guard_is_in_idle_mode();
  });
});

type SecretGuardMode = "visible" | "idle";
type GracePeriod = number;

class SecretExposureGuard extends Subscriber<unknown> {
  getPayload(): undefined {
    return undefined;
  }

  private _mode: SecretGuardMode = "visible";

  constructor(
    private grace_period: GracePeriod = ONE_SECOND,
  ) {
    super();
  }

  private set mode(mode: SecretGuardMode) {
    this._mode = mode;
  }

  public get mode(): SecretGuardMode {
    return this._mode;
  }

  public start(): void {
    this.schedule_idle_timer();
  }

  private schedule_idle_timer(): void {
    setTimeout(() => {
      this.mode = "idle";
    }, this.grace_period);
  }

}

function createSecretExposureGuard() {
  return new SecretExposureGuard();
}

class Fixture {
  private secretGuard: SecretExposureGuard;

  private grace_period: number;

  constructor() {
    jest.useFakeTimers();
  }

  private create_guard() {
    this.secretGuard = createSecretExposureGuard();
  }

  private start_guard() {
    this.create_guard();
    this.secretGuard.start();
  }

  public given_the_grace_period_is(grace_period: number) {
    this.grace_period = grace_period;
  }

  public async when_the_guard_start() {
    this.create_guard();
  }

  public async when_the_user_is_inactive() {
    this.start_guard();
    jest.advanceTimersByTime(this.grace_period + 1);
  }

  public then_the_guard_is_in_visible_mode() {
    expect(this.secretGuard.mode).toBe("visible");
  }

  public then_the_guard_is_in_idle_mode() {
    expect(this.secretGuard.mode).toBe("idle");
  }
}
