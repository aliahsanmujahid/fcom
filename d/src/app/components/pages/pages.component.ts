import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { CategoryService } from 'src/app/_services/category.service';
import { SettingsService } from 'src/app/_services/settings.service';
import { utlityService } from 'src/app/_services/utlity.service';
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
  pageEdit:boolean = false;
  pageForm: UntypedFormGroup;
  selectedpage = null;
  constructor(private route: ActivatedRoute,private http: HttpClient,
    public categoryService: CategoryService,private accountService: AccountService,private formBuilder: UntypedFormBuilder,
    public settingsService: SettingsService,public utlityService: utlityService) { }
  async ngOnInit(): Promise<void> {
    this.pageForm = this.formBuilder.group({
        id: [''],
        name: ['', Validators.required],
        c: ['', [Validators.required, Validators.minLength(100), Validators.maxLength(10000)]]
    });
    this.accountService.setCheckedUser();  
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
      }
    })
    this.getpages();
    this.getcategorys();
  }
  pages = [];
  getpages(){
    this.settingsService.getpages().subscribe( res =>{
       if(res){
        this.pages = res;
       }
    });
  }
  categorys = null;
  getcategorys(){
    this.categoryService.getallcate().subscribe( res =>{
       if(res){
        this.categorys = res;
       }
    });
  }
  get f() {
      return this.pageForm.controls;
  }
  reset(){
    this.pageForm.reset(); 
    this.loading = false;
    this.submitted = false;
    this.pageEdit = false;
    this.utlityService.hidealert();
  }
  submitted = false;
  loading = false;
  createpage(){
    this.submitted = true;
    this.loading = true;
    if (this.pageForm.invalid) {
      this.pageForm.markAllAsTouched();
      this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
      this.loading = false;
      return;
    }
    var data = {id:this.f.id.value,name:this.f.name.value,c:this.f.c.value};
    this.settingsService.createpage(data).subscribe( res =>{
      if(res?.success){
       this.utlityService.show("1/Data inserted.");
       this.getpages();
       this.reset();
      }else{
        this.utlityService.show("2/Failed.");
      }
    });
  }
  cretateedit(page = null){
    if(page){
      this.selectedpage = page;
      this.f.id.setValue(page?.id);
      this.f.name.setValue(page?.name);
      this.f.c.setValue(page?.c);
    }
    this.pageEdit = true;
  }
  deletepage(item = null,confirm){
    if(item){
      this.selectedpage = item;
      this.utlityService.showalert("deletepage");
    }
    if(confirm &&  this.selectedpage){
      this.settingsService.deletepage(this.selectedpage).subscribe(res => {
        this.reset();
        this.getpages();
        this.utlityService.show(res?.message);
        this.utlityService.hidealert();
      });
    }
  }
  pageaction(item){
    this.settingsService.pageaction(item).subscribe(res => {
        this.reset();
        this.getpages();
        this.utlityService.show(res?.message);
    });
  }
  cateids = [];
  cateselect(item) {
    const index = this.cateids.indexOf(item.id);
    if (index > -1) {
      this.cateids.splice(index, 1);
    } else {
      this.cateids.push(item.id);
    }
  }
}
