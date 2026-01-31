import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/_services/product.service';
import { AccountService } from 'src/app/_services/account.service';
import { Product } from 'src/app/_models/product';
import { CategoryService } from 'src/app/_services/category.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { User } from 'src/app/_models/user';
import { environment } from 'src/environments/environment';
import {Clipboard} from '@angular/cdk/clipboard';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  products: Product[] = null;
  user: User= null;
  cateid:number = 0;
  subcateid:number = 0;
  ia:number = -1;
  cate:any=[]
  subcate:any=[]
  type = null;
  searchform: UntypedFormGroup;
  constructor(private route: ActivatedRoute,public productService: ProductService,
    public accountService: AccountService,public categoryService: CategoryService,
     private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService,private clipboard: Clipboard) { }
  async ngOnInit(): Promise<void> {
    this.searchform = this.formBuilder.group({
          search: ['', Validators.required]
        });
    this.accountService.setCheckedUser();
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
        this.user = user;
      }
    });
    if(this.route.params){
      window.scrollTo(0, 0);
      this.route.params.subscribe(params => {
        if(params && params['type']){
          this.type = params['type'];
          this.getproducts();
        }
    })};
    this.getcate();
  }
  getcate(){
    this.categoryService.getallcate().subscribe( res => {
      this.cate = res;
    }),
    error => {
    };
  }
  submitted = false;
  get f() {
    return this.searchform.controls;
  }
  reset(){
    this.searchform.reset();
    this.utlityService.hidealert();
    this.submitted = false;
    this.page = 1;
    this.getproducts();
  }
 page = 1;
 nomoreproduct
  getproducts(){
    this.alert = this.alert2 = false;
    this.page = 1;
    this.products = null;
    this.productService.getproducts({type:this.type,page:this.page}).subscribe( res =>{
      window.scrollTo(0, 0);
      this.products = res;
      if(res.length == 0 || res.length < 10){
        this.nomoreproduct = true;
      }
    });
  }
  loadProduct(){
    this.productService.getproducts({type:this.type,page:++this.page}).subscribe( res =>{
      res.forEach(element => {
        this.products.push(element);
      });
      if(res.length == 0 || res == null){
        this.nomoreproduct = true;
       }else{
         this.nomoreproduct = false;
       }
    });
  }
  alert = false;
  deleteproduct(id){
    this.productService.deleteproduct(id).subscribe( async res =>{
      if(res?.success){
        this.page = 1;
        this.nomoreproduct = false;
       await (this.getproducts());
       this.alert = false;
       this.alert2 = false;
       this.dalert = false;
       this.selectedProduct = null;
       this.utlityService.show("1/Product delete successfully.");
      }
    });
  }
  alert2:boolean = false;
  selectedProduct:Product = null;
  alerttoggle(item){
    this.alert2 = !this.alert2;
    if(item){
      this.selectedProduct = item;
    }
  }
  dalert:boolean = false;
  alerttoggle2(item){
    this.selectedProduct = item;
    this.dalert = !this.dalert;
    this.alert = false;
    this.alert2 = false;
  }
  productactiveinactive(item){
    let data = {id:item.id,status: 0};
    if(item.ia == 1){
      data.status = 0;
    }else{
      data.status = 1;
    }
    this.productService.productactiveinactive(data).subscribe( async res =>{
      if(res?.success){
        await (item.ia = data?.status);
      }
    });
  }
  copyTxt(txt) {
    this.clipboard.copy(txt);
    this.utlityService.show('1/Text Copied');
  }
}
