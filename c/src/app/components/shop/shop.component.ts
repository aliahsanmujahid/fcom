import { AccountService } from './../../_services/account.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/_services/product.service';
import { BasketService } from 'src/app/_services/basket.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { SettingsService, Shop, Want } from 'src/app/_services/settings.service';
import { StorageService } from 'src/app/_services/storage.service';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  stopscroll  = false;
  isloading : boolean = false;
  nomoreitem = true;
  products = null;
  params = new Shop();
  user = null;
  constructor(private route: ActivatedRoute,public productService: ProductService,
    public accountService: AccountService,public basketService: BasketService,
    public settingsService: SettingsService,public storageService:StorageService,
    public utlityService: utlityService,private router: Router) {
      this.utlityService.hidealert();
      this.utlityService.hidereviewalert();
      this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
          ).subscribe(() => {
            this.utlityService.scrollTop();
          });
    }
  async ngOnInit(): Promise<void> {
      this.utlityService.setmenuname(this.router.url);
      this.accountService.setCheckedUser();
      this.accountService.currentUser$.subscribe( user => {
        if(user){
          this.user = user;
        }
      });
      if(this.route.params){
        this.route.params.subscribe(async (pa) => {
          this.stopscroll  = false;
          if(!pa?.cateid){
            this.params.cateid = null;
            this.params.catename = null;
           }else{
            this.params.cateid = pa.cateid;
            this.params.catename = pa.catename;
           }
            if(!pa?.subcateid){
            this.params.subcateid = null;
            this.params.subcatename = null;
            }else{
            this.params.subcateid = pa.subcateid;
            this.params.subcatename = pa.subcatename;
            }
            if(!pa?.search){
            this.params.search = null;
           }else{
            this.params.search = pa.search;
           }
            if(!pa?.fav){
            this.params.fav = null;
            this.params.userid = null;
            }else{
              if(!pa?.userid){
                this.params.fav = null;
                this.params.userid = null;
              }else{
                this.params.fav = pa.fav;
                this.params.userid = pa.userid;
              }
            }
            if(!pa?.sortby){
            this.params.sortby = null;
            this.params.sortbyName = null;
            }else{
            this.params.sortby = pa.sortby;
            this.params.sortbyName = pa.sortbyName;
           }
          this.utlityService.setParams(this.params,false);
          this.getProducts();
        });
      };
    this.getcategories();  
  }
  onScroll(): void {
    !this.params.page ? this.params.page = 0 : '';
    if(this.stopscroll == false){
      this.params.page++;
      this.isloading = true
      this.scrollgetProducts();
    }
  }
  ngOnDestroy(): void {
    this.params.fav = false;
    this.utlityService.setmenuname(null);
  }
  onClose(): void {
    this.params.fav = false;
  }
  skip = environment.skip;
  async getProducts(){
      this.utlityService.showloader(true);
      this.products = [];
      this.params.page = 0;
      (await this.productService.getallproducts(this.params)).subscribe( async res =>{
        this.products = res;
        if(res?.length == 0 || res == null || res?.length < (this.skip)){
         this.stopscroll = true;
         this.nomoreitem = false;
        }else{
         this.stopscroll = false;
        }
        this.utlityService.showloader(false);
      });
  }
  async scrollgetProducts(){
    await this.utlityService.showloader(true);
      (await this.productService.getallproducts(this.params)).subscribe( res =>{
        this.products?.push(...res);
        this.isloading = false
        if(res?.length == 0 || res == null || res?.length < this.skip){
         this.stopscroll = true;
         this.isloading = false;
         this.nomoreitem = false;
        }else{
          this.stopscroll = false;
        }
        this.utlityService.showloader(false);
    });
  }
  active
  async checkSelect($event,item){
    if ($event.target.checked) {
      this.active = item?.id;
      if(item){
        this.params.sortby = item.id;
        this.params.sortbyName = item.name;
        this.params.page = 0;
        this.params.fav = null;
        this.utlityService.setParams(this.params);
        if(item){
          var want = await this.storageService.getItem('want') || new Want();
          want.showed = 0;
          want.sortby = item?.id;
          await this.storageService.setItem('want',want);
        }
      }
    }else{
        this.params.sortby = null;
        this.params.sortbyName = null;
        this.params.page = 0;
        this.params.fav = null;
        this.utlityService.setParams(this.params);
    }
  }
  category: any = [];
  getcategories(){
    this.settingsService.getcategories().subscribe( res => {
      this.category = res;
  });
}
}
