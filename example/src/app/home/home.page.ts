import {
  Component,
  NgZone } from '@angular/core';

import {AlertController} from '@ionic/angular';

import { DataService, FetchEvent } from '../services/data.service';

import {BackgroundFetch} from '@transistorsoft/capacitor-background-fetch';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  state:any = {
    enabled:true,
    status: -1
  }

  constructor(private data: DataService, private alertController:AlertController, private zone: NgZone) {}

  ionViewWillEnter() {

  }

  ngAfterContentInit() {
    this.initBackgroundFetch();
  }

  async initBackgroundFetch() {
    const status = await BackgroundFetch.configure({
      minimumFetchInterval: 15,
      stopOnTerminate: false,
      enableHeadless: true
    }, async (taskId) => {
      console.log('[BackgroundFetch] EVENT:', taskId);

      // Add record to list within NgZone
      this.zone.run(() => {
        this.data.create(taskId, false);
      });

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

    this.state.status = status;

    // Checking BackgroundFetch status:
    if (status !== BackgroundFetch.STATUS_AVAILABLE) {
      this.state.enabled = false;
      // Uh-oh:  we have a problem:
      if (status === BackgroundFetch.STATUS_DENIED) {
        alert('The user explicitly disabled background behavior for this app or for the whole system.');
      } else if (status === BackgroundFetch.STATUS_RESTRICTED) {
        alert('Background updates are unavailable and the user cannot enable them again.')
      }
    }
  }

  onClickClear() {
    this.data.destroy();
  }

  async performYourWorkHere() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }

  async onToggleEnabled() {
    if (!this.state.enabled) {
      await BackgroundFetch.stop();
    } else {
      await BackgroundFetch.start();
    }
  }

  async onClickScheduleTask() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Schedule Task',
      inputs: [{
        name: 'taskId',
        type: 'text',
        value: 'com.transistorsoft.customtask',
        placeholder: 'Task identifier (eg: com.transistorsoft.customtask'
      },{
        name: 'delay',
        label: 'Delay',
        type: 'number',
        placeholder: 'Delay in milliseconds'
      }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Submit',
        handler: (result) => {
          if (!result.delay) {
            window.alert('You must specify a delay in milliseconds');
            setTimeout(this.onClickScheduleTask.bind(this), 1);
            return;
          }
          BackgroundFetch.scheduleTask({
            taskId: result.taskId,
            delay: result.delay
          });
        }
      }]
    });
    await alert.present();
  }

  getEvents(): FetchEvent[] {
    return this.data.getEvents();
  }

}
