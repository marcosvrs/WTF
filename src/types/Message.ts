import type { MessageButtonsTypes } from "@wppconnect/wa-js/dist/chat/functions/prepareMessageButtons";
import type { Attachment } from "./Attachment";

export interface Message {
  contact: string;
  message: string;
  attachment: Attachment;
  buttons: MessageButtonsTypes[];
  delay?: number;
}
