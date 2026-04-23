/* eslint-disable no-restricted-syntax */

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type Subscription = Function;

interface WithPayload {
  getPayload(): unknown;
}

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
    this.subscriptions.forEach((subscription) => {
      subscription();
    });
  }

  abstract getPayload(): Data;
}

