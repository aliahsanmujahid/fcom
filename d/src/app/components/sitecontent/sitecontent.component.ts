import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AccountService } from 'src/app/_services/account.service';
import { SettingsService } from 'src/app/_services/settings.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-sitecontent',
  templateUrl: './sitecontent.component.html',
  styleUrls: ['./sitecontent.component.css']
})
export class SitecontentComponent implements OnInit {
  param:string = '';
  constructor(private http: HttpClient,
    public accountService: AccountService,public settingsService: SettingsService,
    public utlityService: utlityService,private route: ActivatedRoute) { }
  model = {id:0,scripts:'',facebook:'',tiktok:'',instagram:'',
    youtube:'',logo:'',favicon:''};
  async ngOnInit(): Promise<void> {
    this.accountService.setCheckedUser();
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
       
      }
    })
    this.route.params.subscribe(params => {
      window.scrollTo(0, 0);
      if(params['p']){
        this.param = params['p'];
      }
    });
    this.settingsService.getsitecontent().subscribe( res => {
      if(res){
        this.model = res;
      }
    });
  }
  createupdatesitecontent(){
    this.settingsService.createupdatesitecontent(this.model).subscribe(res =>{
      if(res){
        this.model = res;
        this.utlityService.show("1/Successfully created.");
      }
    });
  }

}
