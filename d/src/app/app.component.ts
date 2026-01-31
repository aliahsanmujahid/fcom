import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from './_services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { utlityService } from 'src/app/_services/utlity.service';
import { SettingsService } from './_services/settings.service';
import { environment } from 'src/environments/environment';
import { User } from './_models/user';
import { Title } from '@angular/platform-browser';
import { StorageService } from './_services/storage.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  favIcon: HTMLLinkElement = document.querySelector('#favIcon');
  htmltitle: HTMLLinkElement = document.querySelector('#htmltitle');
  user:User = null;
  constructor( public utlityService: utlityService,
    public storageService: StorageService,
    private route: ActivatedRoute, private titleService: Title,
    private router: Router,public accountService: AccountService,
    public settingsService: SettingsService,) {}
  navbar = false;
  innerWidth:number=0;
  currentUser$: Observable<User>;
  async ngOnInit(): Promise<void> {
    this.accountService.setCheckedUser(true);
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
        this.user = user;
        this.utlityService.livereport();
        this.getsitecontent();
      }
    });
    this.innerWidth = window.innerWidth;
    this.currentUser$  = this.accountService.currentUser$;
    this.htmltitle.textContent = document.location.hostname.replace(/(^\w)/, c => c.toUpperCase());
  }
  getsitecontent(){
    var htmltitle: HTMLLinkElement = document.querySelector('#htmltitle');
    htmltitle.textContent = document.location.hostname.replace(/(^\w)/, c => c.toUpperCase());
    var favIcon: HTMLLinkElement = document?.querySelector('#favIcon');
    this.settingsService.getsitecontent().subscribe( async res => {
    if(res?.favicon && favIcon){
      (favIcon.href = res?.favicon);
      }
    });
  }
}
