import { MessageButtonsTypes } from '@wppconnect/wa-js/dist/chat/functions/prepareMessageButtons';
import { Message } from 'types/Message';

export default class ParseCSVMessages {
    public data: Record<string, string>[] = [];
    public header: string[] = [];

    public parseCSV = async (csvFile?: File) => {
        if (!csvFile || csvFile.type !== 'text/csv') {
            throw new Error(`Invalid file type (${csvFile?.type}). Please, upload a CSV file.`);
        }
        const text = await csvFile.text();
        const rows = text.split('\n');
        this.header = rows[0].split(',');
        for (let i = 1; i < rows.length; i++) {
            if (!rows[i]) continue;
            let record: Record<string, string> = {};
            let value = '';
            let quoteStarted = false;
            let keyIndex = 0;
            for (let char of rows[i]) {
                if (char === '"' && !quoteStarted) {
                    quoteStarted = true;
                    continue;
                } else if (char === '"' && quoteStarted) {
                    quoteStarted = false;
                    continue;
                }

                if (char === ',' && !quoteStarted) {
                    record[this.header[keyIndex]] = value.replace(/\\n/g, '\n');
                    value = '';
                    keyIndex++;
                } else {
                    value += char;
                }
            }
            if (keyIndex < this.header.length) {
                record[this.header[keyIndex]] = value.replace(/\\n/g, '\n');
            }

            if (Object.keys(record).length !== this.header.length) {
                throw new Error(`Invalid number of columns in line ${i + 1}.`);
            }

            this.data.push(record);
        }
    }

    private convertFiletoURL = async (file: File) => {
        return new Promise<{ name: string; type: string; url: string | ArrayBuffer; lastModified: number }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = ev => {
                if (ev.target === null || ev.target.result === null) return reject();
                resolve({
                    name: file.name,
                    type: file.type,
                    url: ev.target.result,
                    lastModified: file.lastModified
                });
            };
            reader.readAsDataURL(file);
        });
    }

    private parseButton = (button?: string): MessageButtonsTypes | undefined => {
        const parsedButton = button?.split(';');
        if (parsedButton && parsedButton.length > 2) {
            if (parsedButton[0] === 'url')
                return { url: parsedButton[1], text: parsedButton[2] };
            else if (parsedButton[0] === 'phoneNumber')
                return { phoneNumber: parsedButton[1], text: parsedButton[2] };
            else if (parsedButton[0] === 'id')
                return { id: parsedButton[1], text: parsedButton[2] };
        } else if (parsedButton && parsedButton.length > 1) {
            return { id: parsedButton[0], text: parsedButton[1] };
        }
    }

    private filterButtons = (buttons: (string | undefined)[]) => {
        const parsedButtons = buttons
            .map(button => this.parseButton(button))
            .filter((button): button is MessageButtonsTypes => !!button);

        return parsedButtons.length > 0 ? parsedButtons : undefined
    }

    private addPrefixToContact = (contact: string, prefix: number) => {
        const prefixToString = (prefix === 0 ? '' : prefix).toString();
        return prefixToString.concat(contact.trim().replace(/\D*/g, ''));
    }

    public parseMessages = async (csvHeaderMatch: Record<string, string | undefined>, prefix: number, delay: number, files?: File[]) => {
        const messages: Message[] = [];
        for (const command of this.data) {
            const mapColumns = {
                contact: csvHeaderMatch.contact ? command[csvHeaderMatch.contact] : undefined,
                message: csvHeaderMatch.message ? command[csvHeaderMatch.message] : undefined,
                attachment: csvHeaderMatch.attachment ? command[csvHeaderMatch.attachment] : undefined,
                button1: csvHeaderMatch.button1 ? command[csvHeaderMatch.button1] : undefined,
                button2: csvHeaderMatch.button2 ? command[csvHeaderMatch.button2] : undefined,
                button3: csvHeaderMatch.button3 ? command[csvHeaderMatch.button3] : undefined
            }
            if (!mapColumns.contact) continue;
            const contact = this.addPrefixToContact(mapColumns.contact, Number(prefix));
            const message = mapColumns.message;

            const findAttachment = mapColumns.attachment ? files?.find(file => file.name.normalize('NFC').toLowerCase() === mapColumns.attachment?.normalize('NFC').toLowerCase()) : undefined;
            if (mapColumns.attachment && !findAttachment) return console.error(`File ${mapColumns.attachment} not found!`);

            const attachment = findAttachment ? await this.convertFiletoURL(findAttachment) : undefined;
            
            messages.push({
                contact,
                //@ts-ignore
                message,
                //@ts-ignore
                attachment,
                options: {
                    buttons: this.filterButtons([mapColumns.button1, mapColumns.button2, mapColumns.button3]),
                    delay
                }
            });
        }

        return messages;
    }
}