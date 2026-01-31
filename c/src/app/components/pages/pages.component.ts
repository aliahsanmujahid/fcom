import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { SettingsService, Shop } from 'src/app/_services/settings.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
  constructor(public settingsService: SettingsService,
  private router: Router,public accountService: AccountService,
  public utlityService: utlityService,private route: ActivatedRoute) {
      this.utlityService.hidealert();
      this.utlityService.hidereviewalert();
      this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.utlityService.scrollTop();
    });
  }
  ngOnInit(): void {
    this.utlityService.setParams(new Shop(),false);
    this.accountService.setCheckedUser();
    this.route.params.subscribe(async params => {
      if(params){
        if(params?.name){
          this.getpages(params?.name);
          this.utlityService.setmenuname(params?.name);
        }else{
          this.router.navigateByUrl('/shop');
        }
      }
    });
  }
  pagescontent = null;
  getpages(name){
    this.settingsService.getpages().subscribe( res =>{
       if(res){
        this.pagescontent = res?.find( x => x.name == name)?.c;
        if(!this.pagescontent){
          this.router.navigateByUrl('/shop');
        }
       }
    });
  }
}
