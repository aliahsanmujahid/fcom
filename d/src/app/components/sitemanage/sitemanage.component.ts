import { SettingsService } from '../../_services/settings.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AccountService } from 'src/app/_services/account.service';
import { utlityService } from 'src/app/_services/utlity.service';
@Component({
  selector: 'app-sitemanage',
  templateUrl: './sitemanage.component.html',
  styleUrls: ['./sitemanage.component.css']
})
export class SitemanageComponent implements OnInit {
  form: UntypedFormGroup;
  delivery: UntypedFormGroup;
  constructor(public settingsService: SettingsService,
    private accountService: AccountService,private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,public utlityService: utlityService
  ) { }
  async ngOnInit(): Promise<void> {
    this.form = this.formBuilder.group({
      id: [0],
      smskey: [''],
      paymenttype: [''],
      paymentinfo: [''],
      steadfast: [''],
      masterkey: [''],
    });
    this.delivery = this.formBuilder.group({
          id: [0],
          inside_city_charge: ['', Validators.required],
          outside_city_charge: ['', Validators.required],
          extra_per_kg: ['', Validators.required],
    });
    this.accountService.setCheckedUser();
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
      }
    })
    this.route.params.subscribe(params => {
      window.scrollTo(0, 0);
    });
    this.getsitemanage();
    this.getdelivery();
  }
  submitted = false;
  get f() {
    return this.form.controls;
  }
  setPaymentType(val){
    this.f.paymenttype.setValue(val);
    if ([2, 3].includes(val)) {
    this.f.paymentinfo?.setValidators(Validators.required);
    } else {
     this.f.paymentinfo?.clearValidators();
    }
    this.f.paymentinfo?.updateValueAndValidity();
  }
  isloading:boolean = false;
  getsitemanage(){
    this.settingsService.getsitemanage().subscribe( res => {
      if(res){
        this.f.id.setValue(res.id);
        this.f.smskey.setValue(res.smskey);
        this.f.paymenttype.setValue(res.paymenttype);
        this.f.paymentinfo.setValue(res.paymentinfo);
        this.f.masterkey.setValue(res.masterkey);
        this.f.steadfast.setValue(res.steadfast);
      }
    });
  }
  sitemanagesettings(){
    this.submitted = true;
    this.isloading = true;
    if (this.form.invalid){
      this.form.markAllAsTouched();
      this.utlityService.show('3/Please fill all the fields.');
      this.isloading = false;
      return;
    }
    var form = {id:this.f.id.value,
      smskey: this.f.smskey.value,paymenttype:this.f.paymenttype.value,
      steadfast: this.f.steadfast.value,
      paymentinfo:this.f.paymentinfo.value,masterkey: this.f.masterkey.value};
     if(this.f.id.value > 0){
      this.settingsService.updatesitemanage(form).subscribe( res => {
        if(res){
          this.reset();
        }
      });
     }else{
      this.settingsService.createsitemanage(form).subscribe( res => {
        if(res){
          this.reset();
        }
      });
    }
  }
  deliverydata:any = {};
  alert2 = false;
  submitted2 = false;
  get ff() {
    return this.delivery.controls;
  }
   getdelivery(){
    this.settingsService.getdelivery().subscribe(res => {
      this.deliverydata = res;
      this.ff.id.setValue(this.deliverydata?.id);
      this.ff.inside_city_charge.setValue(this.deliverydata?.inside_city_charge);
      this.ff.outside_city_charge.setValue(this.deliverydata?.outside_city_charge);
      this.ff.extra_per_kg.setValue(this.deliverydata?.extra_per_kg);
    });
  }
  alerttoggle2(){
    this.alert2 = true;
    this.getdelivery();
  }  
    createupdatedelivery(){
    this.submitted2 = true;
    this.isloading = true;
    if(this.delivery.invalid){
      this.delivery.markAllAsTouched();
      this.utlityService.show('3/Please fill all the fields.');
      this.isloading = false;
      return;
    }
    var form = {
      id:this.ff.id.value,
      inside_city_charge: this.ff.inside_city_charge.value,
      outside_city_charge: this.ff.outside_city_charge.value,
      extra_per_kg: this.ff.extra_per_kg.value
    };
    this.settingsService.createupdatedelivery(form).subscribe(res => {
      if(res?.success){
        this.getdelivery();
      }
      this.alert2 = !this.alert2;
    });
  }
  reset(){
    this.form.reset(); 
    this.submitted = false;
    this.isloading = false;
    this.getsitemanage();
   }
}
