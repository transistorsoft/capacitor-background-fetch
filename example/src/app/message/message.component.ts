import { Component, OnInit, Input } from '@angular/core';
import { FetchEvent } from '../services/data.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  @Input() event: FetchEvent;

  constructor() { }

  ngOnInit() {}

}
