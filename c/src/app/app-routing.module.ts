import { ShopComponent } from './components/shop/shop.component';
import { CartComponent } from './components/cart/cart.component';
import { ProductviewComponent } from './components/productview/productview.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './components/pages/pages.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthComponent } from './components/auth/auth.component';
import { OrdersComponent } from './components/orders/orders.component';
import { OffersComponent } from './components/offers/offers.component';

const routes: Routes = [
  {path: '',  component: PagesComponent},
  {path: 'login',  component: AuthComponent},
  {path: 'shop',  component: ShopComponent},
  {path: 'cart',  component: CartComponent},
  {path: 'pages/:name',  component: PagesComponent},
  {path: 'product/:id',  component: ProductviewComponent},
  {path: 'orders',  component: OrdersComponent,},
  {path: 'profile',  component: ProfileComponent,},
  {path: 'offers',  component: OffersComponent},   
  {path: '**', component: ShopComponent, pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
