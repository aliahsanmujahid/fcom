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
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {
  answerform: UntypedFormGroup;
  user: User;
  nomoreorder = false;
  throttle = 0;
  distance = 1;
  page:number = 0;
  neworder = false;
  orders: Questions[] = [];
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
          this.selectedorder = null;
          this.getorders();
        };
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
      this.productService.getmanagequestions(this.page,this.orderst,this.ff.search.value).subscribe(res =>{
      this.orders  = res;
      if(res.length === 0 || res.length < 10 ){
        this.nomoreorder = true;
      }else{
        this.nomoreorder = false;
      }
      });
  }
  getPagedOrder(){
   this.productService.getmanagequestions(++this.page,this.orderst,this.ff.search.value).subscribe(res =>{
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
     this.productService.createeditanswerquestion(data).subscribe(res => {
       if(res?.success){
         this.orders.find( x => x.id == this.f.id.value).answer = this.f.answer.value;
       }
       this.utlityService.hidealert();
       this.isloading = false;
     });
  }
}


