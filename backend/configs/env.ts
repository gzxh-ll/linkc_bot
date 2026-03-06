export const env = {
  port: Number(process.env.PORT ?? 39393),
  dataDir: process.env.DATA_DIR ?? './runtime-data',
  callbackLogLimit: Number(process.env.CALLBACK_LOG_LIMIT ?? 200)
};
