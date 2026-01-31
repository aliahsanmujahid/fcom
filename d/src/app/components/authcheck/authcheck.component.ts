import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { StorageService } from 'src/app/_services/storage.service';
import { utlityService } from 'src/app/_services/utlity.service';
@Component({
  selector: 'app-authcheck',
  templateUrl: './authcheck.component.html',
  styleUrls: ['./authcheck.component.css']
})
export class AuthcheckComponent implements OnInit {
  constructor(public storageService: StorageService,public accountService: AccountService,public utlityService: utlityService,
    private route: ActivatedRoute,private router: Router
  ) { }
  async ngOnInit(): Promise<void> {
    await this.setCurrentUser();
  }
  async setCurrentUser() {
    var res = {jwt : null};
    var jwt = await this.storageService.getItem('user');
    if(jwt){
      res.jwt = jwt;
    }else{
      this.route.params.subscribe(async (pa) => {
      if(pa?.jwt){
        res.jwt = pa?.jwt;
      }   
    });
    }
    if(res.jwt){
      this.accountService.setUser(res);
      this.router.navigate(['/dash',{}])
    }
  }
  getDecodedToken(token) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
