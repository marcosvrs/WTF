export default interface QueueStatus {
    isProcessing: boolean;
    totalItems: number;
    processedItems: number;
    remainingItems: number;
    elapsedTime: number;
    sendingMessage: number | false;
    items: {
        detail: any;
        elapsedTime: number;
    }[];
}