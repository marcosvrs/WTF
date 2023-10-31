import type { Attachment } from './Attachment'
import type { AudioMessageOptions, AutoDetectMessageOptions, DocumentMessageOptions, ImageMessageOptions, StickerMessageOptions, TextMessageOptions, VideoMessageOptions } from '@wppconnect/wa-js/dist/chat'

type MessageBase = {
    contact: string;
};

export type OptionsTypesWithAttachment = AutoDetectMessageOptions | AudioMessageOptions | DocumentMessageOptions | ImageMessageOptions | VideoMessageOptions | StickerMessageOptions;

type MessageWithText = MessageBase & {
    message: string;
    options?: TextMessageOptions;
};

type MessageWithAttachment = MessageBase & {
    attachment: Attachment;
    options?: OptionsTypesWithAttachment;
};

type MessageWithTextAndAttachment = MessageBase & {
    message: string;
    attachment: Attachment;
    options?: OptionsTypesWithAttachment;
};

export type Message = MessageWithText | MessageWithAttachment | MessageWithTextAndAttachment;
