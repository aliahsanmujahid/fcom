import {  NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/components/navbar/navbar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';
import { ProductviewComponent } from './components/productview/productview.component';
import { ProfileComponent } from './components/profile/profile.component';
import { OrdersComponent } from './components/orders/orders.component';
import { CartComponent } from './components/cart/cart.component';
import { ShopComponent } from './components/shop/shop.component';
import { FooterComponent } from './components/components/footer/footer.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PagesComponent } from './components/pages/pages.component';
import { ButtonComponent } from './components/components/button/button.component';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './components/auth/auth.component';
import { AlertComponent } from './components/components/alert/alert.component';
import { ReviewsComponent } from './components/components/reviews/reviews.component';
import { OffersComponent } from './components/offers/offers.component';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ProductviewComponent,
    AuthComponent,
    ProfileComponent,
    OrdersComponent,
    CartComponent,
    ShopComponent,
    FooterComponent,
    PagesComponent,
    ButtonComponent,
    AlertComponent,
    ReviewsComponent,
    OffersComponent
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule,
    InfiniteScrollModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
