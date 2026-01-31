import { environment } from 'src/environments/environment';
import { AccountService, Review } from 'src/app/_services/account.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/_models/user';
import { OrderService } from 'src/app/_services/order.service';
import { HttpClient } from '@angular/common/http';
import {Clipboard} from '@angular/cdk/clipboard';
import { utlityService } from 'src/app/_services/utlity.service';
import { Order } from 'src/app/_models/order';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-manageorder',
  templateUrl: './manageorder.component.html',
  styleUrls: ['./manageorder.component.css']
})
export class ManageorderComponent implements OnInit {
  user: User;
  nomoreorder = false;
  throttle = 0;
  distance = 1;
  page:number = 0;
  neworder = false;
  orders: Order[] = [];
  orderst:string = '';
  selectedorder: Order = null;
  status = 'pending';
  status2 = 'pending';
  setstatus = [
    {id:1,name: 'pending', },
    {id:2,name: 'approved',},
    {id:3,name: 'delivering', },
    {id:4,name: 'confirmed',},
    {id:4,name: 'rejected',},
    {id:5,name: 'cancled',},
    {id:6,name: 'inreview',}
  ]
  constructor(private route: ActivatedRoute,
    public accountService: AccountService,private http: HttpClient,
    private orderService: OrderService, private router: Router,
    private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService,private clipboard: Clipboard) { }
  searchform: UntypedFormGroup;
  ngOnInit(): void {
    this.searchform = this.formBuilder.group({
      search: ['', Validators.required]
    });
    this.accountService.setCheckedUser();  
    this.accountService.currentUser$.subscribe(res =>{
        if(res){
          this.user = res;
        }
    });
    if(this.route.params){
      window.scrollTo(0, 0);
      this.route.params.subscribe(params => {
        if (Object.keys(params).length !== 0) {
          this.orderst = this.status = params['status'];
          this.allids = [];
          this.selectedorder = null;
          this.getorders();
        };
      });
    }
  }
  statusChange($event,order = null,){
   this.status2 = $event.target.value;
   if(order){
    this.status = $event.target.value;
    this.selectedorder = order;
    this.utlityService.showalert('statuschange');
   }
  }
  txnconfirm(item){
    let txnc = item?.txnc == 1 ? 0 : 1;
    console.log("txnc......", txnc);
    this.orderService.txnconfirm({id:item?.id,txnc:txnc}).subscribe(res => {
        if(res?.success){
           item.txnc = txnc;
        }
    });
  }
  changestatus(){
    if(this.selectedorder !== null){
      this.utlityService.hidealert();
      this.orderService.changestatus(this.selectedorder.id,this.status).subscribe(res => {
        var newo =  this.orders.find(i => i.id == this.selectedorder.id,);
        newo.status = this.status;
        this.selectedorder.status = this.status;
        this.utlityService.show("1/Status Changed To <span class=' capitalize '> "+ this.status +' <span>');
        this.utlityService.livereport();
     });
    }
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
    this.getorders();
  }
  getorders(){
      this.page = 1;
      this.orders = [];
      this.orderService.getorders(this.page,this.orderst,this.f.search.value).subscribe(res =>{
      this.orders  = res;
      if(res.length === 0 || res.length < 10 ){
        this.nomoreorder = true;
      }else{
        this.nomoreorder = false;
      }
      });
  }
  getPagedOrder(){
   this.orderService.getorders(++this.page,this.orderst,this.f.search.value).subscribe(res =>{
      this.orders?.push(...res);
      if(res.length === 0 || res.length < 10 ){
         this.nomoreorder = true;
      }else{
         this.nomoreorder = false;
      }
   });
  }
  allids:any = [];
  onCheckAll($event) {
    if ($event.target.checked){
      this.orders.map(r => this.allids.push(r.uid));
    }else{
      this.allids = [];
    }
  }
  onCheck($event) {
    if ($event.target.checked){
     this.allids.push($event.target.value);
    }else{
      this.allids = this.allids.filter(x=>x !== $event?.target?.value);
    }
  }
  chacked(id){
    return this.allids.some(x=> x == id);
  }
  async selectitem(id){
    if(this.allids.some(x=>x== id)){
     await (this.allids = this.allids.filter(x=> x !== id));
    }else{
      await this.allids.push(id);
    }
  }
  setallorderstatus(confirm){
    this.selectedorder = null;
    if(confirm){
      this.utlityService.hidealert();
      this.orderService.setallorderstatus({allids:this.allids,status:this.status2}).subscribe(res =>{
        if(res?.success){
          this.utlityService.show("1/Status Changed To <span class=' capitalize '> "+ this.status2 +' <span>');
          this.orders.map( x=> this.allids.map(y=> x.uid == y ? x.status = this.status2 : ''));
        }
        this.utlityService.livereport();
      });
    }else{
      this.utlityService.showalert('statuschange');
    }
  }
  sendalltodelivery(confirm){
    if(confirm){
      this.utlityService.hidealert();
      this.orderService.sendalltodelivery({allids:this.allids}).subscribe(res =>{
        console.log("sendalltodelivery...", res);
        if(res?.success){
          this.utlityService.show('2/All Sended To Delivery.');
        }
      });
    }else{
      this.utlityService.showalert('senddelivery');
    }
  }
  copyTxt(txt) {
    this.clipboard.copy(txt);
    this.utlityService.show('1/Text Copied');
  }
  downloadAll(){
    let orders = this.orders.filter(order => this.allids.includes(order.uid));
    this.downloadOrderAsHtml(orders,'Orders');
    console.log("orders..", orders);
  }
  downloadOrderAsHtml(orders: any | any[], filename: string) {
  const orderArray = Array.isArray(orders) ? orders : [orders];

  const orderSections = orderArray.map(order => `
    <div class="order-container">
      <div class="header">
        <h2>Order ${order.uid}</h2>
        <span>${new Date(order.date).toLocaleDateString()}</span>
      </div>

      <div class="order-info">
        <p><strong>Name:</strong> ${order.name}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>

      <hr/>

      ${order.orderitems.map((item:any) => `
        <div class="item-row">
          <span>${item.name}</span>
          <span>${item.vari ? `${item.vari}${item.vname ? ` (${item.vname})` : ''}` : '—'}</span>
          <span>${item.sku ? `${item.sku}${item.vsku ? ` (${item.vsku})` : ''}` : '—'}</span>
          <span>${item.price} Tk</span>
          <span>${item.quantity}</span>
          <span>${item.totalprice} Tk</span>
        </div>
      `).join('')}

      <hr/>

      ${order.cvalue ? `<p class="discount" style="text-align:right">Discount: -${order.cvalue} Tk</p>` : ''}

      <div class="summary-row">
        <span><strong>Subtotal:</strong> ${order.subtotal} Tk</span>
        <span><strong>Delivery:</strong> ${order.delivery} Tk</span>
        <span><strong>Total:</strong> ${order.total} Tk</span>
      </div>
    </div>
  `).join('');

  const htmlContent = `
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Monpur.com</title>
    <style>
      * { box-sizing: border-box; }
      body{
        font-family: Arial;
        margin:0;
        padding:20px;
        background:#f9fafb;
      }
      .orders-wrapper{
        display:flex;
        flex-wrap:wrap;
        gap:20px;
        justify-content:center;
      }
      .order-container{
        background:#fff;
        border:2px dashed #cbd5e1;
        padding:16px;
        flex:0 0 calc(50% - 20px); 
        max-width:calc(50% - 20px);
        page-break-inside: avoid;
      }
      .header{
        display:flex;
        justify-content:space-between;
        align-items:center;
      }
      h2,p{
        margin:4px 0;
        font-size:15px;
      }
      .order-info{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
        gap:6px;
        margin-top:6px;
      }
      hr{
        border:none;
        border-top:1px dashed #ddd;
        margin:12px 0;
      }
      .items-header,
      .item-row{
        display:grid;
        grid-template-columns:2fr 1.4fr 1.4fr 1fr 0.8fr 1.2fr;
        font-size:13px;
        align-items:center;
        text-align:center;
      }
      .items-header{
        font-weight:bold;
        margin-bottom:6px;
      }
      .item-row{
        padding:6px 0;
      }
      .item-row:last-child{
        border-bottom:none;
      }
      .summary-row{
        display:flex;
        justify-content:space-between;
        font-size:14px;
        margin-top:12px;
        padding-top:8px;
      }
      .summary-row span{
        flex:1;
        text-align:center;
      }
      .discount{
        color:#059669;
        font-size:14px;
      }
    </style>
  </head>
  <body>
    <div class="orders-wrapper">
      ${orderSections}
    </div>
  </body>
  </html>
  `;
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  }

 










  
}


