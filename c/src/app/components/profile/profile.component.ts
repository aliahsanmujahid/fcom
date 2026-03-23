import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/_services/storage.service';
import { filter, skip, take } from 'rxjs/operators';
import { SettingsService, Shop } from 'src/app/_services/settings.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  adminsite = environment.adminsite;
  user = null;
  constructor(public accountService: AccountService,public router: Router,
    public utlityService: utlityService,public storageService: StorageService,
    public settingsService: SettingsService,
    public route: ActivatedRoute,private formBuilder: UntypedFormBuilder,
  ) { 
    this.utlityService.hidealert();
    this.utlityService.hidereviewalert();
     this.router.events.pipe(
                filter(event => event instanceof NavigationEnd)
              ).subscribe(() => {
                this.utlityService.scrollTop();
              });
    }
  userForm: UntypedFormGroup;
  ngOnInit(): void {
      this.userForm = this.formBuilder.group({
          id: [''],
          name: [''],
          phone: [''],
          gender: [''],
          customertype: [''],
          bodytype: [''],
          dob: [''],
          district: [''],
          upazila: [''],
          address: ['']
      });
      this.utlityService.setmenuname(this.router.url);
      this.utlityService.setParams(new Shop(),false);
      this.accountService.setCheckedUser(true);
      this.accountService.currentUser$.subscribe( user => {
        if(user){
          this.user = user;
          if(user?.role == 'admin' || user?.role == 'moderator'){
            this.adminsite = this.adminsite + 'auth;jwt='+this.storageService.getItem('user');
          }
        }
      });
    this.getbdaddress();
  }
  ngOnDestroy(): void {
    this.utlityService.setmenuname(null);
  }
  ngAfterViewInit(): void {
  }
  bdaddress = [];
  getbdaddress(){
    this.accountService.getbdaddress().subscribe(res=>{
        this.bdaddress = res;
        console.log("bd address...", res);
    });
  }
  submitted = false;
  get f() {
    return this.userForm.controls;
  }
  isloading:boolean = false;
  edituser(){
    this.submitted = true;
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.utlityService.show("3/অনুগ্রহ করে সব পূর্ণ করুন।");
      return;
    }
    this.isloading = true;
    let data = {
      id: this.f.id.value,
      uid:this.user.id,
      name:this.f.name.value,
      phone:this.f.phone.value,
      gender: this.f.gender.value,
      bodytype: this.f.bodytype.value,
      district:this.f.district.value,
      upazila:this.f.district.value,
      address:this.f.address.value,
      dob: this.f.dob.value,
    }; 
    this.updateusrinfo(data); 
  }
  updateusrinfo(data){
    this.accountService.updateuser(data).subscribe(res=>{
      this.isloading = false
      if(res.success){
        this.accountService.setCheckedUser(true);
        this.utlityService.show("1/তথ্য সফলভাবে আপডেট হয়েছে।");
      }
      this.utlityService.scrollTop();
    });
  }
  async editProfile(){
    this.f.name.setValue(this.user.name);
    this.f.gender.setValue(this.user.gender);
    this.f.bodytype.setValue(this.user.bodytype);
    this.f.dob.setValue(this.user.dob);
    this.utlityService.showalert('userform');
  }
  logAlert = false
  logout(c = false){
    if(!c){
      this.logAlert = true;
      return;
    }
    this.accountService.logout();
    this.logAlert = false;
  }
  sorts = [
    { id:1,name: 'Male', },
    { id:2, name: 'Female', }
  ]
  openUrl(){
    if((!this.user?.gender && !this.user?.dob && !this.user?.bodytype) || this.user?.address?.length == 0){
      if((!this.user?.gender && !this.user?.dob && !this.user?.bodytype )){
        this.utlityService.show("2/Update user info");
        this.editProfile();
      }
      return;
    }
    this.accountService.openInNewTab(this.adminsite)
  }
upazilas: any[] = [];
onDistrictChange(event: Event) {
  const disName = (event.target as HTMLSelectElement).value;
  const district = this.bdaddress.find(r => r.district == disName);
  this.upazilas = district.upazilas ? district.upazilas : [];
  console.log("upazila...",district, district.upazila);
  this.userForm.get('upazila')?.setValue('');
}
}
