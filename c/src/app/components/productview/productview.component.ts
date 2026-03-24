import { ReviewService } from './../../_services/review.service';
import { Component, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BasketService } from 'src/app/_services/basket.service';
import { ProductService } from 'src/app/_services/product.service';
import { environment } from 'src/environments/environment';
import { AccountService } from 'src/app/_services/account.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { Cart, SettingsService, Shop, Want } from 'src/app/_services/settings.service';
import { StorageService } from 'src/app/_services/storage.service';
import { filter } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-productview',
  templateUrl: './productview.component.html',
  styleUrls: ['./productview.component.css']
})
export class ProductviewComponent implements OnChanges {
  reviewAlert:boolean = false;
  selectAlert:boolean = false;
  constructor(private router: Router,private route: ActivatedRoute,private productService: ProductService,
    private basketService: BasketService,private reviewService: ReviewService,public settingsService: SettingsService,
    public accountService: AccountService, public utlityService: utlityService,
    private formBuilder: UntypedFormBuilder,public settingService:SettingsService,
    public storageService:StorageService,private readonly http: HttpClient,private sanitizer: DomSanitizer
    ) {
      this.utlityService.hidealert();
      this.utlityService.hidereviewalert();
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
            this.utlityService.scrollTop();
            this.product = null;
            this.stopscroll = false;
            this.relatedproducts = [];
            this.questions = [];
            this.isloading = false;
      });
  }
  selectedimg = '';
  product = null;
  rpage = 0;
  cartProduct = new Cart();
  alert = false;
  isloading=false;
  noreview = false;
  vari1alert = false;
  vari2alert = false;
  varialert = false;
  loading = false;
  params = null;
  user:any = null;
  reviews = {data:[],l:0};
  filter = null;
  pages = [];
  questionform: UntypedFormGroup;
  async ngOnInit(): Promise<void> {
    this.questionform = this.formBuilder.group({
      id: [''],
      question: ['', Validators.required]
    });
    this.utlityService.setmenuname(this.router.url);
    this.accountService.setCheckedUser();
    this.accountService.currentUser$.subscribe( user => {
        if(user){
          this.user = user;
        }
      });
    this.route.params.subscribe(async params => {
      this.selectVari = null;
      this.noerror = true;
      if(params?.id){
        this.getsingleproduct(params?.id); 
      }else{
        this.router.navigateByUrl('/shop');
      }
    });
    this.utlityService.params$.subscribe( res =>{
      if(res){
        this.params = res;
      }else{
        this.params = new Shop();
      }
    });
    this.utlityService.pagesource$.subscribe( pages => {
      this.pages = pages;
    });
  }
  ngOnChanges() {
    this.setView();
  }
  ngOnDestroy(): void {
    if(this.storageService.isBrowser) {
     document.body.classList.remove('hide-scrollbar');
    }
    this.stopscroll = false;
    this.relatedproducts = [];
    this.isloading = false;
  }
  ngAfterViewInit(): void {
    this.setView(); 
  }
  setView(){
    const pid = this.product?.uid;
    if(!pid){return};
    let views = this.storageService.getItem('views') || [];
    if (!Array.isArray(views)) {
      views = [];
    }
    const index = views.findIndex(v => v.pid == pid);
    const now = Date.now();
    const threeMinutes = 3 * 60 * 1000;
    if (index !== -1) {
     const lastTime = new Date(views[index].date).getTime();
     if (now - lastTime > threeMinutes) {
      views[index].date = new Date();
      this.storageService.setItem('views', views);
      this.accountService.updateviews(pid);
    }
    } else {
     views.push({ pid, date: new Date() });
     this.storageService.setItem('views', views);
     this.accountService.updateviews(pid);
    }
  }
  submitted = false;
  get f() {
    return this.questionform.controls;
  }
  createeditanswerquestion(){
    this.submitted = true;
    if (this.questionform.invalid){
      this.questionform.markAllAsTouched();
      this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
      return;
    }
    var data = {
      id: this.f.id.value,
      question: this.f.question.value,
      customerid: this.user?.id,
      customername: this.user?.name,
      pid: this.product?.id,
    };
    
    this.productService.createeditanswerquestion(data).subscribe( async res => {
      if(res?.success){
        let q = this.questions.find(x => x.id = this.f.id.value);
        if(q){
          q.question = this.f.question.value;
        }else{
         this.questions.unshift(...res.data);
        }
      }
      this.utlityService.hidealert();
    });
  }
  async getsingleproduct(id: any) {
  try {
    this.utlityService.showloader(true);
    this.productService.getsingleproduct(id).subscribe(async res => {
      if (!res) return this.router.navigateByUrl('/shop');
      this.product = res;
      this.questions.push(...res?.questions);
      this.reviews.data.push(...res?.reviews);
      this.filldata();
      this.getoffers();
      const want = (await this.storageService.getItem('want')) || new Want();
      want.cateid = this.product?.cateid;
      want.catename = this.product?.catename;
      await this.storageService.setItem('want', want);
      this.utlityService.showloader(false);
    });
  } catch {
    this.router.navigateByUrl('/shop');
  }
}
  showReviewforproduct(){
   this.utlityService.setreviewfor({id:this.product?.id,type:1});
   this.utlityService.showalert('reviews');
  }
  showReview(id){
   this.utlityService.setreviewfor({id:id,type:2});
   this.utlityService.showalert('reviews');
  }
  seequestion(){
    this.utlityService.showalert('seequestion');
  }
  page = 1;
  questions = [];
  nomoreitem = false;
  getproductquestions(){
    this.utlityService.showloader(true);
    this.loading = true;
    this.productService.getproductquestions(this.user?.id,this.product?.id,this.page++).subscribe( res => {
      
      this.questions.push(...res);
      this.loading = false;
      this.utlityService.showloader(false);
      if(res?.length == 0 || res == null || res?.length < 3){
        this.nomoreitem = true;
      }
    });
  }
  stopscroll  = false;
  relatedproducts=[];
  skip = environment.skip;
  repage = 0;
  onScroll(): void {
    if(this.stopscroll == false){
      this.isloading = true;
      this.utlityService.showloader(true);
      this.productService.getrelatedproducts(this.product.cateid,this.product.subcateid,this.repage++).subscribe( async res => {
      if(res){
        this.relatedproducts.push(...res?.filter(item => item.id !== this.product?.id));
      }
      if(res?.length == 0 || res == null || res?.length < this.skip){
        this.stopscroll = true;
      }
      this.utlityService.showloader(false);
      this.isloading = false
    });
    }
  }
  async filldata(){
    this.sliderItems = [];
    for(let i=1;i<=7;i++){
      if(this.product['file'+i] && this.product['file'+i] != ""){
        this.sliderItems.push({link:(this.product['file'+i])});
      }
    }
    this.cartProduct = {
      id: this.product.id,
      puid: this.product.uid,
      cateid:this.product?.cateid,
      eachid:null,
      subcateid:this.product?.subcateid,
      name:this.product.name,
      price:this.product.price,
      sprice:this.product.sprice,
      weight:this.product.weight,
      quantity:1,
      sku:this.product.sku,
      img:this.product.file1,
      vari : {
        id: null,
        name:'',
        values:[]
      },
    };
  }
  noerror = true;
  async addItemToBasket(){
    if(this.product.quantity <= 0){
      this.utlityService.show('3/পণ্য শেষ হয়ে গেছে।');
      return;
    }
    if(this.product.hasvari == 1 && this.cartProduct.vari.values.length == 0){
      this.alert = true;
      this.varialert = true;
      this.noerror = false;
      this.utlityService.showalert('vari');
      return;
    }
    await this.basketService.addItemToBasket(this.cartProduct);
    this.router.navigateByUrl('/cart');
  }
  selectVari = null;
  onVarichange(s){
    if(s.quantity <= 0){
      this.utlityService.show('2/'+s?.name +' এর পরিমাণ শেষ।');
      return;
    }
    this.utlityService.hidealert();
    this.noerror = true;
    this.selectVari = s;
    this.product.price = s?.price;
    this.product.sprice = s?.sprice;
    this.cartProduct.price = s?.price;
    this.cartProduct.sprice = s?.sprice;
    this.cartProduct.vari = {id: 0, name:'', values:[] },
    this.cartProduct.vari.id = this.product.vari.id;
    this.cartProduct.vari.name = this.product.vari.name;
    this.cartProduct.vari.values.push(s);
    this.addItemToBasket();
  }
  sliderItems = [];
  activeimg = 0;
  async clickzoom(id){
   this.activeimg = id;
   this.utlityService.showalert('lightbox');
   if(this.storageService.isBrowser) {
     document.body.classList.add('hide-scrollbar');
   }
  }
  hideLightbox() {
    this.utlityService.hidealert();
    if(this.storageService.isBrowser) {
     document.body.classList.remove('hide-scrollbar');
   }
  }
  async addremovefav(product){
    if(this.user){
      this.isloading = true;
      this.productService.addremovefav(this.user.id,product?.id).subscribe(async res => {
        if(res?.isfav){
          product.isfav = true;
          this.utlityService.show('1/পছন্দ করা হচ্ছে।');
        }else{
          product.isfav = false;
          this.utlityService.show('2/পছন্দ করা হচ্ছে না।');
        }
        
        this.isloading = false;
      });
    }else{
      this.utlityService.show('3/দয়া করে লগইন করুন।');
    }
  }
  addeditQusetion(question){
    if(!this.user){
      this.utlityService.show('2/Please Login');
      return;
    }
    this.reset();
    this.utlityService.showalert('question');
    if(question){
      this.f.id.setValue(question?.id);
      this.f.question.setValue(question?.question);
    }
  }
  askaquestionclick(){
    if(!this.user){
      this.router.navigateByUrl('/login');
    }else{
      this.utlityService.showalert('question');
    }
  }
  reset(){
    this.questionform.reset(); 
    this.submitted = false;
  }
  activeIndex = 0;
  goToSlide(index: number) {
    this.activeIndex = index;
  }
  PrevNext(type) {
    const lastIndex = this.sliderItems.length - 1;
    if (type == 1) {
      this.activeIndex =
      this.activeIndex == 0 ? lastIndex : this.activeIndex - 1;
    }
    if (type == 2) {
      this.activeIndex =
      this.activeIndex == lastIndex ? 0 : this.activeIndex + 1;
    }
  }
  offers = [];
  getoffers(){
    this.productService.getoffers(this.user?.phone).subscribe( res => {
      if(res){
        this.offers = res;
      }
    });
  }
}
