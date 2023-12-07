import type QueueStatus from '../types/QueueStatus';
import * as WPP from '@wppconnect/wa-js';

//Constants for delay to avoid blocking
const MIN_DELAY = 8; // Minimum value if it does not exist
const MINUTES_TO_PAUSE = 210; // Seconds of waiting for every 80 messages sent
const DELAY_MULTIPLIER = 2; // Multiplier for delay

interface QueueItem<T = any> {
    eventHandler: (detail: T) => Promise<void>;
    detail: T;
}

class AsyncEventQueue {
    private queue: QueueItem[] = [];
    private isProcessing: boolean = false;
    private startTime: number = 0;
    private endTime: number = 0;
    private processedItems: number = 0;
    private failedItems: number = 0;
    private successfulItems: number = 0;
    private remainingItems: number = 0;
    private items: { detail: any; startTime: number; elapsedTime: number }[] = [];
    private sendingMessage: number | false = false;
    private waiting: number | false = false;
    private aborted: boolean = false;
    private paused: boolean = false;
    private pausePromiseResolve: ((value?: unknown) => void) | null = () => { };

    private async wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async add<T extends { delay?: number; }>({ eventHandler, detail }: QueueItem<T>) {
        this.queue.push({ eventHandler, detail });

        if (!this.isProcessing) {
            this.aborted = false;
            this.isProcessing = true;
            this.startTime = Date.now();
            this.processedItems = 0;
            this.failedItems = 0;
            this.successfulItems = 0;
            this.items = [];

            while (this.queue.length > 0) {
                if (this.paused) {
                    await new Promise(resolve => {
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

                const resultAux = await WPP.contact.queryExists(item.detail.contact);
                if (!(resultAux && resultAux.wid)) {
                    // Number does not exist, defines the delay between MAX_DELAY and MIN_DELAY
                    item.detail.delay = Math.floor(Math.random() * ((DELAY_MULTIPLIER * MIN_DELAY) - MIN_DELAY)) + MIN_DELAY;
                    this.failedItems++;
                } else {
                    // Number exists, defines the random delay
                    item.detail.delay = Math.floor(Math.random() * ((DELAY_MULTIPLIER * item.detail.delay) - item.detail.delay)) + item.detail.delay;
                    this.successfulItems++;
                }
                // Check if you have reached 80 messages sent
                if (this.processedItems % 40 === 0) {
                    // Pause processing for MINUTES_TO_PAUSE
                    item.detail.delay = MINUTES_TO_PAUSE;
                }

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
                            await new Promise(resolve => {
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
            this.pausePromiseResolve = null;
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
            elapsedTime: this.isProcessing ? Date.now() - this.startTime : this.endTime - this.startTime,
            isProcessing: this.isProcessing,
            items: this.items,
            sendingMessage: this.sendingMessage === false ? this.sendingMessage : Date.now() - this.sendingMessage,
            waiting: this.waiting === false ? this.waiting : Date.now() - this.waiting,
            processedItems: this.processedItems,
            failedItems: this.failedItems,
            successfulItems: this.successfulItems,
            remainingItems: this.aborted ? this.remainingItems : this.queue.length,
            totalItems: this.processedItems + this.queue.length,
        };
    }
}

const asyncQueue = new AsyncEventQueue();

export default asyncQueue;