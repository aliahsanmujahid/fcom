import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AccountService } from 'src/app/_services/account.service';
import { SettingsService } from 'src/app/_services/settings.service';
import { environment } from 'src/environments/environment';
import {Clipboard} from '@angular/cdk/clipboard';
import { utlityService } from 'src/app/_services/utlity.service';
@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {
  files = [];
  constructor(public accountService: AccountService,private route: ActivatedRoute,
    private clipboard: Clipboard, private ngZone: NgZone,
    private router: Router,public utlityService: utlityService,private http: HttpClient,
   private settingsService:SettingsService) { }

  ngOnInit(){
    this.accountService.setCheckedUser();
    if(this.route.params){
      this.route.params.subscribe(params => {
        if(params && params['type']){
          this.type = params['type'];
          this.getimagefile();
        }
    })};
  }
  type = null;
  getimagefile(){
    this.settingsService.getimagefile(this.type).subscribe(data =>{
      this.files = data;
    });
  }
  deleteItem:any = null;
  deleteimage(item){
   this.deleteItem = item;
   this.utlityService.showalert('deleteimage');
  }
  deleteloading:boolean = false;
  deleteimagec(){
  this.utlityService.startscroll();
  this.deleteloading = true;
  this.settingsService.deleteimage({imagePath:this.deleteItem.img,
      data:this.deleteItem}).subscribe(res =>{ 
    console.log("deleteimage....", res);    
    if(res){
      this.files = this.files.filter(x => x.img !== this.deleteItem.img);
    };
    this.deleteloading = false;
    this.utlityService.hidealert();
    this.utlityService.notscroll();
  });
}
  copyTxt(txt) {
    this.clipboard.copy(txt);
    this.utlityService.show('1/Link Copied.');
  }
  imgloading = false;
  async onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  const files: File[] = Array.from(input.files);
  for (const file of files) {
    if (file.type.startsWith("image/")) {
      this.utlityService.startscroll();
      this.imgloading = true;
      try {
        const resized = await this.accountService.resizeImage(file, 1250, 1550, 0.7);
        const formData = new FormData();
        formData.append("image", resized);
        formData.append("type", this.type);
        this.settingsService.imageupload(formData).subscribe( res => {
          if (res?.data) {
            this.files.unshift(res.data);
          }
          this.imgloading = false;
          this.utlityService.notscroll();
        });
      } catch (err) {
        this.imgloading = false;
      }
    }
  }
  }


}
