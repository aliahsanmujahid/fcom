<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use DB;   
use App\Http\Controllers\HelperController;

class OrderController extends Controller
{
    public function orderReturn(Request $request)
{
    try {
        $id = $request->input('id');
        $returntxt = $request->input('returntxt');

        $affected = DB::table('orderitems')
            ->where('id', $id)
            ->update([
                'returned' => 1,
                'returntxt' => $returntxt
            ]);

        if ($affected === 1) {
            return response()->json(['success' => true]);
        }

        return response()->json(['message' => 'Problem to set order'], 400);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Problem to set order',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function setAllOrderStatus(Request $request)
{
    try {
        $allIds = $request->input('allids', []);
        $status = $request->input('status');

        if (!empty($allIds)) {
            foreach ($allIds as $uid) {
                DB::table('orders')
                    ->where('uid', $uid)
                    ->update(['status' => $status]);
            }
        }

        return response()->json(['success' => true]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Problem to set order.',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function sendAllToDelivery(Request $request)
{
    try {
        $request->validate([
            'allids' => 'required|array|min:1',
            'allids.*' => 'string',
        ]);

        $allIds = $request->input('allids', []);
      
        $ps = DB::table('sitemanage')->first();
        
        if (!$ps || !$ps->steadfast) {
          return response()->json(['msg' => 'steadfast settings not found'], 404);
        }

        [$api_key, $secret_key] = explode('+', $ps->steadfast);

        $orders = DB::table('orders')->whereIn('uid', $allIds)->get();

        foreach ($orders as $order) {
            $cod_amount = 0;
            if($order->ispaid == 1){
              $cod_amount = 0;
            }else{
              $cod_amount = $order->total;
            }
            $payload = [
               'invoice' => $order->uid,
               'recipient_name' => $order->name,
               'recipient_phone' => $order->phone,
               'recipient_address' => $order->address,
               'cod_amount' => $cod_amount,
            ];

            $response = Http::withHeaders([
                'Api-Key' => $api_key,
                'Secret-Key' => $secret_key,
                'Content-Type' => 'application/json',
            ])->post(env('STEADFAST_API') . '/create_order', $payload);
        }
        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Problem to set order.',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function orderCancel(Request $request)
{
    try {
        $orderId = $request->input('id');
        $status = $request->input('status');

        $order = DB::table('orders')->where('id', $orderId)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->status === 'delivering') {
            return response()->json(['success' => false, 'message' => "2/Order can't cancel."]);
        }

        // Update order and orderitems
        DB::table('orders')
            ->where('id', $orderId)
            ->update([
                'qtyreduced' => 0,
                'status' => $status
            ]);

        DB::table('orderitems')
            ->where('orderid', $orderId)
            ->update(['qtyreduced' => 0]);

        // Get order items
        $orderItems = DB::table('orderitems')->where('orderid', $orderId)->get();

        foreach ($orderItems as $item) {
            // Restore product quantity
            DB::table('products')
                ->where('id', $item->pid)
                ->increment('quantity', $item->quantity);

            // Restore variant quantity if exists
            if (!empty($item->vari)) {
                DB::table('varivalues')
                    ->where('name', $item->vari)
                    ->where('pid', $item->pid)
                    ->increment('quantity', $item->quantity);
            }
        }

        return response()->json(['success' => true]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function changeStatus(Request $request)
{
    try {
        $id = $request->input('id');
        $status = $request->input('status');

        $order = DB::table('orders')->where('id', $id)->first();
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found'], 404);
        }

        $orderItems = DB::table('orderitems')->where('orderid', $order->id)->get();

        $notReduce = ['approved', 'inreview', 'delivering', 'confirmed'];

        if (!in_array($status, $notReduce)) {
            // Revert product quantities if qtyreduced = 1
            foreach ($orderItems as $item) {
                if ($item->qtyreduced == 1) {
                    DB::table('products')
                        ->where('id', $item->pid)
                        ->increment('quantity', $item->quantity);

                    if (!empty($item->vari)) {
                        DB::table('varivalues')
                            ->where('name', $item->vari)
                            ->where('pid', $item->pid)
                            ->increment('quantity', $item->quantity);
                    }
                }

                DB::table('orderitems')
                    ->where('id', $item->id)
                    ->update(['qtyreduced' => 0]);
            }

            DB::table('orders')->where('id', $id)->update(['qtyreduced' => 0]);
        }

        if (in_array($status, $notReduce)) {
            // Reduce product quantities if qtyreduced != 1
            foreach ($orderItems as $item) {
                if ($item->qtyreduced != 1) {
                    DB::table('products')
                        ->where('id', $item->pid)
                        ->decrement('quantity', $item->quantity);

                    if (!empty($item->vari)) {
                        DB::table('varivalues')
                            ->where('name', $item->vari)
                            ->where('pid', $item->pid)
                            ->decrement('quantity', $item->quantity);
                    }
                }

                DB::table('orderitems')
                    ->where('id', $item->id)
                    ->update(['qtyreduced' => 1]);
            }

            DB::table('orders')->where('id', $id)->update(['qtyreduced' => 1]);
        }

        // Finally, update order status
        DB::table('orders')->where('id', $id)->update(['status' => $status]);

        return response()->json(['success' => true]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}



public function getCustomerOrders(Request $request)
{
    try {
        $page = $request->input('page');
        $user = $request->user ?? null;
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $numPerPage = 5;
        $skip = $page * $numPerPage;

        $orders = DB::table('orders')
            ->where('customerid', $user->id)
            ->orderByDesc('id')
            ->offset($skip)
            ->limit($numPerPage)
            ->get();

        $data = [];

        foreach ($orders as $order) {
            $orderItems = DB::table('orderitems')
                ->where('orderid', $order->id)
                ->get();

            $orderArray = (array) $order;
            $orderArray['orderitems'] = $orderItems;
            $data[] = $orderArray;
        }

        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}



public function getOrders(Request $request)
{
    try {
        $page = $request->input('page', 1);
        $status = $request->input('status', 'all');
        $search = $request->input('search', null);
        $numPerPage = 10;
        $skip = ($page - 1) * $numPerPage;

        $query = DB::table('orders');
        
        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Search by phone, uid, or customerid
        if ($search) {
            $user = DB::table('users')
                ->where('phone', $search)
                ->orWhere('uid', $search)
                ->first();

            $query->where(function($q) use ($search, $user) {
                $q->where('phone', $search)
                  ->orWhere('uid', $search)
                  ->orWhere('customerid', $user->id ?? 0);
            });
        }

        // Apply pagination
        $orders = $query->orderByDesc('id')
                        ->offset($skip)
                        ->limit($numPerPage)
                        ->get();

        $data = [];

        foreach ($orders as $order) {
            $customer = DB::table('users')->where('id', $order->customerid)->first();
            $orderItems = DB::table('orderitems')->where('orderid', $order->id)->get();

            $orderArray = (array) $order;
            $orderArray['customer'] = $customer;
            $orderArray['orderitems'] = $orderItems;

            $data[] = $orderArray;
        }

        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}



public function basketCheckSet(Request $request)
    {
        try {
            $basket = $request->input('basket');

            $user = $request->user ?? null;

            // Call the helper function in the same controller
            $result = HelperController::checkAndUpdateBasket($basket, $user);

            $uid = $user->id ?? null;
            $visitorId = $basket['visitorid'] ?? null;

            if (!$visitorId && !$uid) {
                return response()->json(null);
            }

            $filterField = $uid ? 'uid' : 'visitorid';
            $filterValue = $uid ? $uid : $visitorId;

            $hasCart = DB::table('cart')->where($filterField, $filterValue)->first();

            if ($hasCart && !empty($result['basket'])) {
                $updateData = [
                    'uid' => $uid,
                    'visitorid' => $visitorId,
                    'items' => json_encode($result['basket'])
                ];
                DB::table('cart')->where($filterField, $filterValue)->update($updateData);
            } elseif (!$hasCart && !empty($result['basket'])) {
                $insertData = [
                    'uid' => $uid,
                    'visitorid' => $visitorId,
                    'items' => json_encode($result['basket'])
                ];
                DB::table('cart')->insert($insertData);
            }

            if (empty($result['basket'])) {
                DB::table('cart')->where($filterField, $filterValue)->delete();
            }

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Some Error!', 'error' => $e->getMessage()], 500);
        }
    }


    public function deleteCart(Request $request)
    {
        try {
            $id = $request->input('id');

            if ($id) {
                DB::table('cart')->where('id', $id)->delete();

                return response()->json(true);
            }

            return response()->json(false);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Some Error!'], 500);
        }
    }


    public function getBasket(Request $request)
    {
        try {
            $visitorId = $request->input('visitorid');
            $user = $request->user ?? null;
            $uid = $user ? $user->id : null;

            if (!$visitorId && !$uid) {
                return response()->json(null);
            }

            $filterField = $uid ? 'uid' : 'visitorid';
            $filterValue = $uid ?? $visitorId;

            $cart = DB::table('cart')->where($filterField, $filterValue)->first();

            if ($cart) {
                $basket = json_decode($cart->items, true);

                // Call the helper function to process basket
                $result = HelperController::checkAndUpdateBasket($basket, $user);

                return response()->json($result);
            }

            return response()->json(null);
        } catch (\Exception $e) {
            return response()->json([
              'message' => 'Some Error!',
              'error' => $e->getMessage()
            ], 500);
        }
    }





    public function createOrder(Request $request)
    {
        try {
            $basket = $request->input('basket');
            
            $user = $request->user;
           
            // Check and update basket
            $result = HelperController::checkAndUpdateBasket($basket, $user);
           

            if (!$result || !($result['success'] ?? false)) {
                return response()->json($result);
            }

            /* ======================
               CREATE ORDER
            ====================== */
            $orderUID = base_convert(time(), 10, 36); // JS: (new Date().getTime()).toString(36)

            $orderData = [
                'uid'          => $orderUID,
                'name'         => $basket['address']['name'],
                'phone'        => $basket['address']['phone'],
                'address'      => $basket['address']['address'],
                'region'       => $basket['address']['region'],
                'city'         => $basket['address']['city'],
                'zone'         => $basket['address']['zone'],
                'customerid'   => $user->id,
                'customeruid'  => $user->uid,
                'subtotal'     => $basket['subtotal'],
                'delivery'     => $basket['delivery'],
                'total'        => $basket['total'],
            ];

            // Insert order and get ID
            $orderId = DB::table('orders')->insertGetId($orderData);

            /* ======================
               ORDER ITEMS
            ====================== */
            foreach ($basket['products'] as $product) {
                $orderItemData = [
                    'pid'        => $product['id'],
                    'puid'       => $product['puid'],
                    'sku'        => $product['sku'],
                    'orderid'    => $orderId,
                    'isr'        => 0,
                    'name'       => $product['name'],
                    'vari'       => $product['vari']['name'] ?? null,
                    'vname'      => $product['vari']['values'][0]['name'] ?? null,
                    'vsku'       => $product['vari']['values'][0]['sku'] ?? null,
                    'price'      => $product['price'],
                    'sprice'     => $product['sprice'],
                    'quantity'   => $product['quantity'],
                    'totalprice' => $product['sprice'] * $product['quantity'],
                    'qtyreduced' => 1,
                ];

                // Check if file exists
                $file = DB::table('files')->where('img', $product['img'] ?? '')->first();
                if ($file) {
                    $orderItemData['img'] = $file->orderimg;
                }

                DB::table('orderitems')->insert($orderItemData);
            }

            return response()->json([
                'success' => true,
                'orderid' => $orderId,
            ]);

        } catch (\Exception $e) {
            return response()->json([
              'message' => 'Some Error!',
              'error' => $e->getMessage()
            ], 500);
        }
    }



    public function manageOrderItemsReturn(Request $request)
{
    try {
        $id = $request->input('id');
        $todo = $request->input('todo');

        DB::table('orderitems')
            ->where('orderid', $id)
            ->update(['returned' => $todo]);

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}




public function getOrderForReturnManage(Request $request)
{
    try {
        $page = $request->input('page', 1);
        $search = $request->input('search', null);
        $numPerPage = 10;
        $skip = ($page - 1) * $numPerPage;

        $params = [];
        $query = DB::table('orders as o')
            ->distinct()
            ->join('orderitems as oi', 'o.id', '=', 'oi.orderid')
            ->where('oi.returned', 1)
            ->where('o.status', 'pending')
            ->orderByDesc('o.date');

        if ($search) {
            $user = DB::table('users')
                ->where('phone', $search)
                ->orWhere('uid', $search)
                ->first();

            $query->where(function ($q) use ($search, $user) {
                $q->where('o.phone', $search)
                  ->orWhere('o.uid', $search)
                  ->orWhere('o.customerid', $user->id ?? 0);
            });
        }

        $orders = $query->skip($skip)->take($numPerPage)->get();

        $data = [];
        foreach ($orders as $order) {
            $customer = DB::table('users')->where('id', $order->customerid)->first();
            $orderItems = DB::table('orderitems')->where('orderid', $order->id)->get();

            $data[] = [
                'order' => $order,
                'customer' => $customer,
                'orderitems' => $orderItems
            ];
        }

        return response()->json($data);
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}







}
