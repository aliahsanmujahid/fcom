import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';
import { ReportService } from 'src/app/_services/report.service';
import { saveAs } from 'file-saver';
import { utlityService } from 'src/app/_services/utlity.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/_services/category.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-userreport',
  templateUrl: './userreport.component.html',
  styleUrls: ['./userreport.component.css']
})
export class UserReportComponent implements OnInit {
 searchForm: UntypedFormGroup;
  constructor(public accountService: AccountService,
    public categoryService: CategoryService,
    public reportService: ReportService, private formBuilder: UntypedFormBuilder,
    public utlityService: utlityService, private route: ActivatedRoute
  ) { 
  }
  async ngOnInit(): Promise<void> {
    this.searchForm = this.formBuilder.group({
        phone: [''],
        usertype: [''],
        gender: [''],
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
  userType = [
    { id:2,v:'Customer' },
    { id:3,v:'admin' },
    { id:4,v:'moderator' },
  ];
 customerGender = [
    { id:1,v:'Male' },
    { id:2,v:'Female' },
    { id:2,v:'Others' },
  ];
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
  categoryes: any = [];
  subcategoryes: any = [];
  getcate(){
    this.categoryService.getallcate().subscribe( res => {
      this.categoryes = res;
    });
  }
  onCateChange(){
    if(this.f.cateid.value){
      this.categoryes.filter(i => i.id == this.f.cateid.value)[0]?.id;
      this.categoryService.getsubcatebyid(this.f.cateid.value).subscribe( res => {
        this.subcategoryes = res;
      });
    }
    this.subcategoryes = [];
    this.f.subcateid.setValue('');
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
      var model = {phone:this.f.phone.value,gender:this.f.gender.value,
        timetype: this.f.timetype.value,region:this.f.zone.value,
        zone:this.f.zone.value,city:this.f.city.value,page:this.page++,
      };
      this.reportService.userreport(model).subscribe( async res =>{
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
    var model = {phone:this.f.phone.value,gender:this.f.gender.value,
        timetype: this.f.timetype.value,region:this.f.zone.value,
        zone:this.f.zone.value,city:this.f.city.value,page:this.page++,
      };
   this.reportService.userreport(model).subscribe(res =>{
      this.data?.data?.push(...res?.data);
      if(res?.data?.length === 0 || res?.data?.length < 5 ){
          this.nomoreorder = true;
      }else{
          this.nomoreorder = false;
      }
   });
  }

  downloadUsersAsHtml(users: any[], type: number) {
  if (!users || users.length === 0) {
    alert("No users to download!");
    return;
  }

  const totalUsers = users.length;
  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace(/\//g, '/'); // Ensures format: 20/11/2025, 05:26:07 PM

  const infoLine = `Total Users: ${totalUsers} | Generated: ${generatedAt}`;

  // TYPE 1 → Only Phone Numbers (TXT)
  if (type === 1) {
    const phones = users
      .map(u => (u.phone || '').toString().trim().replace(/[^0-9]/g, ''))
      .filter(p => p.length >= 10 && p.length <= 15)
      .filter(Boolean);

    if (phones.length === 0) {
      alert("No valid phone numbers found!");
      return;
    }

    const content = phones.join(',');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phones_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // FULL HTML REPORT (with only the info line you asked for)
  const rows = users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${u.uid || ''}</td>
      <td>${u.name || ''}</td>
      <td>${u.phone || ''}</td>
      <td>${u.gender || ''}</td>
      <td>${u.role || ''}</td>
      <td>${u.status == 0 ? 'Active' : 'Inactive'}</td>
      <td>${u.tproduct || 0}</td>
      <td>${u.cdate ? new Date(u.cdate).toLocaleDateString() : ''}</td>
      <td>${u.adate ? new Date(u.adate).toLocaleDateString() : ''}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Users</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; background: #f9f9f9; }
    .info { text-align: center; margin-bottom: 20px; color: #444; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 14px; }
    th { background: #1d4ed8; color: white; }
    tr:nth-child(even) { background: #f8f9fc; }
  </style>
</head>
<body>
  <div class="info">${infoLine}</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>UID</th>
        <th>Name</th>
        <th>Phone</th>
        <th>Gender</th>
        <th>Role</th>
        <th>Status</th>
        <th>Products</th>
        <th>Joined</th>
        <th>Last Active</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users_${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

}
