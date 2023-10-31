import Log from "./Log";
import { Message } from "./Message";
import QueueStatus from "./QueueStatus";
import { ChromeMessageTypes } from "./ChromeMessageTypes";
import { Poll } from "./Poll";

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
  [ChromeMessageTypes.SEND_POLL]: {
    payload: Poll;
    response: boolean;
  };
}
