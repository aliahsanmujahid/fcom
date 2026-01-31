<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;

class ReportController extends Controller
{
    public function userReport(Request $request)
{
    try {
        $page     = $request->input('page', 0);
        $phone    = trim($request->input('phone', ''));
        $gender   = trim($request->input('gender', ''));
        $timetype = $request->input('timetype');
        $region   = trim($request->input('region', ''));
        $zone     = trim($request->input('zone', ''));
        $city     = trim($request->input('city', ''));

        $numPerPage = 5;
        $skip = $page * $numPerPage;

        $query = DB::table('users');

        // Filters
        if ($phone !== '') {
            $query->where('phone', 'LIKE', "%{$phone}%");
        }

        if ($gender !== '') {
            $query->where('gender', $gender);
        }

        if ($region !== '') {
            $query->where('region', $region);
        }

        if ($zone !== '') {
            $query->where('zone', $zone);
        }

        if ($city !== '') {
            $query->where('city', 'LIKE', "%{$city}%");
        }

        // Time filter
        if ($timetype) {
            $now = now();
            $startDate = null;

            switch ((int) $timetype) {
                case 1: // This week
                    $startDate = $now->startOfWeek();
                    break;
                case 2: // This month
                    $startDate = $now->startOfMonth();
                    break;
                case 3: // Last 3 months
                    $startDate = $now->subMonths(3);
                    break;
                case 4: // Last 6 months
                    $startDate = $now->subMonths(6);
                    break;
                case 5: // This year
                    $startDate = $now->startOfYear();
                    break;
            }

            if ($startDate) {
                $query->where(function ($q) use ($startDate) {
                    $q->where('cdate', '>=', $startDate)
                      ->orWhere('adate', '>=', $startDate);
                });
            }
        }

        $data = [
            'count' => 0,
            'data'  => []
        ];

        // Count only on first page
        if ($page == 0) {
            $data['count'] = (clone $query)->count();
        }

        $data['data'] = $query
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json($data);

    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function orderReport(Request $request)
{
    try {
        $page     = $request->input('page', 0);
        $region   = trim($request->input('region', ''));
        $zone     = trim($request->input('zone', ''));
        $city     = trim($request->input('city', ''));
        $timetype = $request->input('timetype');

        $numPerPage = 5;
        $skip = $page * $numPerPage;

        $query = DB::table('orders');

        // Location filters
        if ($region !== '') {
            $query->where('region', $region);
        }

        if ($zone !== '') {
            $query->where('zone', $zone);
        }

        if ($city !== '') {
            $query->where('city', 'LIKE', "%{$city}%");
        }

        // Time filter
        if ($timetype) {
            $now = now();
            $startDate = null;

            switch ((int) $timetype) {
                case 1: // This week
                    $startDate = $now->startOfWeek();
                    break;
                case 2: // This month
                    $startDate = $now->startOfMonth();
                    break;
                case 3: // Last 3 months
                    $startDate = $now->subMonths(3);
                    break;
                case 4: // Last 6 months
                    $startDate = $now->subMonths(6);
                    break;
                case 5: // This year
                    $startDate = $now->startOfYear();
                    break;
            }

            if ($startDate) {
                $query->where('date', '>=', $startDate);
            }
        }

        $data = [
            'count' => 0,
            'data'  => []
        ];

        // Count only on first page
        if ($page == 0) {
            $data['count'] = (clone $query)->count();
        }

        $data['data'] = $query
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json($data);

    } catch (\Exception $e) {
        \Log::error($e);
        return response()->json(['error' => 'Some Error!'], 500);
    }
}



public function productViewReport(Request $request)
{
    try {
        $page     = $request->input('page', 0);
        $pid      = trim($request->input('pid', ''));
        $timetype = $request->input('timetype');

        $numPerPage = 5;
        $skip = $page * $numPerPage;

        $query = DB::table('views')
            ->leftJoin('users', 'users.id', '=', 'views.uid')
            ->select('views.*', 'users.id as user_id', 'users.name', 'users.phone');

        if ($pid !== '') {
            $query->where('views.pid', $pid);
        }

        if ($timetype) {
            $now = now();
            $startDate = null;

            switch ((int)$timetype) {
                case 1: $startDate = $now->startOfWeek(); break;
                case 2: $startDate = $now->startOfMonth(); break;
                case 3: $startDate = $now->subMonths(3); break;
                case 4: $startDate = $now->subMonths(6); break;
                case 5: $startDate = $now->startOfYear(); break;
            }

            if ($startDate) {
                $query->where('views.date', '>=', $startDate);
            }
        }

        $data = ['count' => 0, 'data' => []];

        if ($page == 0) {
            $data['count'] = (clone $query)->count();
        }

        $data['data'] = $query
            ->skip($skip)
            ->take($numPerPage)
            ->get();

        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}


}
