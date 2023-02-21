import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';


const DATE_FORMAT:any = {
  month: '2-digit',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false
};

export interface FetchEvent {
  headless: boolean;
  taskId: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})

export class DataService {
  public events: FetchEvent[] = [];

  constructor() {
    this.init();
  }

  async init() {
    await Preferences.configure({group: 'BackgroundFetchDemo'});

    // Load persisted events from localStorage.
    let {value} = await Preferences.get({key: 'events'});
    if (value === null) {
      value = '[]';
      await Preferences.set({key: 'events', value: value});
    }
    this.events = this.events.concat(JSON.parse(value));
  }
  public async create(taskId:string, isHeadless:boolean = false) {
    this.events.push({
      taskId: taskId,
      headless: isHeadless,
      timestamp: this.getTimestamp(new Date())
    });
    await Preferences.set({key: 'events', value: JSON.stringify(this.events)});
  }

  public async destroy() {
    this.events = [];
    await Preferences.set({key: 'events', value: '[]'});
  }

  public getEvents(): FetchEvent[] {
    return this.events;
  }

  public getTimestamp(date: Date) {
    return new Intl.DateTimeFormat('en-US', DATE_FORMAT).format(date)

  }
}
