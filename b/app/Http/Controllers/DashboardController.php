<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use DB;   

class DashboardController extends Controller
{

    public function getallReport(Request $request)
{
    try {
        $data = [];
        $items = [];

        $user = $request->user ?? null;

        // Dates
        $prevDay = Carbon::yesterday();
        $prePrevDay = Carbon::today()->subDays(2);

        // Week
        $firstDayOfWeek = Carbon::now()->startOfWeek(); // Monday
        $lastDayOfWeek = Carbon::now()->endOfWeek();

        $firstDayPrevWeek = Carbon::now()->subWeek()->startOfWeek();
        $lastDayPrevWeek = Carbon::now()->subWeek()->endOfWeek();

        // Month
        $firstDayOfMonth = Carbon::now()->startOfMonth();
        $lastDayOfMonth = Carbon::now()->endOfMonth();

        $firstDayPrevMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastDayPrevMonth = Carbon::now()->subMonth()->endOfMonth();

        // Year
        $currentYear = Carbon::now()->year;
        $firstDayOfYear = Carbon::create($currentYear, 1, 1);
        $lastDayOfYear = Carbon::create($currentYear, 12, 31);

        $previousYear = $currentYear - 1;
        $firstDayPrevYear = Carbon::create($previousYear, 1, 1);
        $lastDayPrevYear = Carbon::create($previousYear, 12, 31);

// Orders by time (origin-wise)
$torder = DB::table('orders')
    ->get();

if ($user && $user->role === 'admin') {

    $orderThisDay = DB::table('orders')
        ->where('date', '>', $prevDay)
        ->get();

    $iaDay = DB::table('orders')
        ->whereBetween('date', [$prePrevDay, $prevDay])
        ->get();

    $orderThisWeek = DB::table('orders')
        ->whereBetween('date', [$firstDayOfWeek, $lastDayOfWeek])
        ->get();

    $iaWeek = DB::table('orders')
        ->whereBetween('date', [$firstDayPrevWeek, $lastDayPrevWeek])
        ->get();

    $orderThisMonth = DB::table('orders')
        ->whereBetween('date', [$firstDayOfMonth, $lastDayOfMonth])
        ->get();

    $iaMonth = DB::table('orders')
        ->whereBetween('date', [$firstDayPrevMonth, $lastDayPrevMonth])
        ->get();

    $orderThisYear = DB::table('orders')
        ->whereBetween('date', [$firstDayOfYear, $lastDayOfYear])
        ->get();

    $iaYear = DB::table('orders')
        ->whereBetween('date', [$firstDayPrevYear, $lastDayPrevYear])
        ->get();

    $items[] = [
        'name' => 'Order of this day',
        'l' => 'LD',
        'color' => true,
        'tv' => $orderThisDay->count(),
        'cv' => $iaDay->count(),
        'p'  => ($orderThisDay->count() - $iaDay->count())
    ];

    $items[] = [
        'name' => 'Order of this week',
        'l' => 'LW',
        'color' => true,
        'tv' => $orderThisWeek->count(),
        'cv' => $iaWeek->count(),
        'p'  => ($orderThisWeek->count() - $iaWeek->count())
    ];

    $items[] = [
        'name' => 'Order of this month',
        'l' => 'LM',
        'color' => true,
        'tv' => $orderThisMonth->count(),
        'cv' => $iaMonth->count(),
        'p'  => ($orderThisMonth->count() - $iaMonth->count())
    ];

    $items[] = [
        'name' => 'Order of this year',
        'l' => 'LY',
        'color' => true,
        'tv' => $orderThisYear->count(),
        'cv' => $iaYear->count(),
        'p'  => ($orderThisYear->count() - $iaYear->count())
    ];

    $data[] = [
        'name' => 'Total order',
        'tv'   => $torder->count(),
        'items'=> $items
    ];
}




    // Orders
if ($user->role === 'admin') {

    $items = [];

    $statuses = [
        'pending'    => 'Total pending order',
        'approved'   => 'Total approved order',
        'delivering' => 'Total delivering order',
        'confirmed'  => 'Total confirmed order',
        'rejected'   => 'Total rejected order',
        'cancled'    => 'Total cancled order',
        'inreview'   => 'Total order in review',
    ];

    foreach ($statuses as $status => $label) {

        $count = \DB::table('orders')
            
            ->where('status', $status)
            ->count();

        $item = [
            'name' => $label,
            'tv'   => $count,
        ];

        if ($status === 'pending') {
            $item['redcolor'] = false;
            $item['color']    = true;
        }

        $items[] = $item;
    }

    // Total orders (origin-wise)
    $totalOrders = \DB::table('orders')
        
        ->count();

    $data[] = [
        'name'  => 'Total order',
        'tv'    => $totalOrders,
        'items' => $items,
    ];

    $items = []; // reset
}
// end Orders






      // Total sale by time
if ($user->role === 'admin') {

    $items = [];
    $status = 'confirmed';

    // Day
    $saleThisDay = \DB::table('orders')
        
        ->where('status', $status)
        ->where('date', '>', $prevDay)
        ->sum('total');

    $saleDayPrev = \DB::table('orders')
        
        ->where('status', $status)
        ->whereBetween('date', [$prePrevDay, $prevDay])
        ->sum('total');

    // Week
    $saleThisWeek = \DB::table('orders')
        
        ->where('status', $status)
        ->whereBetween('date', [$firstDayOfWeek, $lastDayOfWeek])
        ->sum('total');

    $saleWeekPrev = \DB::table('orders')
        
        ->where('status', $status)
        ->whereBetween('date', [$firstDayPrevWeek, $lastDayPrevWeek])
        ->sum('total');

    // Month
    $saleThisMonth = \DB::table('orders')
        
        ->where('status', $status)
        ->whereBetween('date', [$firstDayOfMonth, $lastDayOfMonth])
        ->sum('total');

    $saleMonthPrev = \DB::table('orders')
        
        ->where('status', $status)
        ->whereBetween('date', [$firstDayPrevMonth, $lastDayPrevMonth])
        ->sum('total');

    // Year
    $saleThisYear = \DB::table('orders')
        
        ->where('status', $status)
        ->whereBetween('date', [$firstDayOfYear, $lastDayOfYear])
        ->sum('total');

    $saleYearPrev = \DB::table('orders')
        
        ->where('status', $status)
        ->whereBetween('date', [$firstDayPrevYear, $lastDayPrevYear])
        ->sum('total');

    $totalSaleOrderCount = \DB::table('orders')
        
        ->where('status', $status)
        ->count();

    $items[] = [
        'name' => 'Sale of this day',
        'l' => 'LD',
        'color' => true,
        'tv' => $saleThisDay ?? 0,
        'cv' => $saleDayPrev ?? 0,
        'p' => $saleDayPrev ? (($saleThisDay - $saleDayPrev) / $saleDayPrev) * 100 : 0
    ];

    $items[] = [
        'name' => 'Sale of this week',
        'l' => 'LW',
        'color' => true,
        'tv' => $saleThisWeek ?? 0,
        'cv' => $saleWeekPrev ?? 0,
        'p' => $saleWeekPrev ? (($saleThisWeek - $saleWeekPrev) / $saleWeekPrev) * 100 : 0
    ];

    $items[] = [
        'name' => 'Sale of this month',
        'l' => 'LM',
        'color' => true,
        'tv' => $saleThisMonth ?? 0,
        'cv' => $saleMonthPrev ?? 0,
        'p' => $saleMonthPrev ? (($saleThisMonth - $saleMonthPrev) / $saleMonthPrev) * 100 : 0
    ];

    $items[] = [
        'name' => 'Sale of this year',
        'l' => 'LY',
        'color' => true,
        'tv' => $saleThisYear ?? 0,
        'cv' => $saleYearPrev ?? 0,
        'p' => $saleYearPrev ? (($saleThisYear - $saleYearPrev) / $saleYearPrev) * 100 : 0
    ];

    $data[] = [
        'name' => 'Total sale (Confirmed order)',
        'tv' => $totalSaleOrderCount,
        'items' => $items
    ];

    $items = [];
}
// end total sale by time




     // IP / Active device part
if ($user->role === 'admin') {

    $items = [];

    // Today
    $macToday = \DB::table('visitors')
        
        ->where('adate', '>', $prevDay)
        ->count();

    $macPrevDay = \DB::table('visitors')
        
        ->whereBetween('adate', [$prePrevDay, $prevDay])
        ->count();

    // Week
    $macWeek = \DB::table('visitors')
        
        ->whereBetween('adate', [$firstDayOfWeek, $lastDayOfWeek])
        ->count();

    $macPrevWeek = \DB::table('visitors')
        
        ->whereBetween('adate', [$firstDayPrevWeek, $lastDayPrevWeek])
        ->count();

    // Month
    $macMonth = \DB::table('visitors')
        
        ->whereBetween('adate', [$firstDayOfMonth, $lastDayOfMonth])
        ->count();

    $macPrevMonth = \DB::table('visitors')
        
        ->whereBetween('adate', [$firstDayPrevMonth, $lastDayPrevMonth])
        ->count();

    // Year
    $macYear = \DB::table('visitors')
        
        ->whereBetween('adate', [$firstDayOfYear, $lastDayOfYear])
        ->count();

    $macPrevYear = \DB::table('visitors')
        
        ->whereBetween('adate', [$firstDayPrevYear, $lastDayPrevYear])
        ->count();

    // Total
    $totalMac = \DB::table('visitors')
        
        ->count();

    $items[] = [
        'name' => 'Today active device',
        'l' => 'LD',
        'color' => true,
        'tv' => $macToday,
        'cv' => $macPrevDay,
        'p' => $macPrevDay ? (($macToday - $macPrevDay) / $macPrevDay) * 100 : 0
    ];

    $items[] = [
        'name' => 'This week active device',
        'l' => 'LW',
        'color' => true,
        'tv' => $macWeek,
        'cv' => $macPrevWeek,
        'p' => $macPrevWeek ? (($macWeek - $macPrevWeek) / $macPrevWeek) * 100 : 0
    ];

    $items[] = [
        'name' => 'This month active device',
        'l' => 'LM',
        'color' => true,
        'tv' => $macMonth,
        'cv' => $macPrevMonth,
        'p' => $macPrevMonth ? (($macMonth - $macPrevMonth) / $macPrevMonth) * 100 : 0
    ];

    $items[] = [
        'name' => 'This year active device',
        'l' => 'LY',
        'color' => true,
        'tv' => $macYear,
        'cv' => $macPrevYear,
        'p' => $macPrevYear ? (($macYear - $macPrevYear) / $macPrevYear) * 100 : 0
    ];

    $data[] = [
        'name' => 'Active device',
        'tv' => $totalMac,
        'items' => $items
    ];

    $items = [];
}
// end ip part


        

   // User part
if ($user->role === 'admin') {

    $items = [];

    $atu = DB::table('users')
        
        ->where('role', 'user')
        ->where('adate', '>', $prevDay)
        ->count();

    $inatu = DB::table('users')
        
        ->where('role', 'user')
        ->whereBetween('adate', [$prePrevDay, $prevDay])
        ->count();

    $weeku = DB::table('users')
        
        ->where('role', 'user')
        ->whereBetween('adate', [$firstDayOfWeek, $lastDayOfWeek])
        ->count();

    $inweeku = DB::table('users')
        
        ->where('role', 'user')
        ->whereBetween('adate', [$firstDayPrevWeek, $lastDayPrevWeek])
        ->count();

    $monthu = DB::table('users')
        
        ->where('role', 'user')
        ->whereBetween('adate', [$firstDayOfMonth, $lastDayOfMonth])
        ->count();

    $inmonthu = DB::table('users')
        
        ->where('role', 'user')
        ->whereBetween('adate', [$firstDayPrevMonth, $lastDayPrevMonth])
        ->count();

    $yearu = DB::table('users')
        
        ->where('role', 'user')
        ->whereBetween('adate', [$firstDayOfYear, $lastDayOfYear])
        ->count();

    $inyearu = DB::table('users')
        
        ->where('role', 'user')
        ->whereBetween('adate', [$firstDayPrevYear, $lastDayPrevYear])
        ->count();

    $tu = DB::table('users')
        
        ->where('role', 'user')
        ->count();

    $items[] = [
        'name' => 'Today active customer',
        'l' => 'LD',
        'color' => true,
        'tv' => $atu,
        'cv' => $inatu,
        'p' => $inatu ? (($atu - $inatu) / $inatu) * 100 : 0
    ];

    $items[] = [
        'name' => 'This Week active customer',
        'l' => 'LW',
        'color' => true,
        'tv' => $weeku,
        'cv' => $inweeku,
        'p' => $inweeku ? (($weeku - $inweeku) / $inweeku) * 100 : 0
    ];

    $items[] = [
        'name' => 'This Month active customer',
        'l' => 'LM',
        'color' => true,
        'tv' => $monthu,
        'cv' => $inmonthu,
        'p' => $inmonthu ? (($monthu - $inmonthu) / $inmonthu) * 100 : 0
    ];

    $items[] = [
        'name' => 'This Year active customer',
        'l' => 'LY',
        'color' => true,
        'tv' => $yearu,
        'cv' => $inyearu,
        'p' => $inyearu ? (($yearu - $inyearu) / $inyearu) * 100 : 0
    ];

    $data[] = [
        'name' => 'Active customer',
        'tv' => $tu,
        'items' => $items
    ];

    $items = [];
}
// end user part




// Review report
$treview = DB::table('reviews')
    
    ->count();

if ($user->role === 'admin' || $user->role === 'moderator') {

    $items = [];

    $reviewThisDay = DB::table('reviews')
        
        ->where('date', '>', $prevDay)
        ->count();

    $iareviewd = DB::table('reviews')
        
        ->whereBetween('date', [$prePrevDay, $prevDay])
        ->count();

    $reviewThisWeek = DB::table('reviews')
        
        ->whereBetween('date', [$firstDayOfWeek, $lastDayOfWeek])
        ->count();

    $iarevieww = DB::table('reviews')
        
        ->whereBetween('date', [$firstDayPrevWeek, $lastDayPrevWeek])
        ->count();

    $reviewThisMonth = DB::table('reviews')
        
        ->whereBetween('date', [$firstDayOfMonth, $lastDayOfMonth])
        ->count();

    $iareviewm = DB::table('reviews')
        
        ->whereBetween('date', [$firstDayPrevMonth, $lastDayPrevMonth])
        ->count();

    $reviewThisYear = DB::table('reviews')
        
        ->whereBetween('date', [$firstDayOfYear, $lastDayOfYear])
        ->count();

    $iareviewy = DB::table('reviews')
        
        ->whereBetween('date', [$firstDayPrevYear, $lastDayPrevYear])
        ->count();

    $items[] = [
        'name' => 'Review of this day',
        'l' => 'LD',
        'color' => true,
        'tv' => $reviewThisDay,
        'cv' => $iareviewd,
        'p' => $iareviewd ? (($reviewThisDay - $iareviewd) / $iareviewd) * 100 : 0
    ];

    $items[] = [
        'name' => 'Review of this week',
        'l' => 'LW',
        'color' => true,
        'tv' => $reviewThisWeek,
        'cv' => $iarevieww,
        'p' => $iarevieww ? (($reviewThisWeek - $iarevieww) / $iarevieww) * 100 : 0
    ];

    $items[] = [
        'name' => 'Review of this month',
        'l' => 'LM',
        'color' => true,
        'tv' => $reviewThisMonth,
        'cv' => $iareviewm,
        'p' => $iareviewm ? (($reviewThisMonth - $iareviewm) / $iareviewm) * 100 : 0
    ];

    $items[] = [
        'name' => 'Review of this year',
        'l' => 'LY',
        'color' => true,
        'tv' => $reviewThisYear,
        'cv' => $iareviewy,
        'p' => $iareviewy ? (($reviewThisYear - $iareviewy) / $iareviewy) * 100 : 0
    ];

    $data[] = [
        'name' => 'Reviews',
        'tv' => $treview,
        'items' => $items
    ];

    $items = [];
}
// end review report




// Review report by status
if ($user->role === 'admin' || $user->role === 'moderator') {

    $items = [];

    $pr = DB::table('reviews')
        
        ->where('status', 'pending')
        ->count();

    $ar = DB::table('reviews')
        
        ->where('status', 'approved')
        ->count();

    $rr = DB::table('reviews')
        
        ->where('status', 'rejected')
        ->count();

    $totalReviews = DB::table('reviews')
        
        ->count();

    $items[] = [
        'name' => 'Total review pending',
        'redcolor' => false,
        'color' => true,
        'tv' => $pr
    ];

    $items[] = [
        'name' => 'Total review approved',
        'tv' => $ar
    ];

    $items[] = [
        'name' => 'Total review rejected',
        'tv' => $rr
    ];

    $data[] = [
        'name' => 'Reviews by status',
        'tv' => $totalReviews,
        'items' => $items
    ];

    $items = [];
}
// end review report by status



// Product Stock
if ($user->role === 'admin' || $user->role === 'moderator') {

    $items = [];

    $stock = DB::table('products')
        
        ->where('quantity', 0)
        ->count();
    $items[] = [
        'name' => 'Product stock out',
        'redcolor' => true,
        'tv' => $stock
    ];

    $nstock = DB::table('products')
        
        ->where('quantity', '<=', 10)
        ->count();
    $items[] = [
        'name' => 'Product quantity below 10',
        'redcolor' => true,
        'tv' => $nstock
    ];

    $tpa = DB::table('products')
        
        ->where('ia', 1)
        ->count();
    $items[] = [
        'name' => 'Total active product',
        'tv' => $tpa
    ];

    $tpia = DB::table('products')
        
        ->where('ia', 0)
        ->count();
    $items[] = [
        'name' => 'Total inactive product',
        'tv' => $tpia
    ];

    $tp = DB::table('products')
        
        ->count();

    $data[] = [
        'name' => 'Product report',
        'tv' => $tp,
        'items' => $items
    ];

    $items = [];
}
// end Product Stock




      // Others Report
if ($user->role === 'admin' || $user->role === 'moderator') {

    $items = [];

    $tcate = DB::table('cate')
        
        ->count();
    $items[] = [
        'name' => 'Total category',
        'tv' => $tcate
    ];

    $tsubcate = DB::table('subcate')
        
        ->count();
    $items[] = [
        'name' => 'Total sub category',
        'tv' => $tsubcate
    ];

    $tadmin = DB::table('users')
        
        ->where('role', '!=', 'user')
        ->count();
    $items[] = [
        'name' => 'Total admin',
        'tv' => $tadmin
    ];

    $tcupon = DB::table('coupons')
        
        ->count();
    $items[] = [
        'name' => 'Total coupons',
        'tv' => $tcupon
    ];

    $tfile = DB::table('files')
        
        ->count();
    $items[] = [
        'name' => 'Total file uploaded',
        'tv' => $tfile
    ];

    $data[] = [
        'name' => 'Others report',
        'items' => $items
    ];

    $items = []; // reset
}
// End Others Report



        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage(),
            'line' => $e->getLine()
        ], 500);
    }
}


public function liveReport(Request $request)
{
    try {

        $user = $request->user ?? null;

        $data = [
            'orders'    => DB::table('orders')->where('status', 'pending')->count(),
            'reviews'   => DB::table('reviews')->where('status', 'pending')->count(),
            'questions' => DB::table('questions')->where('answer', '')->count(),
            'cart'      => DB::table('cart')->count(),
            'products'  => DB::table('products')->count()
        ];

        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}



}
