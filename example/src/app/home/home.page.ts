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
      minimumFetchInterval: 15,
      stopOnTerminate: false,
      enableHeadless: true
    }, async (taskId) => {
      console.log('[BackgroundFetch] EVENT:', taskId);
      // Perform your work in an awaited Promise
      const result = await this.performYourWorkHere();
      console.log('[BackgroundFetch] work complete:', result);
      // [REQUIRED] Signal to the OS that your work is complete.
      BackgroundFetch.finish(taskId);
    }, async (taskId) => {
      // The OS has signalled that your remaining background-time has expired.
      // You must immediately complete your work and signal #finish.
      console.log('[BackgroundFetch] TIMEOUT:', taskId);
      // [REQUIRED] Signal to the OS that your work is complete.
      BackgroundFetch.finish(taskId);
    });

    // Checking BackgroundFetch status:
    if (status !== BackgroundFetch.STATUS_AVAILABLE) {
      // Uh-oh:  we have a problem:
      if (status === BackgroundFetch.STATUS_DENIED) {
        alert('The user explicitly disabled background behavior for this app or for the whole system.');
      } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
        alert('Background updates are unavailable and the user cannot enable them again.')
      }
    }
  }

  async performYourWorkHere() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, 5000);
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
