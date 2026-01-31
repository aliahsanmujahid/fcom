import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AccountService } from 'src/app/_services/account.service';
import { Shop } from 'src/app/_services/settings.service';
import { StorageService } from 'src/app/_services/storage.service';
import { utlityService } from 'src/app/_services/utlity.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  authForm!: UntypedFormGroup;
  otpsended = false;
  message: string | null = null;
  nameExists = true;
  submitted = false;
  isloading = false;
  sendagain = false;
  time: null;

  constructor(
    public accountService: AccountService,
    private router: Router,
    public storageService: StorageService,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService
  ) {
    this.utlityService.hidealert();
    this.utlityService.hidereviewalert();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.utlityService.scrollTop();
      });

  }
  user = null;
  ngOnInit(): void {
    this.authForm = this.formBuilder.group({
      phone: ['', Validators.required],
      name: [''],
      otp: ['']
    });
    this.utlityService.setParams(new Shop(), false);
    this.accountService.currentUser$.subscribe(user => {
      this.user = user;
    });  
  }
  ngAfterViewInit(): void {
  }
  get f() {
    return this.authForm.controls;
  }

  private updateAllValidators() {
    Object.values(this.f).forEach(control => control.updateValueAndValidity());
  }

  authSetup() {
    
    if (!this.otpsended) {
      this.otpsend();
    } else {
      this.signin();
    }
  }

  otpsend() {
    const phone = this.f.phone.value?.trim().replace(/\./g, '');
    if (!this.accountService.bdphonevalidation(phone)) return;
    this.submitted = true;
    this.isloading = true;
    const model = { phone, stop: this.f.phone.value?.endsWith('.') };
    this.accountService.sendotp(model).subscribe(async res => {
      this.isloading = false;
      if (res?.otpsended || res?.sendagain) {
        this.otpsended = true;
        this.authForm.get('phone')?.disable();
      }
      this.message = res?.message;
      this.nameExists = res?.nameExists ?? true;
      if (!this.nameExists) {
        this.f.name.setValidators(Validators.required);
      }
      this.f.otp.setValidators(Validators.required);
      await this.updateAllValidators();
      this.time = res?.time;
      this.sendagain = res?.sendagain;
      this.utlityService.show(res?.message);
    });
  }

    otpsendagain() {
     const phone = this.f.phone.value?.trim().replace(/\./g, '');
    if (!this.accountService.bdphonevalidation(phone)) return;

    this.submitted = true;
    this.isloading = true;

    const model = { phone, stop: this.f.phone.value?.endsWith('.') };

    this.accountService.otpsendagain(model).subscribe(async res => {
      this.isloading = false;
      if (res?.otpsended) {
        this.otpsended = true;
        this.sendagain = false;
      }
      this.message = res?.message;
      this.utlityService.show(res?.message);
    });
  }
  signin() {
    if (this.accountService.monpurcheck(this.f.name.value)) return;

    this.submitted = true;
    const phone = this.f.phone.value?.trim().replace(/\./g, '');
    const otp = this.f.otp.value?.trim();

    if (otp && phone) {
      const model = { name: this.f.name.value, phone, otp };

      this.accountService.autosignup(model).subscribe(async res => {
        if (res?.nomach) {
          this.message = res.message;
          this.utlityService.show(res.message);
        }
        if (res?.success) {
          await this.accountService.setUser(res);
          if (this.storageService.isBrowser) {
            location.reload();
          }
        }
      });
    }
  }
}
