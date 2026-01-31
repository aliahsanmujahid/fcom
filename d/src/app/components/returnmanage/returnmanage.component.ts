import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { environment } from 'src/environments/environment';
import {Clipboard} from '@angular/cdk/clipboard';
import { User } from 'src/app/_models/user';
import { Order } from 'src/app/_models/order';
import { HttpClient } from '@angular/common/http';
import { OrderService } from 'src/app/_services/order.service';
@Component({
  selector: 'app-returnmanage',
  templateUrl: './returnmanage.component.html',
  styleUrls: ['./returnmanage.component.css']
})
export class ReturnmanageComponent implements OnInit {
  answerform: UntypedFormGroup;
  searchform: UntypedFormGroup;
  user: User;
  nomoreorder = false;
  throttle = 0;
  distance = 1;
  page:number = 0;
  neworder = false;
  orders: Order[] = [];
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
    private orderService: OrderService, private router: Router,
    private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService,private clipboard: Clipboard) { }

  reviewForm: UntypedFormGroup;
  ngOnInit(): void {
    this.searchform = this.formBuilder.group({
      search: ['', Validators.required]
    });
    this.answerform = this.formBuilder.group({
      id: [''],
      answer: ['', Validators.required],
    });
    this.accountService.setCheckedUser();  
    this.accountService.currentUser$.subscribe(res =>{
        if(res){
          this.user = res;
        }
    });
    if(this.route.params){
      window.scrollTo(0, 0);
      this.route.params.subscribe(params => {
        if (Object.keys(params).length !== 0) {
          this.orderst = this.status = params['type'];
          this.selectedorder = null;
          this.getorders();
        };
      });
    }
  }
  getorders(){
      this.page = 1;
      this.orders = [];
      this.orderService.getorderforreturnmanage(this.page,this.orderst,this.f.search.value).subscribe(res =>{
      this.orders  = res;
      if(res.length === 0 || res.length < 10 ){
        this.nomoreorder = true;
      }else{
        this.nomoreorder = false;
      }
      });
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
  getPagedOrder(){
   this.orderService.getorderforreturnmanage(++this.page,this.orderst,this.f.search.value).subscribe(res =>{
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
  alert1:boolean=false;
  manageorderitemsreturn(order,todo,confirm = false){
    if(todo == 3 && !confirm){
      return;
    }
    this.orderService.manageorderitemsreturn(order?.id,todo).subscribe( res => {
      let order = this.orders.find(x => x.id == order?.id);
      if (order && order.orderitems) {
        order.orderitems.forEach(item => item.returned = todo);
      }
    });
  }
}


