import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SettingsService } from 'src/app/_services/settings.service';
import { utlityService } from 'src/app/_services/utlity.service';
@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
constructor(public settingsService: SettingsService,public utlityService: utlityService,private router: Router) { }
  loader$: Observable<boolean>;
  ngOnInit() {
    this.loader$  = this.utlityService.loader$;
  }
}