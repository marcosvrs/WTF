export default interface QueueStatus {
  isProcessing: boolean;
  totalItems: number;
  processedItems: number;
  remainingItems: number;
  elapsedTime: number;
  processing: number | false;
  waiting: number | false;
  items: {
    detail: unknown;
    elapsedTime: number;
  }[];
}
