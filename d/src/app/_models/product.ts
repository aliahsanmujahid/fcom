import { User } from "./user";
export interface IProduct {
  id: number,
  uid: number,
  cateid:number,
  subcateid:number,
  name:string,
  details:string,
  catename:string,
  subcatename:string,
  hasvari:number,
  price:number,
  sprice:number,
  weight:number,
  quantity:number,
  sku:string,
  file1:string,
  file2:string,
  file3:string,
  file4:string,
  vari : Ivari
}

export interface Ivari {
  name:string;
  values:Ivalues[]
}
export interface Ivalues {
    name:string;
    price: number;
    quantity: number;
    sku: string;
}

export interface Product {
  id: number;
  uid: string;
  cateid:number;
  subcateid:number;
  tr:number;
  ia:number;
  approve:number;
  tfav:number;
  rating:number;
  name:string,
  details:string,
  catename:string;
  subcatename:string;

  hasvari:number,

  price:number,
  sprice:number,
  quantity:number,
  sku:string,
  isp:string,

  file1:string,
  file2:string,
  file3:string,
  file4:string,
  vari : Vari,
  date:Date,
}
export interface Vari {
  id:number;
  name:string;
  values:Values[]
}
export interface Values {
    id:number;
    name:string;
    price: number;
    sprice: number;
    quantity: number;
    sku: string;
}
export interface Questions {
    id:number;
    pid: number;
    customerid: number;
    question:string;
    answer: string;
    cdate:Date,
    adate:Date,
    customer:User,
    product:Product
}