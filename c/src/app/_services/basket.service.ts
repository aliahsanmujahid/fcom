import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { utlityService } from './utlity.service';
import { StorageService } from './storage.service';
import { Basket, Cart } from './settings.service';
import { AccountService } from './account.service';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class BasketService {
  baseUrl = environment.apiUrl;
  private basketSource = new BehaviorSubject<Basket>(null);
  basket$ = this.basketSource.asObservable();
  constructor(public utlityService: utlityService,
    public storageService: StorageService,public accountService: AccountService,
    private http: HttpClient) { }
  basketcheckset(basket) {
    return this.http.post<any>(this.baseUrl + 'basketcheckset', {basket});
  }
  async getbasket() {
    let visitorid = await this.accountService.generatevisitorid();
    this.http.post<any>(this.baseUrl + 'getbasket', {visitorid}).subscribe( res => {
      if(res){
        this.setBasketSource(res?.basket);
      }
    });
  }
  getCurrentBasketValue() {
    return this.basketSource.value;
  }
  async setBasket(basket) {
    basket.visitorid = await this.accountService.generatevisitorid();
    this.basketcheckset(basket).subscribe( async res => {
        if(!res?.success){
          if(res?.message){
            this.utlityService.show(res?.message);
          }
        }
        this.setBasketSource(res?.basket);
    });
  }
  setBasketSource(basket){
    this.basketSource.next(basket);
    this.storageService.setItem('basket',basket);
  }
  addItemToBasket(item:Cart, quantity = 1) {
    var basket: Basket = this.getCurrentBasketValue() ?? new Basket();
    var newBasket = this.addOrUpdateItem(basket, item, quantity);
    if(newBasket){
      this.utlityService.show('1/পণ্য ব্যাগে যোগ করা হয়েছে।');
      this.setBasket(newBasket);
    }
  }
  private addOrUpdateItem(basket:Basket,itemToAdd:Cart, quantity: number){
    var product = basket.products.find(x=>x.id == itemToAdd.id);
    if(product){
      var same = 0;
      basket.products.forEach( p => {
        if((p.vari?.values?.length == 0 && itemToAdd.vari?.values?.length == 0)){
          if((p.id == itemToAdd.id)){
            same = 1;
           }
        }
        if((p.vari?.values?.length > 0 && itemToAdd.vari?.values?.length > 0)){
          if((p.vari?.values[0]?.id == itemToAdd.vari?.values[0]?.id)){
            same = 1;
           }
        }
      });
      if(same == 0){
        basket.products.push(itemToAdd);
      }else{
        this.utlityService.show('1/পণ্যটি ব্যাগে যোগ করা আছে।');
        return null;
      }
    }else{
      let item = new Cart();
      itemToAdd.eachid = this.accountService.generateUniqueId(),
      basket.products.push(itemToAdd);
    }
    return basket;
  }
  setCoupon(coupon){
    const basket:Basket = this.getCurrentBasketValue();
    basket.coupon = coupon;
    this.setBasket(basket);
  }
  removeItemFromBasket(eachid) {
    var basket:Basket = this.getCurrentBasketValue();
    var product = basket.products = basket.products.filter(i => i.eachid != eachid);
    if(product){
      basket.products = basket.products.filter(i => i.eachid != eachid);
      if(basket.products.length == 0){
        this.deleteBasket();
      }else{
        this.setBasket(basket);
      }
      this.utlityService.show('1/পণ্যটি সরানো হয়েছে।');
    }
  }
  incrementItemQuantity(product: Cart) {
    const basket = this.getCurrentBasketValue();
    const item = basket.products.find(p => p.id === product.id && p.eachid === product.eachid);
    if (item) {
      item.quantity += 1;
    }
    this.setBasket(basket);
  }
  decrementItemQuantity(product: Cart) {
    const basket = this.getCurrentBasketValue();
    const item = basket.products.find(p => p.id === product.id && p.eachid === product.eachid);
    if (item && item.quantity > 1) {
      item.quantity -= 1;
      this.setBasket(basket);
    }
  }
  setAddress(address){
    const basket = this.getCurrentBasketValue();
    basket.address.address = address?.address;
    basket.address.name = address?.name;
    basket.address.phone = address?.phone;
    basket.address.region = address?.region;
    basket.address.city = address?.city;
    basket.address.zone = address?.zone;
    this.setBasket(basket);
  }
  deleteBasket() {
    this.setBasket({});
    this.basketSource.next(null);
  }
}