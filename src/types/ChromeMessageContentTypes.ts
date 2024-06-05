import type { ChromeMessageTypes } from "./ChromeMessageTypes";
import type Log from "./Log";
import type { Message } from "./Message";
import type QueueStatus from "./QueueStatus";

export default interface ChromeMessageContentTypes {
  [ChromeMessageTypes.QUEUE_STATUS]: {
    payload: undefined;
    response: QueueStatus;
  };
  [ChromeMessageTypes.SEND_MESSAGE]: {
    payload: Message;
    response: boolean;
  };
  [ChromeMessageTypes.ADD_LOG]: {
    payload: Log;
    response: boolean;
  };
  [ChromeMessageTypes.PAUSE_QUEUE]: {
    payload: undefined;
    response: boolean;
  };
  [ChromeMessageTypes.RESUME_QUEUE]: {
    payload: undefined;
    response: boolean;
  };
  [ChromeMessageTypes.STOP_QUEUE]: {
    payload: undefined;
    response: boolean;
  };
}
