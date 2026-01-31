<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\SSLCommerz;
use DB;   

class PaymentController extends Controller
{
   
   public function paymentCreate(Request $request)
{

    $orderId = $request->input('orderid');

    $order = DB::table('orders')->where('id', $orderId)->first();
    if (!$order) {
        return response()->json(['msg' => 'Order not found.'], 404);
    }

    if ((int)$order->ispaid === 1) {
        return response()->json(['msg' => 'এই অর্ডারের পেমেন্ট ইতিমধ্যে সম্পন্ন হয়েছে'], 400);
    }

    $ps = DB::table('sitemanage')->first();
    if (!$ps || !$ps->paymentinfo) {
        return response()->json(['msg' => 'Payment settings not found'], 404);
    }

    [$store_id, $store_passwd] = explode('+', $ps->paymentinfo);


    $postData = [
        'store_id' => $store_id,
        'store_passwd' => $store_passwd,
        'total_amount' => $order->total,
        'currency' => 'BDT',
        'tran_id' => $order->uid, 

        'success_url' => url('/api/szstatus'),
        'fail_url' => url('/api/fail'),
        'cancel_url' => url('/api/cancel'),
        'ipn_url' => url('/api/szstatus'),

        'cus_name' => $order->name,
        'cus_add1' => $order->address,
        'cus_city' =>  $order->city,
        'cus_country' => "BANGLADESH",
        'shipping_method' => "---",
        'ship_name' => "---",
        'ship_add1' => "---",
        'ship_city' => "---",
        'ship_postcode' => "---",
        'ship_country' => "BANGLADESH",
        'cus_email' => "---",
        'cus_phone' => $order->phone,

        'product_name' => "---",
        'product_category' => "---",
        'product_profile' => "---",
    ];
    
    $url = filter_var(env('SSLCZ_LIVE'), FILTER_VALIDATE_BOOLEAN)
        ? env('SSLCZ_LIVE')
        : env('SSLCZ_SANDBOX');

        
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($postData),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);

    $response = curl_exec($ch);
    curl_close($ch);


    return response()->json(json_decode($response, true));
}


    public function szstatus(Request $request)
{
    $val_id = $request->input('val_id');
    $tran_id = $request->input('tran_id');
    $tran_date = $request->input('tran_date');

    $ps = DB::table('sitemanage')->first();
    if (!$ps || !$ps->paymentinfo) {
        return response()->json(['message' => 'Payment failed.'], 400);
    }

    [$store_id, $store_passwd] = explode('+', $ps->paymentinfo);

    $validateUrl = filter_var(env('IS_LIVE'), FILTER_VALIDATE_BOOLEAN)
        ? env('VALID_SSLCZ_LIVE')
        : env('VALID_SSLCZ_SANDBOX');
     
    $query = http_build_query([
        'val_id' => $val_id,
        'store_id' => $store_id,
        'store_passwd' => $store_passwd,
        'v' => '1',
        'format' => 'json',
    ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $validateUrl . '?' . $query,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($response, true);

    if (!isset($data['status']) || $data['status'] !== 'VALID') {
        return response()->json(['message' => 'Payment failed.'], 400);
    }

    DB::table('orders')->where('uid', $tran_id)->update([
        'ispaid' => 0,
        'pdate' => $tran_date
    ]);

    return response()->json(['message' => 'Payment Done.']);
}
    public function fail(Request $request)
    {
        return response()->json(['message' => 'Payment failed.']);
    }

    public function settxn(Request $request)
    {
      try {
        $id = $request->input('id');
        $txn = $request->input('txn');

        DB::table('orders')
            ->where('id', $id)
            ->update(['txn' => $txn]);

        return response()->json(['success' => true]);

      } catch (\Exception $e) {
        return response()->json([
              'message' => 'Some Error!',
              'error' => $e->getMessage()
            ], 500);
        }
    }
    public function txnconfirm(Request $request)
    {
        try {
        $id = $request->input('id');
        $txnc = $request->input('id');

        DB::table('orders')
            ->where('id', $id)
            ->update(['txnc' => $txnc]);

        return response()->json(['success' => true]);
        
      } catch (\Exception $e) {
        return response()->json([
              'message' => 'Some Error!',
              'error' => $e->getMessage()
            ], 500);
        }
    }

}
