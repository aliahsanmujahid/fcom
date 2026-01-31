<?php

namespace App\Http\Controllers;

use Firebase\JWT\JWT;
use DB;   
use Http;
use Illuminate\Support\Facades\File;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Facades\Image;

class HelperController extends Controller
{
   public static function jwtMake($user)
    {
        if (!$user || !isset($user->id)) return null;

        $payload = [
            'id' => $user->id,
            'uid' => $user->uid ?? null,
            'name' => $user->name ?? null,
            'image' => $user->image ?? null,
            'phone' => $user->phone ?? null,
            'gender' => $user->gender ?? null,
            'bodytype' => $user->bodytype ?? null,
            'dob' => $user->dob ?? null,
            'role' => $user->role ?? null,
            'iat' => time(),
        ];

        $jwtSecret = env('JWT_SECRET', 'supersecretkey123');

        try {
            return JWT::encode($payload, $jwtSecret, 'HS256');
        } catch (\Exception $e) {
            return null;
        }
    }

   public static function sendMsg($phone, $message)
    {
        try {
            // Fetch SMS API key from sitemanage table
            $ps = DB::select('SELECT * FROM sitemanage LIMIT 1');
            $smsKey = $ps[0]->smskey ?? null;

            if (!$smsKey) return false;

            // Prepare POST data
            $postData = [
                'token' => $smsKey,
                'to' => $phone,
                'message' => $message
            ];

            // Send POST request to GreenWeb API
            $response = Http::asForm()->post(env('SMS_API'), $postData);

            // Check if request was successful
            if ($response->status() == 200) {
                return true;
            }

            return false;

        } catch (\Exception $e) {
            return false;
        }
    } 



