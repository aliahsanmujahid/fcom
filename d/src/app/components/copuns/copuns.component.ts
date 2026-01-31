import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from 'src/app/_services/settings.service';
import {Clipboard} from '@angular/cdk/clipboard';
import { AccountService } from 'src/app/_services/account.service';
import { User } from 'src/app/_models/user';
import { utlityService } from 'src/app/_services/utlity.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-copuns',
  templateUrl: './copuns.component.html',
  styleUrls: ['./copuns.component.css']
})
export class CopunsComponent implements OnInit {
  couponform: UntypedFormGroup;
  searchForm: UntypedFormGroup;
  constructor(public settingsService: SettingsService,
    private formBuilder: UntypedFormBuilder,
    public accountService: AccountService,private clipboard: Clipboard,
    private route: ActivatedRoute,public utlityService: utlityService) { }
  copuns:any = [];
  alert = false;
  user:User;
  async ngOnInit(): Promise<void> {
    this.searchForm = this.formBuilder.group({
        phone: [''],
        stype: ['all', Validators.required]
      });
    this.couponform = this.formBuilder.group({
          id: [''],
          phone: [''],
          time: [''],
          ulimit: [''],
          code: ['', Validators.required],
          value: ['', Validators.required],
          minp: [''],
          minc: [''],
    });
    this.accountService.setCheckedUser();
    this.getallcoupons();
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
        this.user = user;
      }
    })
  }
  submitted = false;
  get f() {
    return this.couponform.controls;
  }
  isloading:boolean = false;
  copyTxt(txt) {
    this.clipboard.copy(txt);
    this.utlityService.show('1/Text Copied.');
  }
  alerttoggle(){
    this.alert = !this.alert;
  }
  submitted2 = false;
  get ff() {
    return this.searchForm.controls;
  }
  search(){
    this.submitted2 = true;
    if (this.searchForm.invalid) {
      this.page = 1;
      this.copuns = [];
      this.searchForm.markAllAsTouched();
      this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
      return;
    }
    this.getallcoupons();
  }
  creatcopun(){
    this.alert = !this.alert;
    this.submitted = true;
    this.isloading = true;
    if (this.couponform.invalid){
      this.couponform.markAllAsTouched();
      this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
      this.isloading = false;
      return;
    }
    if (this.f.phone.value && !this.accountService.bdphonevalidation(this.f.phone.value)) {
     return;
    }
    var form = {
      id:this.f.id.value,
      phone: this.f.phone.value,
      code: this.f.code.value.toString().toLowerCase(),
      value: this.f.value.value,
      time: this.f.time.value,
      ulimit: this.f.ulimit.value,
      minp: this.f.minp.value,
      minc: this.f.minc.value
    };
    if(this.f.id.value > 0){
     this.settingsService.updatecoupon(form).subscribe(res => {
      this.reset();
    });
    }else{
      this.settingsService.createcoupon(form).subscribe(res => {
        this.reset();
     });
    }
  }
  deleteItem:any=null;
  alert1:boolean=false;
  deletecopun(item = null,confirm){
    if(item){
      this.deleteItem=item;
      this.alert1=true;
    }
    if(confirm &&  this.deleteItem){
      this.settingsService.deletecopun(this.deleteItem).subscribe(res => {
        this.reset();
        this.copuns =  this.copuns.filter(x => x.id != res?.id);
        this.utlityService.show(res?.message);
        this.alert1=false;
      });
    }
  }
  updatetoggle(res){
    this.f.id.setValue(res.coupon_id);
    this.f.phone.setValue(res.coupon_phone);
    this.f.code.setValue(res.code);
    this.f.value.setValue(res.value);
    this.f.minp.setValue(res.minp);
    this.f.ulimit.setValue(res.ulimit);
    this.f.minc.setValue(res.minc);
    if (res.time) {
     const formattedDate = formatDate(res.time, 'yyyy-MM-dd', 'en-US');
     this.f.time.setValue(formattedDate);
    }
    this.alert = !this.alert;
  }
  page = 1;
  getallcoupons(){
    this.settingsService.getallcoupons({page:this.page++,phone:this.ff.phone.value,type:this.ff.stype.value}).subscribe(res => {
      this.copuns.push(...res);
      if(res?.length == 0 || res?.length < 10){
        this.nomore = true;
      }
    });
  }
  nomore = false;
  loadmore(){
    this.copuns = [];
    this.nomore = false;
    this.page = 1;
    this.getallcoupons();
  }
  reset(){
    this.copuns = [];
    this.page = 1;
    this.couponform.reset(); 
    this.searchForm.reset({
      stype: this.searchForm.get('stype')?.value
    }); 
    this.submitted = false;
    this.submitted2 = false;
    this.isloading = false;
    this.getallcoupons();
  }
}
