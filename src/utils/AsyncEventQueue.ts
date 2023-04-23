import type QueueStatus from '../types/QueueStatus';

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
    private items: { detail: any; startTime: number; elapsedTime: number }[] = [];
    private sendingMessage: number | false = false;
    private waiting: number | false = false;

    private async wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public async add<T extends { delay?: number; }>({ eventHandler, detail }: QueueItem<T>): Promise<void> {
        this.queue.push({ eventHandler, detail });

        if (!this.isProcessing) {
            this.isProcessing = true;
            this.startTime = Date.now();
            this.processedItems = 0;
            this.items = [];

            while (this.queue.length > 0) {
                const item = this.queue.shift();
                if (item === undefined) continue;
                this.processedItems++;
                const startTime = Date.now();
                this.sendingMessage = Date.now();
                await item.eventHandler(item.detail);
                this.sendingMessage = false;
                const elapsedTime = Date.now() - startTime;
                this.items.push({ detail: item.detail, startTime, elapsedTime });
                if (this.queue.length !== 0 && item.detail.delay) {
                    this.waiting = Date.now();
                    await this.wait(item.detail.delay * 1000);
                    this.waiting = false;
                }
            }

            this.endTime = Date.now();
            this.isProcessing = false;
        }
    }

    public getStatus(): QueueStatus {
        const remainingItems = this.queue.length;

        return {
            elapsedTime: this.isProcessing ? Date.now() - this.startTime : this.endTime - this.startTime,
            isProcessing: this.isProcessing,
            items: this.items,
            sendingMessage: this.sendingMessage === false ? this.sendingMessage : Date.now() - this.sendingMessage,
            waiting: this.waiting === false ? this.waiting : Date.now() - this.waiting,
            processedItems: this.processedItems,
            remainingItems,
            totalItems: this.processedItems + remainingItems,
        };
    }
}

const asyncQueue = new AsyncEventQueue();

export default asyncQueue;