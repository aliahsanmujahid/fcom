import { AccountService } from './../../_services/account.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/_services/product.service';
import { BasketService } from 'src/app/_services/basket.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { SettingsService, Shop } from 'src/app/_services/settings.service';
import { StorageService } from 'src/app/_services/storage.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit{
  stopscroll  = false;
  isloading : boolean = false
  page = 1;
  params = new Shop();
  skip = environment.skip;
  user = null;
  constructor(private route: ActivatedRoute,public productService: ProductService,
    public accountService: AccountService,public basketService: BasketService,
    public settingsService: SettingsService,public storageService:StorageService,
    public utlityService: utlityService,private router: Router) {
      this.router.events.subscribe(async (event) => {
              if (event instanceof NavigationEnd) {
                this.utlityService.hidealert();
                this.utlityService.hidereviewalert();
              }
            });
    }
  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async params => {
    await this.getoffers();
    });
    this.accountService.setCheckedUser();
    this.accountService.currentUser$.subscribe(user => {
      if(user){
        this.user = user;
      }
    });
  }
  nomoreitem = false;
  offers = [];
  getoffers(){
    this.productService.getoffers(this.page++).subscribe( res => {
      this.offers = res;
      if((res?.coupon?.length == 0) || res?.length < (this.skip)){
        this.nomoreitem = true;
      }
    });
  }
  nomoreforuser = [];
  loadmoreoffer(offer){
     this.productService.loadmoreoffer(offer?.id,this.page++).subscribe( res => {
      offer.coupons.push(...(res?.coupons || []));
      if((res?.coupon?.length == 0)){
         this.nomoreforuser.push(offer?.id);
      }
    });
  }
  onScroll(){
    if(this.nomoreitem){
       return;
    }
     this.productService.getoffers(this.page++).subscribe( res => {
     this.offers.push(...res);
     if((res?.coupon?.length == 0) || res?.length < (this.skip)){
        this.nomoreitem = true;
      }
    });
  }
 showReview(offer){
   if(offer?.treview <= 0){
     return;  
   } 
   this.utlityService.setreviewfor({id:offer?.id,type:2});
   this.utlityService.showalert('reviews');
  }
 
}
