import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { ReviewService } from 'src/app/_services/review.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';
import { ProductService } from 'src/app/_services/product.service';
@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  
  constructor(public accountService: AccountService,private router: Router,
    private route: ActivatedRoute,private reviewService: ReviewService,
    private productService: ProductService,
    public utlityService: utlityService) { 
      this.utlityService.hidealert();
      this.utlityService.hidereviewalert();
      this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
          ).subscribe(() => {
            this.utlityService.scrollTop();
          });
  }
  nomorereview:boolean = false;
  oskip = environment.oskip;  
  page = 0;
  reviews = [];
  product = null;
  noreview = false;
  activeuser = null;
  pid = null;
  filter = null;
  loading = null;
  data = null;
  ngOnInit(): void {
   this.utlityService.reviewstoshow$.subscribe( res => {
      if(res){
        this.data = res;
        this.getallreviews();
      }
    });
  }
  ngOnDestroy(): void {
    this.utlityService.setreviewfor(null);
  }
  sourceData = null;
  ratingSummary = [];
  getRatingCount(r: number) {
   if (!this.ratingSummary) return 0;
   const found = this.ratingSummary.find(x => x.rating === r);
   return found ? found.count : 0;
  }
  getallreviews(){
  this.page = 0;
  this.reviews = [];
  
  this.loading = true;
  this.nomorereview = false;
  this.reviewService.getallreviews(this.page++, this.data).subscribe( res =>{
    res?.sourceData ? this.sourceData = res?.sourceData : '';
    res?.ratingSummary ? this.ratingSummary = res?.ratingSummary : '';
    res?.data ? this.reviews.push(...res?.data) : '';
    if(res?.data?.length == 0 || res?.data == null || res?.data?.length < this.oskip){
      this.noreview = true;
      this.nomorereview = true;
    }else{
       this.noreview = false;
       this.nomorereview = false;
    }
    this.loading = false;
  });
  }
  loadmorereviews(){
    this.loading = true;
    this.reviewService.getallreviews(this.page,this.filter).subscribe( res =>{
      this.reviews.push(...res?.data);
      if(res?.data?.length == 0 || res?.data == null || res?.data?.length < this.oskip){
        this.nomorereview = true;
       }else{
         this.nomorereview = false;
       }
       this.loading = false;
    });
  }


}
