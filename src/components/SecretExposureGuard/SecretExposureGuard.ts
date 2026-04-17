/* eslint-disable no-restricted-syntax */


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
