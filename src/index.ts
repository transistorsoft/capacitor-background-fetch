import {
  registerPlugin,
  PluginListenerHandle,
  PluginResultError
} from '@capacitor/core';

import type {
  BackgroundFetchConfig,
  BackgroundFetchStatus,
  TaskConfig,
  NetworkType,
} from './definitions';

const EVENT_FETCH:string = "fetch";
const TAG:string         = "BackgroundFetch";

const STATUS_RESTRICTED:BackgroundFetchStatus = 0;
const STATUS_DENIED:BackgroundFetchStatus     = 1;
const STATUS_AVAILABLE:BackgroundFetchStatus  = 2;

const NETWORK_TYPE_NONE:NetworkType         = 0;
const NETWORK_TYPE_ANY:NetworkType          = 1;
const NETWORK_TYPE_UNMETERED:NetworkType    = 2;
const NETWORK_TYPE_NOT_ROAMING:NetworkType  = 3;
const NETWORK_TYPE_CELLULAR:NetworkType     = 4;

const NativeModule:any = registerPlugin('BackgroundFetch');

let subscriber:PluginListenerHandle | null = null;

/**
* BackgroundFetch is a module to receive periodic callbacks (min every 15 min) while your app is running in the background or terminated.
*/
export class BackgroundFetch {
  /**
  * Background fetch updates are unavailable and the user cannot enable them again. For example, this status can occur when parental controls are in effect for the current user.
  */
  static get STATUS_RESTRICTED() { return STATUS_RESTRICTED; }
  /**
  * The user explicitly disabled background behavior for this app or for the whole system.
  */
  static get STATUS_DENIED() { return STATUS_DENIED; }
  /**
  * Background fetch is available and enabled.
  */
  static get STATUS_AVAILABLE() { return STATUS_AVAILABLE; }
  /**
  * This job doesn't care about network constraints, either any or none.
  */
  static get NETWORK_TYPE_NONE() { return NETWORK_TYPE_NONE; }
  /**
  * This job requires network connectivity.
  */
  static get NETWORK_TYPE_ANY() { return NETWORK_TYPE_ANY; }
  /**
  * This job requires network connectivity that is a cellular network.
  */
  static get NETWORK_TYPE_CELLULAR() { return NETWORK_TYPE_CELLULAR; }
  /**
  * This job requires network connectivity that is unmetered.
  */
  static get NETWORK_TYPE_UNMETERED() { return NETWORK_TYPE_UNMETERED; }
  /**
  * This job requires network connectivity that is not roaming.
  */
  static get NETWORK_TYPE_NOT_ROAMING() { return NETWORK_TYPE_NOT_ROAMING; }

  /**
  * Initial configuration of BackgroundFetch, including config-options and Fetch-callback.  The [[start]] method will automatically be executed.
  */
  static configure(config:BackgroundFetchConfig, onEvent:(taskId:string) => void, onTimeout?:(taskId:string) => void):Promise<BackgroundFetchStatus> {
    if (typeof(onEvent) !== 'function') {
      throw "BackgroundFetch requires an event callback at 2nd argument";
    }
    if (typeof(onTimeout) !== 'function') {
      console.warn("[BackgroundFetch] configure:  You did not provide a 3rd argument onTimeout callback.  This callback is a signal from the OS that your allowed background time is about to expire.  Use this callback to finish what you're doing and immediately call BackgroundFetch.finish(taskId)");
      onTimeout = (taskId:string) => {
        console.warn('[BackgroundFetch] default onTimeout callback fired.  You should provide your own onTimeout callbcak to .configure(options, onEvent, onTimeout)');
        BackgroundFetch.finish(taskId);
      }
    }
    const myOnTimeout:Function = onTimeout;

    if (subscriber !== null) {
      subscriber.remove();
      subscriber = null;
    }

    subscriber = NativeModule.addListener(EVENT_FETCH, (event:any) => {
      if (!event.timeout) {
        onEvent(event.taskId);
      } else {
        myOnTimeout(event.taskId);
      }
    });

    config = config || {};

    return new Promise((resolve:Function, reject:Function) => {
      NativeModule.configure({options:config}).then((result:any) => {
        resolve(result.status);
      }).catch((error:PluginResultError) => {
        console.warn(TAG, "ERROR:", error);
        reject(error.message);
      });
    });
  }

  /**
  * Add an extra fetch event listener in addition to the one initially provided to [[configure]].
  * @event
  */
  static scheduleTask(config:TaskConfig):Promise<void> {
    return new Promise((resolve, reject) => {
      return NativeModule.scheduleTask({options:config}).then(() => {
        resolve();
      }).catch((error:PluginResultError) => {
        reject(error.message);
      });
    });
  }

  /**
  * Start subscribing to fetch events.
  */
  static start():Promise<BackgroundFetchStatus> {
    return new Promise((resolve:Function, reject:Function) => {
      NativeModule.start().then((result:any) => {
        resolve(result.status);
      }).catch((error:PluginResultError) => {
        reject(error.message);
      });
    });
  }

  /**
  * Stop subscribing to fetch events.
  */
  static stop(taskId?:string):Promise<void> {
    return new Promise((resolve:Function, reject:Function) => {
      NativeModule.stop({taskId:taskId}).then(() => {
        resolve();
      }).catch((error:PluginResultError) => {
        reject(error.message);
      })
    });
  }
  /**
  * You must execute [[finish]] within your fetch-callback to signal completion of your task.
  */
  static finish(taskId:string):Promise<void> {
    return NativeModule.finish({taskId: taskId});
  }

  /**
  * Query the BackgroundFetch API status
  *
  * | BackgroundFetchStatus              | Description                                     |
  * |------------------------------------|-------------------------------------------------|
  * | BackgroundFetch.STATUS_RESTRICTED  | Background fetch updates are unavailable and the user cannot enable them again. For example, this status can occur when parental controls are in effect for the current user. |
  * | BackgroundFetch.STATUS_DENIED      | The user explicitly disabled background behavior for this app or for the whole system. |
  * | BackgroundFetch.STATUS_AVAILABLE   | Background fetch is available and enabled.      |
  */
  static status():Promise<BackgroundFetchStatus> {
    return new Promise((resolve:Function, reject:Function) => {
      NativeModule.status().then((result:any) => {
        resolve(result.status);
      }).catch((error:PluginResultError) => {
        reject(error.message);
      })
    })
  }
}

export * from './definitions';
