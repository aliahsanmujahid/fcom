import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateproductComponent } from './components/createproduct/createproduct.component';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductComponent } from './components/product/product.component';
import { CategoryComponent } from './components/category/category.component';
import { UsermanageComponent } from './components/usermanage/usermanage.component';
import { CopunsComponent } from './components/copuns/copuns.component';
import { LoadingInterceptor } from './_interceptors/loading.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ReviewmanageComponent } from './components/reviewmanage/reviewmanage.component';
import { PagesComponent } from './components/pages/pages.component';
import { ErrorInterceptor } from './_interceptors/error.interceptor';
import { TimeagoModule } from "ngx-timeago";
import { FilesComponent } from './components/files/files.component';
import { ButtonComponent } from './components/components/button/button.component';
import { AuthcheckComponent } from './components/authcheck/authcheck.component';
import { AlertComponent } from './components/components/alert/alert.component';
import { SidebarComponent } from './components/components/sidebar/sidebar.component';
import { PopupComponent } from './components/components/popup/popup.component';
import { FailComponent } from './components/components/fail/fail.component';
import { NgxEditorModule } from "ngx-editor";
import { QuestionsComponent } from './components/questions/questions.component';
import { LoaderComponent } from './components/components/loader/loader.component';
import { SitemanageComponent } from './components/sitemanage/sitemanage.component';
import { SitecontentComponent } from './components/sitecontent/sitecontent.component';
import { OrderreportComponent } from './components/reports/orderreport/orderreport.component';
import { ManageorderComponent } from './components/manageorder/manageorder.component';
import { ReturnmanageComponent } from './components/returnmanage/returnmanage.component';
import { UserReportComponent } from './components/reports/userreport/userreport.component';
import { ProductViewReportComponent } from './components/reports/productview/productviewreport.component';
import { BasketComponent } from './components/basket/basket.component';
@NgModule({
  declarations: [
    AppComponent,
    CreateproductComponent,
    DashboardComponent,
    ProductComponent,
    CategoryComponent,
    UsermanageComponent,
    CopunsComponent,
    SitemanageComponent,
    ReviewmanageComponent,
    PopupComponent,
    PagesComponent,
    SitecontentComponent,
    FilesComponent,
    AlertComponent,
    ButtonComponent,
    AuthcheckComponent,
    ManageorderComponent,
    SidebarComponent,
    FailComponent,
    QuestionsComponent,
    LoaderComponent,
    OrderreportComponent,
    ProductViewReportComponent,
    UserReportComponent,
    ReturnmanageComponent,
    BasketComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    NgxSpinnerModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxSpinnerModule,
    TimeagoModule.forRoot(),
    ReactiveFormsModule,
    NgxEditorModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true},
    //{provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
