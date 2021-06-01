import { registerPlugin } from '@capacitor/core';

import type { BackgroundFetchPlugin } from './definitions';

const BackgroundFetch = registerPlugin<BackgroundFetchPlugin>(
  'BackgroundFetch',
  {
    web: () => import('./web').then(m => new m.BackgroundFetchWeb()),
  },
);

export * from './definitions';
export { BackgroundFetch };
