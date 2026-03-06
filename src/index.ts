import 'dotenv/config';
import { app } from './app';
import { getStoreFilePath, loadStore } from './services/store.service';

const port = Number(process.env.PORT ?? 39393);

const bootstrap = (): void => {
  loadStore();

  app.listen(port, '0.0.0.0', () => {
    console.log(`[LinkCBot] Backend server running on http://127.0.0.1:${port}`);
    console.log(`[LinkCBot] Store file: ${getStoreFilePath()}`);
  });
};

bootstrap();
