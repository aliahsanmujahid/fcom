import { HttpClient } from '@angular/common/http';
import { ReviewService } from './../../_services/review.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/_models/user';
import { AccountService, Review } from 'src/app/_services/account.service';
import { environment } from 'src/environments/environment';
import { utlityService } from 'src/app/_services/utlity.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Order } from 'src/app/_models/order';
import { OrderService } from 'src/app/_services/order.service';
import {Clipboard} from '@angular/cdk/clipboard';
@Component({
  selector: 'app-reviewmanage',
  templateUrl: './reviewmanage.component.html',
  styleUrls: ['./reviewmanage.component.css']
})
export class ReviewmanageComponent implements OnInit {
  answerform: UntypedFormGroup;
  user: User;
  nomoreorder = false;
  throttle = 0;
  distance = 1;
  page:number = 0;
  neworder = false;
  orders: Review[] = [];
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
    private reviewService: ReviewService, private router: Router,
    private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService,private clipboard: Clipboard) { }

  searchform: UntypedFormGroup;
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
          this.orderst = this.status = params['status'];
          this.allids = [];
          this.selectedorder = null;
          this.getorders();
        };
      });
    }
  }
  statusChange($event,order = null,){
   this.status2 = $event.target.value;
   if(order){
    this.status = $event.target.value;
    this.selectedorder = order;
    this.utlityService.showalert('statuschange');
   }
  }
  changestatus(){
    if(this.selectedorder !== null){
      this.utlityService.hidealert();
      this.reviewService.rchangestatus(this.selectedorder.id,this.status).subscribe(res => {
        var newo =  this.orders.find(i => i.id == this.selectedorder.id,);
        newo.status = this.status;
        this.selectedorder.status = this.status;
        this.utlityService.show("1/Status Changed To <span class=' capitalize '> "+ this.status +' <span>');
        this.utlityService.livereport();
     });
    }
  }
  submitted2 = false;
  get ff() {
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
      this.reviewService.getreviewsformanage(this.page,this.orderst,this.ff.search.value).subscribe(res =>{
      this.orders  = res;
      if(res.length === 0 || res.length < 10 ){
        this.nomoreorder = true;
      }else{
        this.nomoreorder = false;
      }
      });
  }
  getPagedOrder(){
   this.reviewService.getreviewsformanage(++this.page,this.orderst,this.ff.search.value).subscribe(res =>{
      this.orders?.push(...res);
      if(res.length === 0 || res.length < 10 ){
         this.nomoreorder = true;
      }else{
         this.nomoreorder = false;
      }
   });
  }
  allids:any = [];
  onCheckAll($event) {
    if ($event.target.checked){
      this.orders.map(r => this.allids.push(r.id));
    }else{
      this.allids = [];
    }
  }
  onCheck($event) {
    if ($event.target.checked){
     this.allids.push($event.target.value);
    }else{
      this.allids = this.allids.filter(x=>x !== $event?.target?.value);
    }
  }
  chacked(id){
    return this.allids.some(x=> x == id);
  }
  async selectitem(id){
    if(this.allids.some(x=>x== id)){
     await (this.allids = this.allids.filter(x=> x !== id));
    }else{
      await this.allids.push(id);
    }
  }
  setallorderstatus(confirm){
    this.selectedorder = null;
    if(confirm){
      this.utlityService.hidealert();
      this.reviewService.setallreviewstatust({allids:this.allids,status:this.status2}).subscribe(res =>{
        if(res?.success){
          this.utlityService.show("1/Status Changed To <span class=' capitalize '> "+ this.status2 +' <span>');
          this.orders.map( x=> this.allids.map(y=> x.id == y ? x.status = this.status2 : ''));
        }
        this.utlityService.livereport();
      });
    }else{
      this.utlityService.showalert('statuschange');
    }
  }
  copyTxt(txt) {
    this.clipboard.copy(txt);
    this.utlityService.show('1/Text Copied');
  }
  submitted = false;
  get f() {
    return this.answerform.controls;
  }
  addeditanswer(item){
    this.f.id.setValue(item?.id);
    this.f.answer.setValue(item?.answer);
    this.utlityService.showalert('answer');
  }
  isloading:boolean = false;
  answerreview(){
    this.submitted = true;
    this.isloading = true;
    if (this.answerform.invalid){
      this.answerform.markAllAsTouched();
      this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
      this.isloading = false;
      return;
    };
     let data = {id:this.f.id.value,answer:this.f.answer.value};
     this.reviewService.answerreview(data).subscribe(res => {
       if(res?.success){
         this.orders.find( x => x.id == this.f.id.value).answer = this.f.answer.value;
       }
       this.utlityService.hidealert();
       this.isloading = false;
     });
  }


  
}


