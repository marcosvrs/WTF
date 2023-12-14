export default interface QueueStatus {
    isProcessing: boolean;
    paused: boolean;
    totalItems: number;
    processedItems: number;
    failedItems: number;
    successfulItems: number;
    remainingItems: number;
    elapsedTime: number;
    sendingMessage: number | false;
    waiting: number | false;
    items: {
        detail: any;
        elapsedTime: number;
    }[];
}