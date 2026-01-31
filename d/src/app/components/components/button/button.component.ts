import { Component, Input} from '@angular/core';
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() txt: string = '';
  @Input() ltxt: string = '';
  @Input() class: string = '';
  @Input() isloading: boolean = false;
  @Input() heart: boolean = false;
  @Input() heartcoclor: boolean = false;
}
