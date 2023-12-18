import { WritableSignal, Signal, signal, isSignal, effect } from "@angular/core";
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";

type AsyncOnCancel = (cancelCallback: any) => void;

export type ComputeAsyncOptions = {
  /** An optional initial value that the `computedAsync` signal will emit while waiting for async call to end */
  initialValue?: any,

  /** An optional reactive object that will be set to false before the async call initialization and to true when it will resolve */
  evaluating?:
    | WritableSignal<boolean>
    | Subject<boolean>
    | BehaviorSubject<boolean>
}

/**
 * Computed for async functions.
 * 
 * @example
 * ```ts
 * numberSignal = signal(1);
 * function asyncDouble = (value: number) => new Promise(resolve => setTimeout(() => value * 2, 500));
 * computedFromPromise = computedAsync(() => asyncDouble(this.numberSignal()));
 * ```
 * 
 * @param evaluationCallback Yhe callback to compute.
 * @param options The computedAsync options.
 * @returns The computed singal.
 */
export function computedAsync<T>(
  evaluationCallback: (
    onCancel: AsyncOnCancel
  ) => T | Promise<T> | Observable<T>,
  options?: ComputeAsyncOptions
): Signal<T | undefined> {
  const evaluating = options?.evaluating;
  let current = signal(options?.initialValue);

  // wheter the async call is complete or not
  let hasFinished = false;

  // rxjs `Subscription` that will be use to avoid memory leaks in case of `Observable`
  let subscription: Subscription;

  // function to set a new value to the evaluating reactive object
  const setEvaluating = (
    evaluating: WritableSignal<boolean> | Subject<boolean>,
    value: boolean
  ) => {
    if (
      evaluating instanceof Subject ||
      evaluating instanceof BehaviorSubject
    ) {
      evaluating.next(value);
    }
    if (isSignal(evaluating)) {
      evaluating.set(value);
    }
  };

  if (evaluating) {
    setEvaluating(evaluating, false);
  }

  effect(
    async (onCleanup) => {
      if(subscription)
        subscription.unsubscribe();
      try {
        // calling the passed function
        const res = evaluationCallback((cancelCallback) => {
          onCleanup(() => {
            if (evaluating) setEvaluating(evaluating, false);
            if (!hasFinished) cancelCallback();
          });
        });
        if (res instanceof Observable) {
          subscription = res.subscribe(current.set);
        }
        else if (res instanceof Promise) current.set(await res);
        else current.set(res);
      } catch (e) {
        console.error(e);
      } finally {
        if (evaluating) setEvaluating(evaluating, true);

        hasFinished = true;
      }
    },
    { allowSignalWrites: true }
  );

  return current;
}