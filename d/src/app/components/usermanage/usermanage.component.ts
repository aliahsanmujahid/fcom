import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import {Clipboard} from '@angular/cdk/clipboard';
import { utlityService } from 'src/app/_services/utlity.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-usermanage',
  templateUrl: './usermanage.component.html',
  styleUrls: ['./usermanage.component.css']
})
export class UsermanageComponent implements OnInit {
  userform: UntypedFormGroup;
  searchform: UntypedFormGroup;
  constructor(public accountService: AccountService,private clipboard: Clipboard,
    private formBuilder: UntypedFormBuilder,public utlityService: utlityService, private route: ActivatedRoute
  ) { }
  async ngOnInit(): Promise<void> {
    this.userform = this.formBuilder.group({
              id: [''],
              name: ['', Validators.required],
              phone: ['', Validators.required],
              role: ['', Validators.required],
      });
    this.searchform = this.formBuilder.group({
      phone: ['', Validators.required]
    });
    this.accountService.setCheckedUser();
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
        
      }
    })
    this.getuserscountbyrole();
  }
  info = {admin:0};
  getuserscountbyrole(){
    this.accountService.getuserscountbyrole().subscribe(res =>{
      this.info = res;
    });
  }
  submitted = false;
  get f() {
    return this.userform.controls;
  }
  get ff() {
    return this.searchform.controls;
  }
  isloading:boolean = false;
  async createadminuser(){
    this.submitted = true;
    this.isloading = true;
    if (this.userform.invalid){
      this.userform.markAllAsTouched();
      this.utlityService.show('3/Please fill all the fields.');
      this.isloading = false;
      return;
    }
    if(!this.accountService.bdphonevalidation(this.f.phone.value)){
      return;
    }
    var form = {name:this.f.name.value,phone: this.f.phone.value,role:this.f.role.value};
    (await this.accountService.createadminuser(form)).subscribe(res =>{
      if(res.success){
        this.ff.phone.setValue(form?.phone);
        this.searchuser();
        this.reset();
      }
      this.utlityService.show(res.message);
    });
  }
  searchedUser = null;
  submitted2 = false;
  searchuser(){
    this.submitted2 = true;
    if (this.searchform.invalid){
      this.searchform.markAllAsTouched();
      this.utlityService.show('1/Please fill all the fields.');
      return;
    }
    if(!this.accountService.bdphonevalidation(this.ff.phone.value)){
      return;
    }
    this.accountService.searchuser({phone:this.ff.phone.value}).subscribe(res =>{
        this.searchedUser = res[0];
        if(res?.length == 0){
          this.utlityService.show("2/No user found.");
        }
     });
  }
  copyTxt(txt) {
    this.clipboard.copy(txt);
    this.utlityService.show('1/Text Copied.');
  }
 reset(){
    this.userform.reset();
    this.userform.patchValue({ role: '' });
    this.searchform.reset(); 
    this.submitted = false;
     this.submitted2 = false;
    this.isloading = false;
    this.searchedUser = null;
   }
   editUser(){
    if(this.searchedUser){
      this.f.id.setValue(this.searchedUser?.id);
      this.f.name.setValue(this.searchedUser?.name);
      this.f.phone.setValue(this.searchedUser?.phone);
      this.f.role.setValue(this.searchedUser?.role);
    }
   }
}
