import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateproductComponent } from './components/createproduct/createproduct.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './components/product/product.component';
import { ReviewmanageComponent } from './components/reviewmanage/reviewmanage.component';
import { CopunsComponent } from './components/copuns/copuns.component';
import { UsermanageComponent } from './components/usermanage/usermanage.component';
import { SitecontentComponent } from './components/sitecontent/sitecontent.component';
import { CategoryComponent } from './components/category/category.component';
import { PagesComponent } from './components/pages/pages.component';
import { FilesComponent } from './components/files/files.component';
import { AuthcheckComponent } from './components/authcheck/authcheck.component';
import { QuestionsComponent } from './components/questions/questions.component';
import { SitemanageComponent } from './components/sitemanage/sitemanage.component';
import { OrderreportComponent } from './components/reports/orderreport/orderreport.component';
import { ManageorderComponent } from './components/manageorder/manageorder.component';
import { ReturnmanageComponent } from './components/returnmanage/returnmanage.component';
import { UserReportComponent } from './components/reports/userreport/userreport.component';
import { ProductViewReportComponent } from './components/reports/productview/productviewreport.component';
import { BasketComponent } from './components/basket/basket.component';
import { AllGuard } from './_guards/all.guard';
const routes: Routes = [
  {path: '',  component: DashboardComponent,canActivate: [AllGuard],data: { roles: ['admin', 'moderator', 'admin'] }},
  {path: 'dash',  component: DashboardComponent,canActivate: [AllGuard],data: { roles: ['admin', 'moderator', 'admin'] }},
  {path: 'createproduct',  component: CreateproductComponent,canActivate: [AllGuard],data: { roles: [ 'admin', 'moderator', 'admin' ] }},
  {path: 'product',  component: ProductComponent,canActivate: [AllGuard], data: { roles: [ 'admin'] }},
  {path: 'category',  component: CategoryComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator'] }},
  {path: 'reviewmanage',  component: ReviewmanageComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator', 'admin'] }},
  {path: 'sitecontent',  component: SitecontentComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator'] }},
  {path: 'sitemanage',  component: SitemanageComponent,canActivate: [AllGuard], data: { roles: ['admin'] }},
  {path: 'couponmanage',  component: CopunsComponent,canActivate: [AllGuard], data: { roles: [ 'admin'] }},
  {path: 'usermanage',  component: UsermanageComponent,canActivate: [AllGuard], data: { roles: ['admin'] }},
  {path: 'pages',  component: PagesComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator'] }},
  {path: 'orderreport',  component: OrderreportComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator'] }},
  {path: 'userreport',  component: UserReportComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator'] }},
  {path: 'productviewreport',  component: ProductViewReportComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator'] }},
  {path: 'files',  component: FilesComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator', 'admin'] }},
  {path: 'ordermanage',  component: ManageorderComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator'] }},
  {path: 'return',  component: ReturnmanageComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator', 'admin'] }},
  {path: 'question',  component: QuestionsComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator', 'admin'] }},
  {path: 'basket',  component: BasketComponent,canActivate: [AllGuard], data: { roles: ['admin', 'moderator'] }},
  {path: 'auth',  component: AuthcheckComponent}, 
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
