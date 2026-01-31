import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { ReportService } from 'src/app/_services/report.service';
import { utlityService } from 'src/app/_services/utlity.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CategoryService } from 'src/app/_services/category.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-orderreport',
  templateUrl: './orderreport.component.html',
  styleUrls: ['./orderreport.component.css']
})
export class OrderreportComponent implements OnInit {
 searchForm: UntypedFormGroup;
  constructor(public accountService: AccountService,
    public categoryService: CategoryService,
    public reportService: ReportService, private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService, private route: ActivatedRoute
  ) { 
  }
  async ngOnInit(): Promise<void> {
    this.searchForm = this.formBuilder.group({
        region: [''],
        city: [''],
        zone: [''],
        timetype: [''],
      });
    this.accountService.setCheckedUser();  
    await this.accountService.currentUser$.subscribe(user => {
      if(user){
      }
    })
    this.getbdaddress();
  }
  timeType=[
    { id:1,v:'This Week' },
    { id:2,v:'This Month' },
    { id:3,v:'Prev Three Month' },
    { id:4,v:'Prev Six Month' },
    { id:5,v:'This Year' },
  ];
bdaddress = [];
getbdaddress(){
    this.accountService.getbdaddress().subscribe(res=>{
        this.bdaddress = res;
    });
  }
cities: any[] = [];
zones: string[] = [];
onRegionChange(event: Event) {
  const regionName = (event.target as HTMLSelectElement).value;
  const region = this.bdaddress.find(r => r.name == regionName);
  this.cities = region ? region.districts : [];
  this.zones = [];
  this.searchForm.get('city')?.setValue('');
  this.searchForm.get('zone')?.setValue('');
}
onCityChange(event: Event) {
  const cityName = (event.target as HTMLSelectElement).value;
  const city = this.cities.find(c => c.name == cityName);
  this.zones = city ? city.upazilas : [];
  this.searchForm.get('zone')?.setValue('');
}
  submitted = false;
  loading = false;
  get f() {
     return this.searchForm.controls;
   }
  reset(){
    this.searchForm.reset(); 
    this.submitted = false;
    this.page = 0;
    this.data = {count:0,data:[]};
  }
  data = {count:0,data:[]};
  search(){
      this.submitted = true;
      this.loading = true;
      this.page = 0;
      if (this.searchForm.invalid) {
        this.searchForm.markAllAsTouched();
        this.utlityService.show('3/দয়া করে সব পূর্ণ করুন।');
        this.loading = false;
        return;
      }
      this.utlityService.hidealert();
      var model = {region:this.f.region.value,city:this.f.city.value,
      zone:this.f.zone.value,timetype: this.f.timetype.value,page:this.page++,
      };
      this.reportService.orderreport(model).subscribe( async res =>{
        this.data  = res;
        if(res?.data?.length === 0 || res?.data?.length < 5 ){
          this.nomoreorder = true;
        }else{
          this.nomoreorder = false;
        }
      });

      
    }
  page = 0;
  nomoreorder = false;
  getPagedOrder(){
    if(this.nomoreorder){
       return;
    }
    var model = {region:this.f.region.value,city:this.f.city.value,
      zone:this.f.zone.value,timetype: this.f.timetype.value,page:this.page++,
      };
   this.reportService.orderreport(model).subscribe(res =>{
      this.data?.data?.push(...res?.data);
      if(res?.data?.length === 0 || res?.data?.length < 5 ){
          this.nomoreorder = true;
      }else{
          this.nomoreorder = false;
      }
   });
  }
  downloadUsersAsHtml(order, filename) {
  const orderSections = `
    <div class="order-container">
      <h2>Order #${order.uid}</h2>
      <br/>
      <div class="order-info">
        <p><strong>Customer Name:</strong> ${order.name}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Subtotal:</strong> ${order.subtotal} Tk</p>
        <p><strong>Delivery Fee:</strong> ${order.delivery} Tk</p>
        ${order.cvalue ?  
            `<p class="text-emerald-500">${order.cvalue} Tk</p>
            ` : ''
        }
        <p class="total"><strong>Total:</strong> <span>${order.total} Tk</span></p>
      </div>
      <br/>
      <h2>Order Items</h2>
      <br/>
      <table class="order-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Variation</th>
            <th>Sku</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.orderitems.map((item: any) => `
            <tr>
              <td>${item.name.length > 20 ? item.name.slice(0, 20) + '…' : item.name}</td>
              <td>
                ${item.vari 
                  ? `${item.vari}${item.vname ? ` (${item.vname})` : ''}` 
                  : '—'}
              </td>
              <td>
                ${item.sku 
                  ? `${item.sku}${item.vsku ? ` (${item.vsku})` : ''}` 
                  : '—'}
              </td>
              <td>${item.price} Tk</td>
              <td>${item.quantity}</td>
              <td>${item.totalprice} Tk</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const htmlContent = `
    <html>
      <head>
        <title>Monpur.com</title>
        <meta charset="UTF-8" />
        <style>
          body {
            background-color: #f9fafb;
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .order-container {
            max-width: 750px;
            margin: 0 auto 40px;
            background: white;
            padding: 16px;
            border: 1px solid #ddd;
          }
          h2,p {
            font-size: 15px;
            margin:0px;
          }
          .order-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 8px;
            text-transform: capitalize;
          }
          .order-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          .order-table th,
          .order-table td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
          }
          .order-table th {
            background-color: #f1f1f1;
          }
        </style>
      </head>
      <body>
        ${orderSections}
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  }
 
}
