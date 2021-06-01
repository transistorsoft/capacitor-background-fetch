import { Component } from '@angular/core';
import { DataService, Message } from '../services/data.service';

import {BackgroundFetch} from '@transistorsoft/capacitor-background-fetch';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private data: DataService) {}

  ionViewWillEnter() {
    this.initBackgroundFetch();
  }

  async initBackgroundFetch() {
    const status = await BackgroundFetch.configure({
      minimumFetchInterval: 15
    }, (taskId) => {
      console.log('[BackgroundFetch] onFetch', taskId);
      BackgroundFetch.finish(taskId);
    }, (taskId) => {
      console.log('[BackgroundFetch] onTimeout', taskId);
      BackgroundFetch.finish(taskId);
    });
  }
  refresh(ev) {
    setTimeout(() => {
      ev.detail.complete();
    }, 3000);
  }

  getMessages(): Message[] {
    return this.data.getMessages();
  }

}
