import { Attachment } from "types/Attachment";

const DATABASE_NAME = "WTFMessagesDB";
const MESSAGE_STORE_NAME = "WTFMessagesStore";

export class AsyncStorageManager {
    private database: IDBDatabase | null = null;

    async retrieveMessage(hash: number) {
        if (!this.database) this.database = await this.initializeDatabase();

        return new Promise<{ hash: string; attachment: Attachment }>((resolve, reject) => {
            const transaction = this.database!.transaction([MESSAGE_STORE_NAME], 'readonly');
            const messageStore = transaction.objectStore(MESSAGE_STORE_NAME);
            const request = messageStore.get(hash);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async storeMessage(messageAttachment: Attachment, hash?: number) {
        if (!this.database) this.database = await this.initializeDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.database!.transaction([MESSAGE_STORE_NAME], 'readwrite');
            const messageStore = transaction.objectStore(MESSAGE_STORE_NAME);

            hash = hash || AsyncStorageManager.calculateMessageHash(messageAttachment);

            const request = messageStore.add({ hash, attachment: messageAttachment });

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
                const database = (event.target as IDBOpenDBRequest).result;
                if (!database.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
                    database.createObjectStore(MESSAGE_STORE_NAME, { keyPath: "hash" });
                }
            };
        });
    }

    async clearDatabase() {
        if (!this.database) this.database = await this.initializeDatabase();

        return new Promise<void>((resolve, reject) => {
            const transaction = this.database!.transaction([MESSAGE_STORE_NAME], 'readwrite');
            const messageStore = transaction.objectStore(MESSAGE_STORE_NAME);
            const clearRequest = messageStore.clear();

            clearRequest.onerror = () => reject(clearRequest.error);
            clearRequest.onsuccess = () => resolve();
        });
    }

    static calculateMessageHash(messageAttachment: Attachment): number {
        const serialized = JSON.stringify({
                name: messageAttachment.name,
                lastModified: messageAttachment.lastModified,
                type: messageAttachment.type
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