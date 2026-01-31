import { User } from "./user";

export interface Order {
  id: number;
  uid: string;
  name: string;
  phone: string;
  uname: string;
  customerid:string;
  uphone: string;
  address: string;
  reason: string;
  state: string;
  status: string;
  zip:string;

  shiptitle:string;
  shiping:number;
  shipingid:number;
  cashondelevary:number;
  delivery:number;
  cvalue:number;
  ctitle:string;
  subtotal:number;
  region:string;
  city:string;
  zone:number;
  total:number,
  date:Date,
  cod:number,
  tnx:string,
  ispaid:number,
  approve:number,

  coupontitle:string;
  coupon:number;
  couponid:number;
  customer:User,
  txnc:number,
  orderitems:IOrderItem[]
}

export interface IOrderItem {
  id: number;
  uid: number;
  name: string;
  img: string;
  price: number;
  sprice: number;
  quantity: number;
  totalprice: number;
  isr: number;
  returned: number;
  returntxt: string;
  sku:string,
  vari:string,
  vname:string,
  vsku:string,
}

export interface OrderItem {
  id: number;
  name: string;
  img: string;
  price: number;
  quantity: number;

  sku:string,
  vari : Vari,
}

export interface Vari {
  id: number,
  name:string;
  values:Values[]
}
export interface Values {
    id: number,
    name:string;
    quantity: number;
    price: number;
    sku: string;
}
