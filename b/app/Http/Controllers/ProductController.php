<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use App\Http\Controllers\HelperController;


class ProductController extends Controller
{
    

     public function getOffers(Request $request)
{
    try {
        $page = $request->input('page', 1);
        $userPhone = $request->input('userphone', '');
        $numPerPage = 2;
        $skip = ($page - 1) * $numPerPage;

        $coupons = DB::table('coupons')
            ->orderByRaw("CASE phone WHEN ? THEN 0 ELSE 1 END, phone ASC", [$userPhone])
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json([
            ['coupons' => $coupons]
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}

public function loadMoreOffer(Request $request)
{
    try {
        $page = $request->input('page', 1);
        $numPerPage = 10;
        $skip = ($page - 1) * $numPerPage;

        $coupons = DB::table('coupons')
            ->orderBy('id', 'asc')
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json([
            ['coupons' => $coupons]
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function getProducts(Request $request)
{
    try {
        $type = $request->input('type', 1);
        $page = $request->input('page', 1);

        $perPage = 10;
        $offset = ($page - 1) * $perPage;

        $query = DB::table('products');

        if ($type == 1) {
            $query->where('ia', 1);
        } elseif ($type == 2) {
            $query->where('ia', 0);
        }

        $products = $query
            ->offset($offset)
            ->limit($perPage)
            ->get();

        if ($products->isEmpty()) {
            return response()->json([]);
        }

        $productIds = $products->pluck('id');

        $varis = DB::table('vari')
            ->whereIn('pid', $productIds)
            ->get()
            ->keyBy('pid');

        $variIds = $varis->pluck('id');

        $variValues = DB::table('varivalues')
            ->whereIn('variid', $variIds)
            ->get()
            ->groupBy('variid');

        foreach ($products as $product) {
            if (isset($varis[$product->id])) {
                $vari = $varis[$product->id];
                $product->vari = [
                    'id' => $vari->id,
                    'name' => $vari->name,
                    'values' => $variValues[$vari->id] ?? []
                ];
            }
        }

        return response()->json($products);

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}



public function productActiveInactive(Request $request)
{
    try {
        $status = $request->input('status');
        $id = $request->input('id');

        $affected = DB::table('products')
            ->where('id', $id)
            ->update(['ia' => $status]);

        if ($affected === 1) {
            return response()->json(['success' => true]);
        } else {
            return response()->json(['error' => 'Problem to set product'], 400);
        }
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function addRemoveFav(Request $request)
{
    try {
        $uid = $request->input('uid');
        $pid = $request->input('pid');
        $isFav = false;

        $data = DB::table('fav')->where('uid', $uid)->where('pid', $pid)->get();

        if ($data->count() > 0) {
            // Remove from favorites
            DB::table('fav')->where('uid', $uid)->where('pid', $pid)->delete();
            DB::table('products')->where('id', $pid)->decrement('tfav');
            $isFav = false;
        } else {
            // Add to favorites
            DB::table('fav')->insert(['uid' => $uid, 'pid' => $pid]);
            DB::table('products')->where('id', $pid)->increment('tfav');
            $isFav = true;
        }

        return response()->json(['success' => true, 'isfav' => $isFav]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function getAllProductsList(Request $request)
{
    try {
        $cateid = $request->input('cateid');
        $subcateid = $request->input('subcateid');

        $query = DB::table('products');

        if ($cateid && $subcateid) {
            $query->where('cateid', $cateid)->where('subcateid', $subcateid);
        } elseif ($cateid) {
            $query->where('cateid', $cateid);
        } elseif ($subcateid) {
            $query->where('subcateid', $subcateid);
        }

        $products = $query->get();

        // Attach vari and varivalues
        $productsWithVari = $products->map(function ($product) {
            $variData = DB::table('vari')->where('pid', $product->id)->first();
            if ($variData) {
                $variValues = DB::table('varivalues')->where('variid', $variData->id)->get();
                $product->vari = [
                    'id' => $variData->id,
                    'name' => $variData->name,
                    'values' => $variValues
                ];
            }
            return $product;
        });

        return response()->json($productsWithVari);
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}



public function getAllProducts(Request $request)
{
    try {
        $search = $request->input('search');
        $sortby = $request->input('sortby');
        $fav = $request->input('fav');
        $userid = $request->input('userid');
        $cateid = $request->input('cateid');
        $inmemory = $request->input('inmemory');
        $subcateid = $request->input('subcateid');
        $page = $request->input('page', 0);

        $numPerPage = 10;
        $skip = $page * $numPerPage;

        $sortOptions = [
            1 => 'id DESC',
            2 => 'tfav DESC',
            3 => 'sprice DESC',
            4 => 'avgrating DESC',
            5 => 'price DESC',
            6 => 'price ASC'
        ];

        $secondarySort = $sortOptions[$sortby] ?? 'id DESC';

        // If fetching favorite products
        if ($fav && $userid) {
            $favProducts = DB::table('fav')
                ->where('uid', $userid)
                ->orderByDesc('id')
                ->skip($skip)
                ->take($numPerPage)
                ->pluck('pid');

            $data = [];
            foreach ($favProducts as $pid) {
                $product = DB::table('products')
                    ->where('id', $pid)
                    ->where('ia', 1)
                    ->orderByRaw("tfav DESC, {$secondarySort}")
                    ->first();

                if ($product) $data[] = $product;
            }

            return response()->json($data);
        }

        // Normal product query
        $query = DB::table('products')
            ->where('ia', 1)
            ->where('quantity', '>', 0);

        if ($search && $search !== 'null') {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($cateid && $cateid !== 'null') {
            $query->where('cateid', $cateid);
        } elseif ($subcateid && $subcateid !== 'null') {
            $query->where('subcateid', $subcateid);
        }

        if ($inmemory && $inmemory !== 'null') {
            $query->orderByRaw("(CASE WHEN cateid = ? THEN 0 ELSE 1 END) ASC", [$inmemory]);
        }

        $query->orderByDesc('tfav')
              ->orderByRaw($secondarySort)
              ->skip($skip)
              ->take($numPerPage);

        $data = $query->get();

        return response()->json($data);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function getVari(Request $request)
{
    try {
        $id = $request->input('id');
        $variData = DB::table('vari')->where('pid', $id)->first();

        if ($variData) {
            $variValues = DB::table('varivalues')->where('variid', $variData->id)->get();

            $vari = [
                'id' => $variData->id,
                'name' => $variData->name,
                'values' => $variValues
            ];

            return response()->json($vari);
        }

        return response()->json(null);
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function getEditProduct(Request $request)
{
    try {
        $uid = $request->input('uid');

        $product = DB::table('products')->where('uid', $uid)->first();

        if ($product) {
            $variData = DB::table('vari')->where('pid', $product->id)->first();

            if ($variData) {
                $variValues = DB::table('varivalues')->where('variid', $variData->id)->get();

                $product->vari = [
                    'id' => $variData->id,
                    'name' => $variData->name,
                    'values' => $variValues
                ];
            }

            $product->main = 1;

            return response()->json($product);
        }

        return response()->json(null);
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function getSingleProduct(Request $request)
{
    try {
        $user = $request->user(); // auth user (nullable)
        $id   = $request->input('id');

        $product = DB::table('products')
            ->where('ia', 1)
            ->where('uid', $id)
            ->first();

        if (!$product) {
            return response()->json(null);
        }

        // Vari + values
        $vari = DB::table('vari')
            ->where('pid', $product->id)
            ->first();

        if ($vari) {
            $values = DB::table('varivalues')
                ->where('variid', $vari->id)
                ->get();

            $product->vari = [
                'id' => $vari->id,
                'name' => $vari->name,
                'values' => $values
            ];
        }

        // Favourite check
        $product->isfav = DB::table('fav')
            ->where('uid', $user->uid ?? 0)
            ->where('pid', $product->id)
            ->exists();

        // Questions
        $questions = DB::table('questions')
            ->where('pid', $product->id)
            ->where(function ($q) use ($user) {
                $q->where('answer', '!=', '')
                  ->orWhere(function ($q2) use ($user) {
                      if ($user?->uid) {
                          $q2->where('customerid', $user->uid);
                      }
                  });
            })
            ->orderByRaw('customerid = ? DESC', [$user->uid ?? 0])
            ->limit(4)
            ->get();

        $product->questions = $questions;

        // Reviews
        $reviews = DB::table('reviews')
            ->where('pid', $product->id)
            ->orderByRaw('customerid = ? DESC', [$user->uid ?? 0])
            ->limit(4)
            ->get();

        $product->reviews = $reviews;

        return response()->json($product);

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error'   => $e->getMessage()
        ], 500);
    }
}



public function getRelatedProducts(Request $request)
{
    try {
        $cateid = $request->input('cateid');
        $page = $request->input('page', 0);
        $numPerPage = 10;
        $skip = $page * $numPerPage;

        $products = DB::table('products')
            ->where('ia', 1)
            ->where('cateid', $cateid)
            ->orderBy('subcateid', 'asc')
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json($products);

    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function createUpdateProduct(Request $request)
{
    try {

        $data = $request->only([
            'id', 'uid', 'catename', 'subcatename', 'cateid', 'subcateid',
            'name', 'details', 'sku', 'price', 'sprice', 'quantity', 'weight',
            'file1', 'file2', 'file3', 'file4', 'vari', 'hasvari'
        ]);
        // Prepare product array
        $product = [
            'catename' => $data['catename'] ?? null,
            'subcatename' => $data['subcatename'] ?? null,
            'cateid' => $data['cateid'] ?? null,
            'subcateid' => $data['subcateid'] ?? null,
            'name' => $data['name'] ?? null,
            'details' => $data['details'] ?? null,
            'sku' => $data['sku'] ?? null,
            'price' => $data['price'] ?? 0,
            'sprice' => $data['sprice'] ?? 0,
            'quantity' => $data['quantity'] ?? 0,
            'weight' => $data['weight'] ?? 0,
            'file1' => $data['file1'] ?? null,
            'file2' => $data['file2'] ?? null,
            'file3' => $data['file3'] ?? null,
            'file4' => $data['file4'] ?? null,
            'hasvari' => $data['hasvari'] ?? 0,
        ];

        $vari = $data['vari'] ?? null;

        // Insert new product
        if (empty($data['id']) && empty($data['uid'])) {
            $product['uid'] = base_convert(time(), 10, 36); // uid like Node.js
            HelperController::insertProduct($product, $vari);
        } else {
            // Update existing product
            HelperController::updateProduct($data['id'], $product, $vari);
        }

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function deleteProduct(Request $request)
{
    try {
        $id = $request->input('id');
        $uid = $request->input('uid');

        // Call the helper function to delete the product
        HelperController::deleteProduct($uid);

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Process Fail'], 500);
    }
}


public function createEditAnswerQuestion(Request $request)
{
    try {
        $id = $request->input('id');
        $pid = $request->input('pid');
        $customerId = $request->input('customerid');
        $customerName = $request->input('customername');
        $questionText = $request->input('question');
        $answerText = $request->input('answer');

        $result = null;

        if ($id) {
            // Update existing question
            $updateData = [];
            if (!is_null($questionText)) $updateData['question'] = $questionText;
            if (!is_null($answerText)) $updateData['answer'] = $answerText;

            DB::table('questions')->where('id', $id)->update($updateData);

            $result = DB::table('questions')->where('id', $id)->first();
        } else {
            // Insert new question
            $insertData = [
                'pid' => $pid,
                'customerid' => $customerId,
                'customername' => $customerName,
                'question' => $questionText,
                'answer' => $answerText
            ];

            $insertId = DB::table('questions')->insertGetId($insertData);
            $result = DB::table('questions')->where('id', $insertId)->first();
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Process Fail'], 500);
    }
}


public function getAllProductQuestion(Request $request)
{
    try {
        $pid = $request->input('pid');
        $page = $request->input('page', 1);

        $numPerPage = 10;
        $skip = ($page - 1) * $numPerPage;

        $questions = DB::table('questions')
            ->where('pid', $pid)
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json($questions);

    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Process Fail'], 500);
    }
}



public function getProductQuestions(Request $request)
{
    try {
        $uid = $request->input('uid', 0);
        $pid = $request->input('pid');
        $page = $request->input('page', 1);

        $numPerPage = 3;
        $skip = ($page - 1) * $numPerPage;

        $questions = DB::table('questions')
            ->where('pid', $pid)
            ->where(function ($query) use ($uid) {
                $query->where('answer', '!=', '')
                      ->orWhere('customerid', $uid);
            })
            ->orderByRaw('(customerid = ?) DESC', [$uid])
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json($questions);

    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Process Fail'], 500);
    }
}



public function getManageQuestions(Request $request)
{
    try {
        $page = $request->input('page', 1);
        $status = $request->input('status', 0);
        $search = $request->input('search');

        $numPerPage = 10;
        $skip = ($page - 1) * $numPerPage;

        // Determine condition based on status
        $condition = ($status == 1)
            ? "COALESCE(answer, '') = ''"
            : "COALESCE(answer, '') != ''";

        // Base query
        $query = DB::table('questions')
            ->whereRaw($condition);

        // Search filter
        if ($search) {
            $user = DB::table('users')
                ->where('phone', $search)
                ->orWhere('uid', $search)
                ->first();

            $userId = $user->id ?? 0;

            $query->where(function ($q) use ($search, $userId) {
                $q->where('puid', $search)
                  ->orWhere('customerid', $userId);
            });
        }

        // Pagination
        $questions = $query->skip($skip)
                           ->take($numPerPage)
                           ->get();

        $data = [];

        foreach ($questions as $q) {
            $customer = DB::table('users')->where('id', $q->customerid)->first();
            $product = DB::table('products')->where('id', $q->pid)->first();

            $data[] = array_merge((array) $q, [
                'customer' => $customer,
                'product' => $product
            ]);
        }

        return response()->json($data);

    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function getManageBasket(Request $request)
{
    try {
        $page = $request->input('page', 1);
        $search = $request->input('search', null);

        $numPerPage = 10;
        $skip = ($page - 1) * $numPerPage;

        // Fetch baskets with pagination
        $baskets = DB::table('cart')
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        $data = [];

        foreach ($baskets as $basket) {
            $customer = DB::table('users')->where('id', $basket->uid)->first();

            $items = json_decode($basket->items, true) ?? [];

            $data[] = array_merge(
                ['id' => $basket->id],
                $items,
                ['customer' => $customer]
            );
        }

        // Apply search filter if needed
        if ($search) {
            $user = DB::table('users')
                ->where('phone', $search)
                ->orWhere('uid', $search)
                ->first();

            $result = [];

            if ($user) {
                foreach ($data as $b) {
                    if (($b['customer']->id ?? 0) == $user->id) {
                        $result[] = $b;
                        break; // only first match as in Node.js
                    }
                }
            }

            return response()->json($result);
        }

        return response()->json($data);

    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function updateViews(Request $request)
{
    try {
        $visitorId = $request->input('visitorid');
        $pid = $request->input('pid');
        $user = $request->input('user');

        $uid = null;
        if (!in_array($user['role'] ?? '', ['admin', 'modaretor'])) {
            $uid = $user['id'] ?? null;
        }

        if ($pid) {
            // Check if view already exists
            $existing = DB::table('views')
                ->where('pid', $pid)
                ->where(function ($q) use ($uid, $visitorId) {
                    $q->where('uid', $uid)
                      ->orWhere('visitorid', $visitorId);
                })
                ->first();

            if ($existing) {
                // Update existing view
                DB::table('views')
                    ->where('pid', $pid)
                    ->where(function ($q) use ($uid, $visitorId) {
                        $q->where('uid', $uid)
                          ->orWhere('visitorid', $visitorId);
                    })
                    ->update([
                        'visitorid' => $visitorId,
                        'uid' => $uid,
                        'date' => now()
                    ]);
            } else {
                // Insert new view
                DB::table('views')->insert([
                    'pid' => $pid,
                    'uid' => $uid,
                    'visitorid' => $visitorId,
                    'date' => now()
                ]);
            }
        }

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function loadMoreQuestions(Request $request)
{
    try {
        $productId = $request->input('productid');
        $page = $request->input('page', 1);
        $type = $request->input('type', 1);

        $numPerPage = 5;
        $skip = ($page - 1) * $numPerPage;

        $condition = $type == 1 ? "q.answer != ''" : "q.answer = ''";

        $questions = DB::table('questions as q')
            ->join('users as u', 'u.id', '=', 'q.customerid')
            ->select(
                'q.id as qid',
                'q.question',
                'q.answer',
                'u.id as uid',
                'u.name as customer_name',
                'u.phone as customer_phone'
            )
            ->where('q.pid', $productId)
            ->whereRaw($condition)
            ->orderByDesc('q.id')
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json($questions);

    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}









}
