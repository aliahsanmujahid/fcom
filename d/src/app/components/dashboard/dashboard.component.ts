import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { SettingsService } from 'src/app/_services/settings.service';
import { utlityService } from 'src/app/_services/utlity.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(public accountService: AccountService,public settingsService:SettingsService,
    public utlityService:utlityService,private route: ActivatedRoute,
    private router: Router) { }
  user = null;
  type = null;
  data = [];
  ngOnInit(): void {
    this.accountService.setCheckedUser();
    this.accountService.currentUser$.subscribe( user => {
      if(user){
        this.user = user;
      }
    });
    this.getallreport();
  }
  getallreport(){
    this.settingsService.getallreport().subscribe(res =>{
      this.data = res;
    });
  }
}