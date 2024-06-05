import type QueueStatus from "../types/QueueStatus";

interface QueueItem<T> {
  eventHandler: (detail: T) => Promise<void>;
  detail: T;
}

class AsyncEventQueue {
  private queue: QueueItem<{ delay?: number }>[] = [];
  private isProcessing = false;
  private startTime = 0;
  private endTime = 0;
  private processedItems = 0;
  private remainingItems = 0;
  private items: { detail: unknown; startTime: number; elapsedTime: number }[] =
    [];
  private sendingMessage: number | false = false;
  private waiting: number | false = false;
  private aborted = false;
  private paused = false;
  private pausePromiseResolve?: ((value?: unknown) => void) | undefined;

  private async wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async add<T extends { delay?: number }>({
    eventHandler,
    detail,
  }: QueueItem<T>) {
    // @ts-expect-error TS2322: Type '(detail: T) => Promise<void>' is not assignable to type '(detail: { delay?: number | undefined; }) => Promise<void>'.
    this.queue.push({ eventHandler, detail });

    if (!this.isProcessing) {
      this.aborted = false;
      this.isProcessing = true;
      this.startTime = Date.now();
      this.processedItems = 0;
      this.items = [];

      while (this.queue.length > 0) {
        if (this.paused) {
          await new Promise((resolve) => {
            this.pausePromiseResolve = resolve;
          });
        }

        if (this.aborted) {
          this.remainingItems = this.queue.length;
          this.queue = [];
          break;
        }

        const item = this.queue.shift();
        if (item === undefined) continue;
        this.processedItems++;
        const startTime = Date.now();
        this.sendingMessage = Date.now();
        await item.eventHandler(item.detail);
        this.sendingMessage = false;
        const elapsedTime = Date.now() - startTime;
        this.items.push({ detail: item.detail, startTime, elapsedTime });

        if (item.detail.delay && this.queue.length !== 0) {
          this.waiting = Date.now();
          const waitStart = Date.now();
          const waitTarget = item.detail.delay * 1000;
          while (Date.now() - waitStart < waitTarget) {
            await this.wait(100);
            if (this.paused) {
              await new Promise((resolve) => {
                this.pausePromiseResolve = resolve;
              });
            }

            if (this.aborted) {
              this.remainingItems = this.queue.length;
              this.queue = [];
              break;
            }
          }
          this.waiting = false;
        }
      }

      this.endTime = Date.now();
      this.isProcessing = false;
    }
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    if (this.paused && this.pausePromiseResolve) {
      this.paused = false;
      this.pausePromiseResolve();
      this.pausePromiseResolve = undefined;
    }
  }

  public stop() {
    this.aborted = true;
    if (this.paused) {
      this.resume();
    }
  }

  public getStatus(): QueueStatus {
    return {
      elapsedTime: this.isProcessing
        ? Date.now() - this.startTime
        : this.endTime - this.startTime,
      isProcessing: this.isProcessing,
      items: this.items,
      sendingMessage:
        this.sendingMessage === false
          ? this.sendingMessage
          : Date.now() - this.sendingMessage,
      waiting:
        this.waiting === false ? this.waiting : Date.now() - this.waiting,
      processedItems: this.processedItems,
      remainingItems: this.aborted ? this.remainingItems : this.queue.length,
      totalItems: this.processedItems + this.queue.length,
    };
  }
}

const asyncQueue = new AsyncEventQueue();

export default asyncQueue;
