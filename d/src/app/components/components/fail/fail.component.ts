import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AccountService } from 'src/app/_services/account.service';
import { utlityService } from 'src/app/_services/utlity.service';
@Component({
  selector: 'app-fail',
  templateUrl: './fail.component.html',
  styleUrls: ['./fail.component.css']
})
export class FailComponent implements OnInit {
  constructor(public utlityService: utlityService,public accountService: AccountService,private route: ActivatedRoute,
    private router: Router,)
    { 
     this.router.events.pipe(
           filter(event => event instanceof NavigationEnd)
         ).subscribe(() => {
          
          
         });
    }
  ngOnInit(): void {
  }
  async reload(){
    location.reload();
  }
}
