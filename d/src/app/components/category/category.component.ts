import { CategoryService } from './../../_services/category.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  constructor(public utlityService:utlityService,private route: ActivatedRoute,
    private http: HttpClient,public accountService: AccountService,
    private formBuilder: UntypedFormBuilder,private router: Router,
    public categoryService: CategoryService) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          window.scrollTo(0, 0);
        }
      });
     }
  categoryes: any = [];
  user:User;
  cateForm: UntypedFormGroup;
  subcateForm: UntypedFormGroup;
  async ngOnInit(): Promise<void> {
    this.cateForm = this.formBuilder.group({
      id: [''],
      image: ['', Validators.required],
      name: ['', Validators.required],
    });
    this.subcateForm = this.formBuilder.group({
      id: [''],
      cateid: ['', Validators.required],
      image: ['', Validators.required],
      name: ['', Validators.required],
    });
    this.accountService.setCheckedUser();
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
        this.user = user;
      }
    })
    this.getallcate();
  }
  getallcate(){
    this.categoryService.getallcate().subscribe( res => {
      this.categoryes = res;
    });
  }
  get f() {
    return this.cateForm.controls;
  }
  get ff() {
    return this.subcateForm.controls;
  }
  submitted = false;
  loading = false;
  catecreate(){
    this.submitted = true;
    this.loading = true;
    if (this.cateForm.invalid) {
      this.cateForm.markAllAsTouched();
      this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
      this.loading = false;
      return;
    }
    this.utlityService.hidealert();
    var form = {id:this.f.id.value,image: this.f.image.value,name: this.f.name.value};
    this.categoryService.createcate(form).subscribe( res =>{
      this.reset();
    });
  }
  subsubmitted = false;
  subloading = false;
  subcatecreate(){
    this.subsubmitted = true;
    this.subloading = true;
    if (this.subcateForm.invalid) {
      this.subcateForm.markAllAsTouched();
      this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
      this.subloading = false;
      return;
    }
    if( this.ff.cateid.value == 0 ){
      return;
    }
   this.utlityService.hidealert();
   var form = {id:this.ff.id.value,cateid: this.ff.cateid.value,image: this.ff.image.value,name: this.ff.name.value};
   this.categoryService.createsubcate(form).subscribe( res =>{
    this.reset();
  });
  }
  deleteItem:any = null;
  type:any = null;
  deletecate(item,type, c = null){
   this.deleteItem = item;
   if(c){
    this.deleteItem.maincate = c?.name;
   }
   console.log("this.deleteItem ", this.deleteItem );
   this.type = type;
   this.utlityService.showalert('delete');
  }
   deteteConfirm(){
    if(this.type=='cate'){
      this.categoryService.deletecate(this.deleteItem?.id).subscribe( res =>{
        if(res.success == true){
           this.getallcate();
        }
      });
    }else{
      this.categoryService.deletesubcate(this.deleteItem?.id).subscribe( res =>{
        if(res.success == true){
          this.getallcate();
         }
        });
    }
    this.reset();
   }
   editcate(c){
    this.f.id.setValue(c.id);
    this.f.name.setValue(c.name);
    this.f.image.setValue(c.image);
    this.utlityService.showalert('showcate');
   }
   editsubcate(c){
    this.ff.id.setValue(c.id);
    this.ff.cateid.setValue(c.cateid);
    this.ff.name.setValue(c.name);
    this.ff.image.setValue(c.image);
    this.utlityService.showalert('showsubcate');
   }
   reset(){
    this.cateForm.reset(); 
    this.subcateForm.reset();
    this.subcateForm.get('cateid')?.reset('');
    this.subsubmitted = false;
    this.subloading = false;
    this.loading = false;
    this.submitted = false;
    this.getallcate();
    this.utlityService.hidealert();
   }
}
