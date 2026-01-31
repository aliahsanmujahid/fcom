import { Component, EventEmitter, Input, Output} from '@angular/core';
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {
  @Input() alert: boolean = false;
  @Input() size: 1 | 2 = 1; 
  @Input() title: string | null = null;
  @Output() close = new EventEmitter<boolean>();

  emitClose() {
    this.close.emit(false);
  }
}

