import { Message } from "types/Message";

const DATABASE_NAME = "WTFMessagesDB";
const MESSAGE_STORE_NAME = "WTFMessagesStore";

export class AsyncStorageManager {
    private database: IDBDatabase | null = null;

    async retrieveMessage(hash: number) {
        if (!this.database) this.database = await this.initializeDatabase();

        return new Promise<Pick<Message, 'message' | 'attachment' | 'buttons'>>((resolve, reject) => {
            const transaction = this.database!.transaction([MESSAGE_STORE_NAME], 'readonly');
            const messageStore = transaction.objectStore(MESSAGE_STORE_NAME);
            const request = messageStore.get(hash);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async storeMessage(messageData: Pick<Message, 'message' | 'attachment' | 'buttons'>, hash?: number) {
        if (!this.database) this.database = await this.initializeDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.database!.transaction([MESSAGE_STORE_NAME], 'readwrite');
            const messageStore = transaction.objectStore(MESSAGE_STORE_NAME);

            hash = hash || AsyncStorageManager.calculateMessageHash(messageData);

            const request = messageStore.add({
                hash, message: {
                    message: messageData.message,
                    attachment: messageData.attachment,
                    buttons: messageData.buttons
                }
            });

            request.onerror = () => {
                if (request.error?.name === 'ConstraintError')
                    resolve();
                else
                    reject(request.error);
            };
            request.onsuccess = () => resolve();
        });
    }

    private async initializeDatabase() {
        return new Promise<IDBDatabase>((resolve, reject) => {
            const openRequest = indexedDB.open(DATABASE_NAME, 1);

            openRequest.onerror = () => reject(openRequest.error);
            openRequest.onsuccess = () => resolve(openRequest.result);
            openRequest.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
                    db.createObjectStore(MESSAGE_STORE_NAME, { keyPath: "hash" });
                }
            };
        });
    }

    static calculateMessageHash(messageData: Pick<Message, 'message' | 'attachment' | 'buttons'>): number {
        const serialized = JSON.stringify({
            message: messageData.message,
            attachment: {
                name: messageData.attachment?.name,
                lastModified: messageData.attachment?.lastModified,
                type: messageData.attachment?.type
            },
            buttons: messageData.buttons
        });
        let hash = 0;
        for (let i = 0; i < serialized.length; i++) {
            hash = (hash + serialized.charCodeAt(i)) & 0xFFFFFFFF; // Ensure it doesn't overflow
        }
        return hash;
    }
}

const storageManager = new AsyncStorageManager();

export default storageManager;