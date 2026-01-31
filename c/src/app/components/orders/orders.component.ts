import { environment } from 'src/environments/environment';
import { ReviewService } from '../../_services/review.service';
import { AccountService } from 'src/app/_services/account.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { OrderService } from 'src/app/_services/order.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { filter, skip } from 'rxjs';
import { Review, SettingsService, Shop } from 'src/app/_services/settings.service';
import { StorageService } from 'src/app/_services/storage.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  reviewForm: UntypedFormGroup;
  returnForm: UntypedFormGroup;
  paymentForm: UntypedFormGroup;
  noorder = false;
  page:number = 0;
  nomoreorder:boolean = false;
  isloading:boolean = false;
  tooltipVisible = false;
  orders = null;
  selectedorder = null;
  alert = false;
  ischaged:boolean = false;
  rateingalert = false;
  user = null;
  reviewitem: any = null;
  review = new Review();
  constructor( private route: ActivatedRoute,private formBuilder: UntypedFormBuilder,
    public accountService: AccountService,private orderService: OrderService, private router: Router,
    public storageService: StorageService,
    public utlityService: utlityService,
    private settingsService: SettingsService,
    private reviewService: ReviewService ) {
      this.utlityService.hidealert();
      this.utlityService.hidereviewalert();
      this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
          ).subscribe(() => {
            this.utlityService.scrollTop();
          });
    }
  ngOnInit() {
    this.reviewForm = this.formBuilder.group({
     review: ['', [Validators.required, Validators.minLength(30)]]
    });
    this.returnForm = this.formBuilder.group({
     txt: ['', [Validators.required, Validators.minLength(30)]]
    });
    this.paymentForm = this.formBuilder.group({
     txn: ['', [Validators.required]]
    });
    this.utlityService.setmenuname(this.router.url);
    this.utlityService.setParams(new Shop(),false);
    this.accountService.setCheckedUser();
    this.accountService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.getorders();
        this.getsitemanage();
      }
    });
  }
  ngOnDestroy(): void {
    this.utlityService.setmenuname(null);
  }
  get f() {
    return this.reviewForm.controls;
  }
  get ff() {
    return this.paymentForm.controls;
  }
  get fff() {
    return this.returnForm.controls;
  }
  oskip = environment.oskip;
  getorders(){
    this.orders = [];
    this.page = 0;
    this.noorder = false;
    this.orderService.getcustomerorders(this.page).subscribe(res => {
        this.orders  = res;
        console.log("orders.........", res);
        if(res?.length == 0 || res == null){
          this.noorder = true;
        }
        if(res?.length < this.oskip){
           this.nomoreorder = true;
        }
       });
  }
  getcustomerorders(){
    if(this.nomoreorder || !this.user){
      return;
    }
      this.isloading = true;
      this.orderService.getcustomerorders(++this.page).subscribe(async res =>{
        this.orders.push(...res);
        if(res.length == 0 || res == null || res?.length < this.oskip){
          this.nomoreorder = true;
         }else{
           this.nomoreorder = false;
         }
         this.isloading = null;
         
       });
  }
  setrating(count){
    this.review.rating = count;
    this.ischaged = true;
  }
  ratealerttoggle(){
    if(this.ischaged){
      if(!confirm('Are you sure you want to continue? Any unsaved changes will be lost.')){
        return;
      }
      this.utlityService.hidereviewalert();
      this.ischaged = false;
    }
    this.utlityService.hidereviewalert();
  }
  addreview(order,item){
    this.review = new Review();
    this.review.pid = item.pid;
    this.review.puid = item.puid;
    this.review.oitemid = item.id;
    this.reviewitem = item;
    this.utlityService.showalert('rating',false,true);
  }
  reset(){
    this.reviewForm.reset(); 
    this.returnForm.reset(); 
    this.submitted = false;
    this.isloading = false;
  }
  editloading:boolean = false;
  submitted = false;
  addeditreview(order,item){
    this.reset();
    if(item.isr != 1){
      this.review = new Review();
      this.review.pid = item.pid;
      this.review.puid = item.puid;
      this.review.oitemid = item.id;
      this.reviewitem = item;
      this.utlityService.showalert('rating',false,true);
      return;
    }
    this.editloading = item?.id;
    this.reviewitem = item;
    
    this.reviewService.getreview(item.id).subscribe(res => {
      if(res.length > 0 ){
        this.utlityService.showalert('rating',false,true);
        this.review = res[0];
        this.f.review.setValue(res[0]?.review);
      }
      this.editloading = false;
      
    });
  }
  createupdateloading:boolean = false;
  createreview(){
    this.submitted = true;
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      this.utlityService.show('3/ঘরগুলো ঠিকভাবে পূরণ করুন।');
      return;
    }
    if(!this.checkValidation()){
      return;
    }
    this.createupdateloading = true;
    
    this.review.review = this.f.review.value;
    this.reviewService.createreview(this.review).subscribe( res=>{
      if(res.succ == true){
        this.reviewitem.isr = 1;
      }
      this.review = new Review();
      this.ischaged = null;
      this.utlityService.hidereviewalert();
      this.createupdateloading = false;
      
    });
  }
  selectedorderitem = null;
  checkValidation(){
    if(!(this.review.rating > 0 && this.review.rating <= 5)){
      this.utlityService.show('3/স্টার সিলেক্ট করুন।');
      return false;
    }
    return true;
  }
  sitemanage = null;
  getsitemanage(){
    this.settingsService.getsitemanage().subscribe( res => {
      if(res){
        this.sitemanage = res;
        console.log("getsitemanage......", res);
      }
    });
  }
  updatereview(){
    this.submitted = true;
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      this.utlityService.show('3/ঘরগুলো ঠিকভাবে পূরণ করুন।');
      return;
    }
     if(!this.checkValidation()){
      return;
    }
    this.createupdateloading = true;
    this.review.review = this.f.review.value;
    
    this.reviewService.updatereview(this.review).subscribe( res=>{
      if(res.succ == true){
        this.reviewitem.isr = 1;
      }
      this.review = new Review();
      this.ischaged = null;
      this.utlityService.hidereviewalert();
      this.createupdateloading = false;
      
    });
  }

  getClass(order){
    if(order?.status == 'pending'){
      return '-blue-500';
    }
    if(order?.status == 'approved'){
      return '-emerald-500';
    } 
     if(order?.status == 'delivering'){
      return '-green-500';
    }
    if(order?.status == 'confirmed'){
      return '-green-500';
    } 
     if(order?.status == 'rejected' || order?.status == 'cancled'){
      return '-red-500';
    }
    if(order?.status == 'inreview'){
      return '-emerald-500';
    } 
    return '-blue-500';
  }
  showFull = null;
  toggleAddress(id) {
    this.showFull = id;
    if(this.storageService.isBrowser) {
      setTimeout(() => {
      this.showFull = null;
      }, 5000);
    }
  }
  timecheck(time,day = false){
    if(day){
      return ((new Date().getTime() - new Date(time).getTime()) < (1000 * 60 * 60 * 24 * 7)) ? true : false;
    }else{
      return ((new Date().getTime() - new Date(time).getTime()) < (1000 * 60 * 30)) ? true : false;
    }
  }
  cancleloading = false;
  async ordercancel(order = null,confirm){
  if(order){this.selectedorder = order};
  this.utlityService.showalert('cancle');
  if(!confirm){return};
  if(this.selectedorder){
    this.cancleloading = true;
    this.orderService.ordercancel({id:this.selectedorder.id,status:'cancled'}).subscribe(async res =>{
     if(res?.success){
      this.orders.find(x => x.id == this.selectedorder?.id).status = 'cancled';
      this.utlityService.show("1/Order cancled.");
     }else{
      if(res?.meassage){
        this.utlityService.show(res.meassage);
      }else{
        this.utlityService.show("2/Something went wrong.");
      }
     }
     this.utlityService.hidealert();
     this.cancleloading = false;
     
    });
  }};
  settxn(){
    this.orderService.settxn({id:this.selectedorder?.id,txn:this.ff.txn.value}).subscribe(async res =>{
     if(res?.success){
      this.utlityService.show("2/Payment InFO Updated");
      this.utlityService.hidealert();
      this.selectedorder.txn = this.ff.txn.value;
     }
    });
  }
  async setPayment(order){
    this.selectedorder = order;
    console.log("this.selectedorder", this.selectedorder);
    if([1,2].includes(this.sitemanage.paymenttype)){
      this.utlityService.showalert('payment');
      if(this.sitemanage.paymenttype == 2){
        this.ff.txn.setValue(this.selectedorder.txn);
      }
    }else if(this.sitemanage.paymenttype == 3){
      this.setSslCommerz(order);
    }
  };
  async setSslCommerz(order){
    this.orderService.paymentcreate(order?.id).subscribe(async res =>{
     if(res?.GatewayPageURL){
      this.accountService.openInNewTab(res.GatewayPageURL);
     }else{
      this.utlityService.show("2/"+ (res?.msg || 'Somethings went wrong?'));
     }
    });
  };
  async orderreturn(order = null,item = null,confirm){
    if(item){
      this.selectedorder = order;
      this.selectedorderitem = item;
      this.fff.txt.setValue(item?.returntxt);
    };
    this.utlityService.showalert('return');
    if(!confirm){return};
     if(this.selectedorderitem){
      this.cancleloading = true; 
      let model = {id:this.selectedorderitem?.id,returntxt:this.fff.txt.value};
      this.orderService.orderreturn(model).subscribe(async res =>{
      if(res?.success){
       let order = this.orders.find(x => x.id == this.selectedorder?.id);
       let orderitem = order.orderitems.find(x => x.id == this.selectedorderitem?.id);
       orderitem.returned = 1;
       orderitem.returntxt = model.returntxt;
       this.utlityService.show("1/ফেরত দেওয়া হয়েছে।");
      }else{
       if(res?.meassage){
        this.utlityService.show(res.meassage);
       }
     }
     this.utlityService.hidealert();
     this.cancleloading = false;
     
    });
  }};

  manageorderitemsreturn(order,todo){
    this.utlityService.hidealert();
    this.orderService.manageorderitemsreturn(order?.id,todo).subscribe( res => {
      if (order && order.orderitems) {
        order.orderitems.forEach(item => item.returned = todo);
      }
    });
  }
}

