import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { AccountService } from 'src/app/_services/account.service';
import { BasketService } from 'src/app/_services/basket.service';
import { OrderService } from 'src/app/_services/order.service';
import {Basket, SettingsService, Shop } from 'src/app/_services/settings.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/_services/storage.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  basket:Basket = null;
  constructor(public accountService: AccountService,public basketService: BasketService,
    private orderService: OrderService,public utlityService: utlityService,
    public storageService: StorageService,private formBuilder: UntypedFormBuilder,
    private router: Router,public settingsService: SettingsService) {
      this.utlityService.hidealert();
      this.utlityService.hidereviewalert();
      this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
          ).subscribe(() => {
            this.utlityService.scrollTop();
          });

    }
  user:any=null;
  isloading: boolean = null;
  setaddress = false;
  delivery = [];
  cartForm: UntypedFormGroup;
  async ngOnInit(): Promise<void> {
    this.cartForm = this.formBuilder.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      district: ['', Validators.required],
      upazila: ['', Validators.required],
      address: ['', Validators.required],
    });
    this.utlityService.setParams(new Shop(),false);
    this.basketService.basket$.subscribe( res => {
      if(res){
        this.basket = res;
      }
    });
    this.accountService.setCheckedUser();
    this.accountService.currentUser$.subscribe(user => {
      if(user){
        this.user = user;
      }
    });
    this.getbdaddress();  
  }
  submitted = false;
  get f() {
    return this.cartForm.controls;
  }
  async basketcheckset(basket: any): Promise<boolean> {
    const res = await firstValueFrom(this.basketService.basketcheckset(basket));
    if (!res?.success) {
      this.basketService.setBasketSource(res?.basket);
      return false;
    }
    if (res?.success) {
      return true;
    }
  }
  async createorder(confirm){
    if(!this.user){
       this.utlityService.showalert('authconfirm');
       return;
    }
    if(this.isloading){
      this.utlityService.show("1/ডেটা লোডিং।");
      return;
    }
    if (!this.basket.address) {
      this.utlityService.show('3/ঠিকানা সেট করুন।');
      return;
    }
    for(let i = 0;i<this.basket?.products?.length;i++){
     if(this.basket?.products[i]?.quantity <= 0){
       this.utlityService.show("3/পণ্যের পরিমাণ সেট করুন।");
       return;
    }};
    if(confirm){
      this.utlityService.hidealert();
      var checkedOk = await this.basketcheckset(this.basket);
      if(checkedOk){
        this.isloading = true;
        this.orderService.createorder(this.basket).subscribe(res =>{
        if(res.success == true){
          this.basketService.deleteBasket();
          this.router.navigate(['orders']);
          this.utlityService.show("1/Order created successfully.");
        }else{
          this.basketcheckset(this.basket);
        }
        this.isloading = false;
        this.utlityService.hidealert();
      });
      }else{
       this.utlityService.show("1/Check basket again.");
      }
    }else{
      this.utlityService.showalert('authconfirm');
    }
  }
  async incrementItemQuantity(product){
    this.isloading = true;
    await this.basketService.incrementItemQuantity(product);
    this.isloading = false;
  }
  async decrementItemQuantity(product){
    this.isloading = true;
    await this.basketService.decrementItemQuantity(product);
    this.isloading = false;
  }
  upazilas: any[] = [];
  onDistrictChange(event: Event) {
   const disName = (event.target as HTMLSelectElement).value;
   const district = this.bdaddress.find(r => r.district == disName);
   this.upazilas = district.upazilas ? district.upazilas : [];
   console.log("upazila...",district, district.upazila);
   this.cartForm.get('upazila')?.setValue('');
  }
  bdaddress = [];
  getbdaddress(){
    this.accountService.getbdaddress().subscribe(res=>{
        this.bdaddress = res;
        console.log("bd address...", res);
    });
  }
}