    public static function checkAndUpdateBasket($basket, $user = null)
{
    if (empty($basket['products'])) {
        return null;
    }

    $success = true;
    $message = '';

    foreach ($basket['products'] as $index => &$product) {

        $data = DB::table('products')
            ->where('ia', 1)
            ->where('id', $product['id'])
            ->first();

        if (!$data) {
            unset($basket['products'][$index]);
            $success = false;
            $message = '1/কিছু পণ্য পরিবর্তন হয়েছে।';
            continue;
        }

        if ($data->weight != $product['weight']) {
            unset($basket['products'][$index]);
            $success = false;
            $message = '1/কিছু পণ্য পরিবর্তন হয়েছে।';
            continue;
        }

        if (!empty($product['vari']['values'])) {
            $vid = $product['vari']['values'][0]['id'] ?? null;
            $varivalues = DB::table('varivalues')->where('id', $vid)->first();

            if ($varivalues) {

                if ($varivalues->sprice != $product['sprice']) {
                    unset($basket['products'][$index]);
                    $success = false;
                    $message = '1/কিছু পণ্য পরিবর্তন হয়েছে।';
                    continue;
                }

                if ($varivalues->quantity < (int)$product['quantity']) {
                    $newQty = $varivalues->quantity > 0 ? $varivalues->quantity : 0;
                    if ($newQty > 0) {
                        $product['quantity'] = $newQty;
                    } else {
                        unset($basket['products'][$index]);
                    }
                    $success = false;
                    $message = '1/কিছু পণ্য পরিবর্তন হয়েছে।';
                }
            }
        } else {
            if ($data->sprice != $product['sprice']) {
                unset($basket['products'][$index]);
                $success = false;
                $message = '1/কিছু পণ্য পরিবর্তন হয়েছে।';
                continue;
            }

            if ($data->quantity < (int)$product['quantity']) {
                $newQty = $data->quantity > 0 ? $data->quantity : 0;
                if ($newQty > 0) {
                    $product['quantity'] = $newQty;
                } else {
                    unset($basket['products'][$index]);
                }
                $success = false;
                $message = '1/কিছু পণ্য পরিবর্তন হয়েছে।';
            }
        }
    }

    // Reindex products
    $basket['products'] = array_values($basket['products']);
    if (empty($basket['products'])) {
        return null;
    }

    // Calculate totals
    $totalQty = 0;
    $subtotal = 0;
    $totalWeight = 0;

    foreach ($basket['products'] as $product) {
        $subtotal += $product['sprice'] * $product['quantity'];
        $totalQty += $product['quantity'];
        $totalWeight += $product['weight'] * $product['quantity'];
    }

    $delivery = DB::table('delivery')->first();
    $deliveryCharge = 0;

    if ($user) {
        $customerAddress = DB::table('address')->where('uid', $user->id)->first();
        $shopAddress = DB::table('address')->where('uid', $user->id)->first();

        if ($shopAddress && $customerAddress && $shopAddress->city == $customerAddress->city) {
            $deliveryCharge = $delivery->inside_city_charge ?? 0;
        } else {
            $deliveryCharge = $delivery->outside_city_charge ?? 0;
        }

        $basket['address'] = $customerAddress;
    }

    if ($totalWeight > 1) {
        $deliveryCharge += ($totalWeight - 1) * ($delivery->extra_per_kg ?? 0);
    }

    $basket['totalqty'] = $totalQty;
    $basket['subtotal'] = round($subtotal);
    $basket['delivery'] = round($deliveryCharge);
    $basket['total'] = round($subtotal + $deliveryCharge);

    return [
        'success' => $success,
        'message' => $message,
        'basket' => $basket
    ];
}
   

public static function insertProduct($product, $vari)
{
    try {
        // Insert product
        $productId = DB::table('products')->insertGetId($product);

        if (!empty($product['hasvari']) && $product['hasvari'] == 1) {
            // Insert vari
            $varidata = [
                'pid'  => $productId,
                'name' => $vari['name']
            ];
            $variId = DB::table('vari')->insertGetId($varidata);

            // Insert vari values
            foreach ($vari['values'] as $value) {
                $varivalues = [
                    'variid'   => $variId,
                    'pid'      => $productId,
                    'vname'    => $vari['name'],
                    'name'     => $value['name'],
                    'price'    => $value['price'],
                    'sprice'   => $value['sprice'],
                    'quantity' => $value['quantity'],
                    'sku'      => $value['sku']
                ];

                DB::table('varivalues')->insert($varivalues);
            }
        }

        return true;
    } catch (\Exception $e) {
        return false;
    }
}


public static function updateProduct($id, $product, $vari)
{
    try {
        $product['ia'] = 0;

        // Update product
        DB::table('products')->where('id', $id)->update($product);

        // Delete old vari and varivalues
        DB::table('vari')->where('pid', $id)->delete();
        DB::table('varivalues')->where('pid', $id)->delete();

        if (!empty($product['hasvari']) && $product['hasvari'] == 1) {
            // Insert new vari
            $varidata = [
                'pid' => $id,
                'name' => $vari['name']
            ];

            $variId = DB::table('vari')->insertGetId($varidata);

            // Insert vari values
            foreach ($vari['values'] as $value) {
                $varivalues = [
                    'variid'   => $variId,
                    'pid'      => $id,
                    'vname'    => $vari['name'],
                    'name'     => $value['name'],
                    'price'    => $value['price'],
                    'sprice'   => $value['sprice'],
                    'quantity' => $value['quantity'],
                    'sku'      => $value['sku']
                ];

                DB::table('varivalues')->insert($varivalues);
            }
        }

        return true;
    } catch (\Exception $e) {
        return false;
    }
}


public static function deleteProduct($uid)
{
    try {
        // Delete vari values and vari entries
        DB::table('varivalues')->where('pid', $uid)->delete();
        DB::table('vari')->where('pid', $uid)->delete();
        // Delete the product
        DB::table('products')->where('uid', $uid)->delete();
        return true;
    } catch (\Exception $e) {
        return false;
    }
}


}
