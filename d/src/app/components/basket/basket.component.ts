import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import {Clipboard} from '@angular/cdk/clipboard';
import { utlityService } from 'src/app/_services/utlity.service';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/_models/user';
import { Order } from 'src/app/_models/order';
import { HttpClient } from '@angular/common/http';
import { ProductService } from 'src/app/_services/product.service';
import { Questions } from 'src/app/_models/product';
@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {
  answerform: UntypedFormGroup;
  user: User;
  nomoreorder = false;
  throttle = 0;
  distance = 1;
  page:number = 0;
  neworder = false;
  orders:any = [];
  orderst:string = '';
  selectedorder: Order = null;
  status = 'pending';
  status2 = 'pending';
  setstatus = [
    {id:1,name: 'pending', },
    {id:2,name: 'approved',},
    {id:4,name: 'rejected',},
  ]
  constructor(private route: ActivatedRoute,
    public accountService: AccountService,private http: HttpClient,
    private productService: ProductService, private router: Router,
    private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService,private clipboard: Clipboard) { }

  reviewForm: UntypedFormGroup;
  searchform: UntypedFormGroup;
  ngOnInit(): void {
    this.searchform = this.formBuilder.group({
      search: ['', Validators.required]
    });
    this.accountService.setCheckedUser();  
    this.accountService.currentUser$.subscribe(res =>{
        if(res){
          this.user = res;
        }
    });
    this.getorders();
  }
  submitted = false;
  get f() {
    return this.searchform.controls;
  }
  reset(){
    this.searchform.reset();
    this.utlityService.hidealert();
    this.submitted = false;
    this.page = 1;
    this.getorders();
  }
  getorders(){
      this.page = 1;
      this.orders = [];
      this.productService.getmanagebasket(this.page,this.orderst,this.f.search.value).subscribe(res =>{
      this.orders  = res;
      if(res.length === 0 || res.length < 10 ){
        this.nomoreorder = true;
      }else{
        this.nomoreorder = false;
      }
      });
  }
  getPagedOrder(){
   this.productService.getmanagebasket(++this.page,this.orderst,this.f.search.value).subscribe(res =>{
      this.orders?.push(...res);
      if(res.length === 0 || res.length < 10 ){
         this.nomoreorder = true;
      }else{
         this.nomoreorder = false;
      }
   });
  }
  copyTxt(txt) {
    this.clipboard.copy(txt);
    this.utlityService.show('1/Text Copied');
  }
  deleteItem:any = null;
  deletedata:any = null;
  alert = false;
  deletecate(data,item){
   this.deleteItem = item;
   this.deletedata = data;
   this.alert = !this.alert;
  }
  deteteConfirm(){
    if(this.deletedata){
      this.productService.deletecart(this.deletedata?.id).subscribe( res =>{
        if(res == true){
           this.getorders();
        }
      });
    }
    this.alert = false;
   }
}


