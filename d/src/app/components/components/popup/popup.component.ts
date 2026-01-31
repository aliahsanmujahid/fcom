import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SettingsService } from 'src/app/_services/settings.service';
import { utlityService } from 'src/app/_services/utlity.service';
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {
constructor(public settingsService: SettingsService,public utlityService: utlityService,private router: Router) { }
  popup$: Observable<boolean>;
  loader$: Observable<boolean>;
  popuptxt$: Observable<string>;
  ngOnInit() {
    this.popup$  = this.utlityService.popup$;
    this.popuptxt$  = this.utlityService.popuptxt$;
  }
  getClass(txt){
    if(txt.split('/')[0] == 1){
      return 'flex items-center text-blue-800 border-t-4 border-blue-300 bg-blue-50 ';
    }
    if(txt.split('/')[0] == 2){
      return ' flex items-center text-red-800 border-t-4 border-red-300 bg-red-50  ';
    }
    if(txt.split('/')[0] == 3){
      return ' flex items-center text-emerald-800 border-t-4 border-emerald-300 bg-emerald-50 ';
    } 
    return ' flex items-center text-emerald-800 border-t-4 border-emerald-300 bg-emerald-50 ';
  }
}