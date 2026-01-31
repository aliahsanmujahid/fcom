<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;

class SettingController extends Controller
{
    public function createCoupon(Request $request)
    {
        try {

            $user = $request->user ?? null;

            // Get input from request
            $phone = $request->input('phone');
            $ulimit = $request->input('ulimit');
            $code = strtolower($request->input('code', ''));
            $value = $request->input('value');
            $minp = $request->input('minp');
            $minc = $request->input('minc');
            $time = $request->input('time');

            // Prepare data array
            $data = [
                'phone' => $phone,
                'code' => $code,
                'value' => $value,
                'minp' => $minp,
                'minc' => $minc,
                'time' => $time,
                'ulimit' => $ulimit
            ];

            // Insert into coupons table
            $insertId = DB::table('coupons')->insertGetId($data);

            // Fetch the inserted coupon
            $result = DB::select('SELECT * FROM coupons WHERE id = ?', [$insertId]);
            
            $result[0]->user = $user;
            
            return response()->json($result[0]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Some Error!',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function updateCoupon(Request $request)
{
    try {
        $id = $request->id;
        $data = [
            'phone' => $request->phone,
            'code' => strtolower($request->code),
            'value' => $request->value,
            'minp' => $request->minp,
            'minc' => $request->minc,
            'time' => $request->time,
            'ulimit' => $request->ulimit,
        ];

        DB::table('coupons')->where('id', $id)->update($data);

        $coupon = DB::table('coupons')->where('id', $id)->first();

        return response()->json($coupon);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function getAllCoupons(Request $request)
{
    try {
        $page = $request->page ?? 1;
        $phone = $request->phone;
        $stype = $request->stype;

        $numPerPage = 10;
        $skip = ($page - 1) * $numPerPage;

        $query = DB::table('coupons as c')
            ->leftJoin('users as u', 'u.phone', '=', 'c.phone')
            ->select(
                'c.id as coupon_id',
                'c.phone as coupon_phone',
                'c.code',
                'c.value',
                'c.minp',
                'c.minc',
                'c.ulimit',
                'c.time',
                'u.id as userid',
                'u.phone as userphone',
                'u.name as username',
                'u.image as userimage',
                'u.role as userrole'
            );

        if ($phone) {
            $query->where('c.phone', $phone);
        }

        if ($stype === 'exp') {
            $query->where('c.time', '<', DB::raw('NOW()'));
        } elseif ($stype === 'act') {
            $query->where('c.time', '>=', DB::raw('NOW()'));
        }

        $coupons = $query->orderByDesc('c.id')
                         ->offset($skip)
                         ->limit($numPerPage)
                         ->get();

        return response()->json($coupons);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function deleteCoupon(Request $request)
{
    try {
        $id = $request->id;
        $code = $request->code ?? '';

        DB::table('coupons')->where('id', $id)->delete();

        return response()->json([
            'id' => $id,
            'message' => '1/' . $code . ' Coupon Deleted'
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}

public function updateCron(Request $request)
{
    try {
        DB::table('cron')->where('id', 1)->increment('visited');

        return response()->json(true);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Some Error!',
            'error'   => $e->getMessage()
        ], 500);
    }
}


public function createUpdateSiteContent(Request $request)
{
    try {
        $id = $request->id;
        $data = [
            'scripts'   => $request->scripts,
            'facebook'  => $request->facebook,
            'instagram' => $request->instagram,
            'tiktok'    => $request->tiktok,
            'youtube'   => $request->youtube,
            'logo'      => $request->logo,
            'favicon'   => $request->favicon,
        ];

        if ($id) {
            DB::table('sitecontent')->where('id', $id)->update($data);
            $result = DB::table('sitecontent')->where('id', $id)->first();
        } else {
            $insertId = DB::table('sitecontent')->insertGetId($data);
            $result = DB::table('sitecontent')->where('id', $insertId)->first();
        }

        return response()->json($result);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function getSiteManage(Request $request)
{
    try {
        $data = DB::table('sitemanage')->first(); // Get the first row
        return response()->json($data);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function createUpdateDelivery(Request $request)
{
    try {
        $id = $request->input('id');
        $data = [
            'inside_city_charge' => $request->input('inside_city_charge'),
            'outside_city_charge' => $request->input('outside_city_charge'),
            'extra_per_kg' => $request->input('extra_per_kg'),
        ];

        if (!$id) {
            // Delete all existing delivery records
            DB::table('delivery')->delete();
            // Insert new delivery record
            DB::table('delivery')->insert($data);
        } else {
            // Update existing delivery record
            DB::table('delivery')->where('id', $id)->update($data);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data updated.'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Some Error!'
        ], 500);
    }
}


public function getDelivery()
{
    try {
        $result = DB::table('delivery')->first(); // gets the first row
        return response()->json($result);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Some Error!'
        ], 500);
    }
}

public function createPage(Request $request)
{
    try {
        $id = $request->input('id');
        $name = $request->input('name');
        $c = $request->input('c');

        $page = DB::table('pages')->where('id', $id)->first();
        $data = ['name' => $name, 'c' => $c];

        if ($page) {
            DB::table('pages')->where('id', $id)->update($data);
        } else {
            DB::table('pages')->insert($data);
        }

        return response()->json(['success' => true, 'message' => '1/Data Updated.']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}


public function getPages()
{
    try {
        $pages = DB::table('pages')->get();
        return response()->json($pages);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}


public function deletePage(Request $request)
{
    try {
        $id = $request->input('id');

        DB::table('pages')->where('id', $id)->delete();

        return response()->json(['success' => true, 'message' => '2/Page deleted.']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}

public function pageAction(Request $request)
{
    try {
        $id = $request->input('id');
        $page = DB::table('pages')->where('id', $id)->first();
        DB::transaction(function () use ($page, $id) {
            if ($page->ismain == 0) {
                DB::table('pages')->update(['ismain' => 0]);
                DB::table('pages')->where('id', $id)->update(['ismain' => 1]);
            } else {
                DB::table('pages')->where('id', $id)->update(['ismain' => 0]);
            }
        });
        return response()->json([
            'success' => true,
            'message' => '2/Page updated successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}




public function createSiteManage(Request $request)
{
    try {
        $smskey = $request->input('smskey');
        $paymenttype = $request->input('paymenttype');
        $paymentinfo = $request->input('paymentinfo');
        $masterkey = $request->input('masterkey');
        $steadfast = $request->input('steadfast');

        $data = [
            'smskey' => $smskey,
            'paymenttype' => $paymenttype,
            'paymentinfo' => $paymentinfo,
            'masterkey' => $masterkey,
            'steadfast' => $steadfast,
        ];

        // Delete all existing records
        DB::table('sitemanage')->delete();

        // Insert new record and get its ID
        $id = DB::table('sitemanage')->insertGetId($data);

        // Fetch the inserted record
        $result = DB::table('sitemanage')->where('id', $id)->first();

        return response()->json($result);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}



public function updateSiteManage(Request $request)
{
    try {
        $id = $request->input('id');
        $smskey = $request->input('smskey');
        $paymenttype = $request->input('paymenttype');
        $paymentinfo = $request->input('paymentinfo');
        $masterkey = $request->input('masterkey');
        $steadfast = $request->input('steadfast');

        $data = [
            'smskey' => $smskey,
            'paymenttype' => $paymenttype,
            'paymentinfo' => $paymentinfo,
            'masterkey' => $masterkey,
            'steadfast' => $steadfast,
        ];

        DB::table('sitemanage')->where('id', $id)->update($data);

        $result = DB::table('sitemanage')->where('id', $id)->first();

        return response()->json($result);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}


public function getSiteContent()
{
    try {
        $data = DB::table('sitecontent')->first();
        return response()->json($data);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}











}
