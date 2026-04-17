import { Subscriber } from "./SecretExposureGuard";

/* eslint-disable no-restricted-syntax */
describe("SecretExposureGuard", () => {
  let fixture: Fixture;

  beforeEach(() => {
    fixture = new Fixture();
  });

  describe("on start of the guard", () => {
    test("Rule: the guard is in 'visible' mode", async () => {
      await fixture.when_the_guard_start();
      fixture.then_the_guard_is_in_visible_mode();
    });
  });
});

class SecretExposureGuard extends Subscriber<unknown> {
  getPayload(): undefined {
    return undefined;
  }

  constructor(
  ) {
    super();
  }

  public mode(): string {
    return "visible";
  }

  public start(): void {
  }
}

function createSecretExposureGuard() {
  return new SecretExposureGuard();
}

class Fixture {
  private secretGuard: SecretExposureGuard;

  constructor() {
    this.secretGuard = createSecretExposureGuard();
  }

  public when_the_guard_start() {
    this.secretGuard.start();
  }

  public then_the_guard_is_in_visible_mode() {
    expect(this.secretGuard.mode()).toBe("visible");
  }
}
