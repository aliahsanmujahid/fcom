import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/_models/user';
import { utlityService } from 'src/app/_services/utlity.service';
import { AccountService } from 'src/app/_services/account.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit{
  user:User = null;
  constructor( private router: Router,private route: ActivatedRoute,
    public accountService: AccountService, public utlityService: utlityService,
  ) { }
  async ngOnInit(): Promise<void> {
     await this.accountService.currentUser$.subscribe(user => {
          if(user){
            this.user = user;
            this.setSidebar();
          }
        });
  }
  sidebar:any = []; 
  setSidebar(){
    this.sidebar = [
      {id:1,name:'Dashboard',path:'',params: {},logo:'fa fas fa-user',
      show:this.user?.role == 'admin' || this.user?.role == 'moderator'  ? true : false,
      sub: [ 
        {id:1,name:'Admin Dashboard',path:'/dash', params: {},logo:'fa fas fa-user',show:true },
      ] 
      },
      {id:2,name:'Product',path:'', logo:'',show:this.user?.role == 'admin' , sub: [
        {id:1,name:'Category',path:'/category', params: {},logo:'fa fas fa-user',show:this.user?.role == 'admin' ? true : false },
        {id:2,name:'Create Product',path:'/createproduct', params: {},show:true,logo:'fa fas fa-user', },
        {id:3,name:'Active Product',path:'/product', params: {type:1},show:true,logo:'fa fas fa-user', },
        {id:4,name:'Inactive Product',path:'/product',show:true,params: {type:2},logo:'fa fas fa-user', },
      ]},
      {id:3,name:'Order',path:'/ordermanage', params: {'status':'all'},logo:'fa fas fa-user', 
      show:(this.user?.role == 'admin' || this.user?.role == 'moderator' ) ? true : false,
      sub: [
        {id:2,name:'Pending',path:'/ordermanage',show:this.user?.role == 'admin'  ? true : false,params: {'status':'pending'},logo:'fa fas fa-user', },
        {id:3,name:'Approved',path:'/ordermanage',show:true, params: {'status':'approved'},logo:'fa fas fa-user', },
        {id:4,name:'Delivering',path:'/ordermanage',show:true,params: {'status':'delivering'},logo:'fa fas fa-user', },
        {id:5,name:'Confirmed',path:'/ordermanage',show:true,params: {'status':'confirmed'},logo:'fa fas fa-user', },
        {id:6,name:'Rejected',path:'/ordermanage',show:true,params: {'status':'rejected'},logo:'fa fas fa-user', },
        {id:7,name:'Cancled',path:'/ordermanage',show:true,params: {'status':'cancled'},logo:'fa fas fa-user', },
        {id:8,name:'Inreview',path:'/ordermanage',show:true,params: {'status':'inreview'},logo:'fa fas fa-user', },
      ]},
      {id:4,name:'Reviews',path:'',params: {'status':'-1'}, logo:'fa fas fa-user',
      show:this.user?.role == 'admin' || this.user?.role == 'moderator'   ? true : false, sub: [
        {id:2,name:'Pending',path:'/reviewmanage',show: true,params: {'status':'pending'},logo:'fa fas fa-user', },
        {id:3,name:'Approved',path:'/reviewmanage',show: true,params: {'status':'approved'},logo:'fa fas fa-user', },
        {id:4,name:'Rejected',path:'/reviewmanage',show: true,params: {'status':'rejected'},logo:'fa fas fa-user', },
      ]},
      {id:5,name:'Offers',path:'',params: {},logo:'fa fas fa-user', 
      show:this.user?.role == 'admin' ? true : false,
      sub: [
        {id:1,name:'Coupons',path:'/couponmanage',show:true,params: {},logo:'fa fas fa-user', },
      ]},
      {id:6,name:'Site Managment',path:'', logo:'',
        show:this.user?.role == 'admin' ? true : false,
        sub: [
        {id:1,name:'Page Creation',show:true ,path:'/pages',params: {},logo:'fa fas fa-user', },
        {id:2,name:'Site Content',path:'/sitecontent',show:true ,params: {p:'s'},logo:'fa fas fa-user', },
        {id:3,name:'Site Manage',path:'/sitemanage',show:true,params: {},logo:'fa fas fa-user', },
      ]},
      {id:7,name:'Reports',path:'', logo:'',
        show:this.user?.role == 'admin' ? true : false,
        sub: [
          {id:1,name:'Order Report',path:'/orderreport',show:true,params: {},logo:'fa fas fa-user', },
          {id:2,name:'Product Views',path:'/productviewreport',show:true,params: {},logo:'fa fas fa-user', },
          {id:3,name:'User Report',path:'/userreport',show:true,params: {},logo:'fa fas fa-user', },
        ]},
      {id:8,name:'Images',path:'', logo:'',
        show:this.user?.role == 'admin' || this.user?.role == 'moderator' ? true : false,
        sub: [
        {id:1,name:'Images',path:'/files',show:true,params: {type:1},logo:'fa fas fa-user', },
        {id:2,name:'Site Images',path:'/files',show:this.user?.role == 'admin'   ? true : false,params: {type:2},logo:'fa fas fa-user', },
      ]},
      {id:9,name:'Users',path:'/usermanage',params: {},logo:'', show:this.user?.role == 'admin' ? true : false,
        sub: [
         {id:1,name:'Manage Users',path:'/usermanage', show:true, params: {},logo:'fa fas fa-user', },
        ]},
      {id:10,name:'Return Managment',path:'', logo:'',
        show:(this.user?.role == 'admin' || this.user?.role == 'moderator' ) ? true : false,
        sub: [
        {id:1,name:'In Process',path:'/return',show:true,params: {type:1},logo:'fa fas fa-user', },
        {id:2,name:'Processed',path:'/return',show:true,params: {type:2},logo:'fa fas fa-user', },
        {id:3,name:'Reject',path:'/return',show: true,params: {type:3},logo:'fa fas fa-user', },
      ]},
      {id:11,name:'Questions',path:'', logo:'',
        show:this.user?.role == 'admin' || this.user?.role == 'moderator'    ? true : false,
        sub: [
        {id:1,name:'Not Answered',path:'/question',show:true,params: {status:1},logo:'fa fas fa-user', },
        {id:2,name:'Answered',path:'/question',show:true,params: {status:2},logo:'fa fas fa-user', },
      ]},
      {id:12,name:'Basket',path:'', logo:'',
        show:this.user?.role == 'admin' || this.user?.role == 'moderator' ? true : false,
        sub: [
        {id:1,name:'User Basket',path:'/basket',show:true,params: {},logo:'fa fas fa-user', },
      ]},
    ];
  }
  activeid:number = 0;
  activeid2:number = 0;
   pathclick(item,main){
     if(main){
       if(this.activeid == item?.id){
         this.activeid = null;
       }else{
         this.activeid = item.id;
       }
       this.activeid2 = 0;
     }else{
       item?.path ? this.router.navigate([item?.path, item?.params]) : '';
       this.activeid2 = item?.id;
       this.utlityService.hidealert();
     }
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
}
