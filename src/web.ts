import { WebPlugin } from '@capacitor/core';

import type { BackgroundFetchPlugin } from './definitions';

export class BackgroundFetchWeb
  extends WebPlugin
  implements BackgroundFetchPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
