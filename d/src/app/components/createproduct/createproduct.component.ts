import { ProductService } from './../../_services/product.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/_services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/_services/category.service';
import { SettingsService } from 'src/app/_services/settings.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { IProduct } from 'src/app/_models/product';
import { User } from 'src/app/_models/user';
import { Editor, Toolbar } from 'ngx-editor';
@Component({
  selector: 'app-createproduct',
  templateUrl: './createproduct.component.html',
  styleUrls: ['./createproduct.component.css']
})
export class CreateproductComponent implements OnInit {
  user: User = null;
  categoryes: any = [];
  subcategoryes: any = [];
  pForm: UntypedFormGroup;
  editor: Editor;
  toolbar: Toolbar = [
   ['bold', 'italic', 'underline', 'strike'],
   ['code', 'blockquote'],
   ['ordered_list', 'bullet_list'],
   [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
   ['link', 'image'],
   ['text_color', 'background_color'],
   ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  constructor(public accountService: AccountService,private http: HttpClient,
    private route: ActivatedRoute,public categoryService: CategoryService,
    public productService: ProductService,private router: Router,
    private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService,public settingsService: SettingsService) {}
  async ngOnInit(): Promise<void> {
    this.editor = new Editor();
    this.pForm = this.formBuilder.group({
          id: [''],
          uid: [''],
          cateid: ['', Validators.required],
          subcateid: ['', Validators.required],
          name: ['', Validators.required],
          details: ['', Validators.required],
          catename: ['', Validators.required],
          subcatename: ['',Validators.required],
          sku: ['', Validators.required],
          price: ['', Validators.required],
          sprice: ['', Validators.required],
          quantity:['', Validators.required],
          weight:['', Validators.required],
          file1:['', Validators.required],
          file2:['', Validators.required],
          file3:['', Validators.required],
          file4:['', Validators.required],
          video:[''],
          variname:[''],
          variitems: this.formBuilder.array([])
        });
    this.accountService.setCheckedUser();    
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
        this.user = user;
      }
    })
    if(this.route.params){
      window.scrollTo(0, 0);
      this.route.params.subscribe(params => {
        if(params['editproduct']){
          this.getEditProduct(params['editproduct']);
        }
      })};
    this.getcate();
    this.getdelivery();
  }
  ngOnDestroy(): void {
    this.editor.destroy();
  }
  // form part
  submitted = false;
  loading = false;
  get f() {
    return this.pForm.controls;
  }
  get variitem(): UntypedFormArray {
    return this.pForm.get('variitems') as UntypedFormArray;
  }
  addItem(e): void {
    const itemFormGroup = this.formBuilder.group({
      name: [e?.name || '', Validators.required],
      quantity: [e?.quantity || '', Validators.required],
      price: [e?.price || '', Validators.required],
      sprice: [e?.sprice || '', Validators.required],
      sku: [e?.sku || '',Validators.required]
    });
    this.variitem.push(itemFormGroup);
    this.f.variname.setValidators(Validators.required);
    this.f.price.clearValidators();
    this.f.sprice.clearValidators();
    this.f.quantity.clearValidators();
    this.f.price.setValue('');
    this.f.quantity.setValue('');
    this.updateAllValidators();
  }
  removeItem(index: number): void {
    this.variitem.removeAt(index);
    if(this.variitem.controls.length == 0){
      this.f.variname.clearValidators();
      this.f.price.setValidators(Validators.required);
      this.f.quantity.setValidators(Validators.required);
      this.updateAllValidators();
    }
  }
  updateAllValidators() {
    Object.values(this.f).forEach(control => control.updateValueAndValidity());
  }
  // form part
  getEditProduct(uid){
    this.productService.getEditProduct(uid).subscribe(async res =>{
        if(res?.main == 1){
          this.f.id.setValue(res?.id);
        }else{
          this.f.id.setValue(res?.pid);
        }
        this.f.uid.setValue(res?.uid);
        this.f.cateid.setValue(res?.cateid);
        this.f.subcateid.setValue(res?.subcateid);
        this.f.name.setValue(res?.name);
        this.f.details.setValue(res?.details);
        this.f.catename.setValue(res?.catename);
        this.f.subcatename.setValue(res?.subcatename);
        this.f.sku.setValue(res?.sku);
        this.f.price.setValue(res?.price);
        this.f.sprice.setValue(res?.sprice);
        this.f.weight.setValue(res?.weight);
        this.f.quantity.setValue(res?.quantity);
        this.f.file1.setValue(res?.file1);
        this.f.file2.setValue(res?.file2);
        this.f.file3.setValue(res?.file3);
        this.f.file4.setValue(res?.file4);
        this.f.video.setValue(res?.video);
        if(res.vari?.values.length > 0){
          this.f.variname.setValue(res?.vari.name);
          await(res.vari?.values.forEach(e => {
            this.addItem(e);
          }));
        }
        this.getsubcate();
    });
  }
  getcate(){
    this.categoryService.getallcate().subscribe( res => {
      this.categoryes = res;
    });
  }
  getsubcate(){
    this.categoryService.getsubcatebyid(this.f.cateid.value).subscribe( res => {
      this.subcategoryes = res;
    })
  }
  //  create update Product...
  async createupdateproduct(){
    this.submitted = true;
    this.loading = true;
    if (this.pForm.invalid) {
      this.pForm.markAllAsTouched();
      this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
      this.loading = false;
      return;
    }
    var product: IProduct = {
      id: this.f.id.value,uid: this.f.uid.value,cateid: this.f.cateid.value,
      subcateid:this.f.subcateid.value,name: this.f.name.value,
      details: this.f.details.value,
      catename: this.f.catename.value,subcatename: this.f.subcatename.value,
      sku: this.f.sku.value,hasvari:0,price: this.f.price.value,sprice: this.f.sprice.value,
      quantity: this.f.quantity.value,
      weight: this.f.weight.value,video:this.f.video.value,
      file1: this.f.file1.value,file2: this.f.file2.value,
      file3: this.f.file3.value,file4: this.f.file4.value,
      vari: {name:'',values:[]}
    };
    if(this.variitem.controls.length > 0){
      this.variitem.controls.forEach(e => {
        var i = {name:e.get('name').value,price:e.get('price').value,
          sprice:e.get('sprice').value,
          quantity:e.get('quantity').value,sku:e.get('sku').value};
        product.vari.values.push(i);
      });
      product.price = this.variitem.controls.sort((a, b) => Number(a.get('price').value) - Number(b.get('price').value))[0].get('price').value;
      product.sprice = this.variitem.controls.sort((a, b) => Number(a.get('sprice').value) - Number(b.get('sprice').value))[0].get('sprice').value;
      product.quantity  = this.variitem.controls.reduce((a, b) => (b.get('quantity').value) + a, 0);
      product.vari.name = this.f.variname.value;
      product.hasvari = 1;
     }else{
      product.hasvari = 0;
     }
     this.productService.createupdateproduct(product).subscribe( res =>{
        console.log("product res.....", res);
        if(res.success == true){
         this.utlityService.show('1/Product created successfully.');
         this.reset();
        }
      });
  }
  onCateChange(){
    if(this.f.cateid.value !== 0){
      this.categoryes.filter(i => i.id == this.f.cateid.value)[0]?.name;
      this.categoryService.getsubcatebyid(this.f.cateid.value).subscribe( res => {
        this.subcategoryes = res;
        var catename = this.categoryes.filter(i => i.id == this.f.cateid.value)[0]?.name;
        this.f.catename.setValue(catename);
      });
    }
    this.f.subcateid.setValue('');
    this.f.subcatename.setValue('');
  }
  onSubCateChange(){
    this.subcategoryes.filter(i => i.id == this.f.subcateid.value)[0]?.name;
    var subcatename = this.subcategoryes.filter(i => i.id == this.f.subcateid.value)[0]?.name;
    this.f.subcatename.setValue(subcatename);
  }
  reset(){
    this.pForm.reset(); 
    this.loading = false;
    this.submitted = false;
  }
  viewProducts(){
    this.router.navigate(['/product',{type:0}])
  }
  deliverydata:any = {};
  getdelivery(){
    this.settingsService.getdelivery().subscribe(res => {
      this.deliverydata = res;
    });
  }
}
