import { CallbackLog } from '../types/config';

const MAX_LOG_SIZE = 200;

export const appendCallbackLog = (logs: CallbackLog[], log: CallbackLog): CallbackLog[] => {
  const nextLogs = [log, ...logs];
  if (nextLogs.length > MAX_LOG_SIZE) {
    return nextLogs.slice(0, MAX_LOG_SIZE);
  }
  return nextLogs;
};
