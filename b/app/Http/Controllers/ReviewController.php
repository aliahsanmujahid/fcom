<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;

class ReviewController extends Controller
{

    public function rchangestatus(Request $request)
{
    try {
        $id = $request->id;        // review id
        $status = $request->status;

        // update review status
        DB::table('reviews')
            ->where('id', $id)
            ->update(['status' => $status]);

        // get approved reviews for this product
        $reviews = DB::table('reviews')
            ->where('status', 'approved')
            ->where('pid', $id)   // same as your Node.js code
            ->get(['rating']);

        $count = $reviews->count();
        $avg = $count > 0
            ? round($reviews->sum('rating') / $count)
            : 0;

        // update product rating
        DB::table('products')
            ->where('id', $id)
            ->update([
                'avgrating' => $avg,
                'tr' => $count
            ]);

        return response()->json(['succ' => true]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function setallreviewstatust(Request $request)
{
    try {
        $status = $request->status;
        $allids = $request->allids ?? [];

        foreach ($allids as $item) {
            // update review status
            DB::table('reviews')
                ->where('id', $item['id'])
                ->update(['status' => $status]);

            // get approved reviews for product
            $reviews = DB::table('reviews')
                ->where('status', 'approved')
                ->where('pid', $item['pid'])
                ->get(['rating']);

            $count = $reviews->count();
            $avg = $count > 0
                ? round($reviews->sum('rating') / $count)
                : 0;

            // update product rating
            DB::table('products')
                ->where('id', $item['pid'])
                ->update([
                    'rating' => $avg,
                    'tr' => $count
                ]);
        }

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Problem to set order'], 500);
    }
}



public function createreview(Request $request)
{
    try {
        
        $user = $request->user;

        DB::table('reviews')->insert([
            'oitemid'     => $request->oitemid,
            'pid'         => $request->pid,
            'puid'        => $request->puid,
            'status'      => 'pending',
            'customerid'  => $user->id,
            'customeruid' => $user->uid,
            'rby'         => $user->name,
            'rbyn'        => $user->phone,
            'rating'      => $request->rating,
            'review'      => $request->review,
            'image1'      => $request->image1,
            'image2'      => $request->image2,
            'image3'      => $request->image3,
        ]);

        DB::table('orderitems')
            ->where('id', $request->oitemid)
            ->update(['isr' => 1]);

        $reviews = DB::table('reviews')
            ->where('status', 'approved')
            ->where('pid', $request->pid)
            ->get(['rating']);

        $count = $reviews->count();
        $avg = $count > 0 ? round($reviews->sum('rating') / $count) : 0;

        DB::table('products')
            ->where('id', $request->pid)
            ->update([
                'avgrating' => $avg,
                'treview'   => $count
            ]);

        return response()->json(['succ' => true]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}



public function updatereview(Request $request)
{
    try {
        DB::table('reviews')
            ->where('id', $request->id)
            ->update([
                'status' => 'pending',
                'rating' => $request->rating,
                'review' => $request->review,
                'image1' => $request->image1,
                'image2' => $request->image2,
                'image3' => $request->image3,
            ]);

        $reviews = DB::table('reviews')
            ->where('status', 'approved')
            ->where('pid', $request->pid)
            ->get(['rating']);

        $count = $reviews->count();
        $avg = $count > 0 ? round($reviews->sum('rating') / $count) : 0;

        DB::table('products')
            ->where('id', $request->pid)
            ->update([
                'avgrating' => $avg,
                'treview'   => $count
            ]);

        return response()->json(['succ' => true]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}



public function getallreviews(Request $request)
{
    try {
        $numPerPage = 5;
        $skip = $request->page * $numPerPage;

        $query = DB::table('reviews')->where('status', 'approved');

        if ($request->sort) {
            $query->where('rating', $request->sort);
        }

        if ($request->type == 1) {
            $query->where('pid', $request->id);
        }

        $reviews = $query
            ->orderByDesc('rating')
            ->orderByDesc('date')
            ->offset($skip)
            ->limit($numPerPage)
            ->get();

        if ($request->page == 0) {
            $totalCount = (clone $query)->count();

            $ratingCounts = (clone $query)
                ->select('rating', DB::raw('COUNT(*) as count'))
                ->groupBy('rating')
                ->get();

            $ratingSummary = collect([1,2,3,4,5])->map(function ($r) use ($ratingCounts) {
                return [
                    'rating' => $r,
                    'count'  => $ratingCounts->firstWhere('rating', $r)->count ?? 0
                ];
            });

            $sourceData = null;
            if ($request->type == 1) {
                $sourceData = DB::table('products')
                    ->select('id', 'uid', 'name')
                    ->where('id', $request->id)
                    ->first();
            }

            return response()->json([
                'data' => $reviews,
                'total' => $totalCount,
                'sourceData' => $sourceData,
                'ratingSummary' => $ratingSummary
            ]);
        }

        return response()->json(['data' => $reviews]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}


public function getreview(Request $request)
{
    try {
        $id = $request->id;
        $data = DB::table('reviews')
            ->where('oitemid', $id)
            ->get();

        return response()->json($data);
    } catch (\Exception $e) {
          return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}



public function answerReview(Request $request)
{
    try {
        $id = $request->id;
        $answer = $request->answer;

        DB::table('reviews')
            ->where('id', $id)
            ->update(['answer' => $answer]);

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}




public function getReviewsForManage(Request $request)
{
    try {
        $page = $request->page ?? 1;
        $status = $request->status ?? 'all';
        $search = $request->search ?? null;

        $numPerPage = 10;
        $skip = ($page - 1) * $numPerPage;

        $query = DB::table('reviews');
        $params = [];

        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Filter by search
        if ($search) {
            $user = DB::table('users')
                ->where('phone', $search)
                ->orWhere('uid', $search)
                ->first();

            $query->where(function($q) use ($search, $user) {
                $q->where('rbyn', $search)
                  ->orWhere('customerid', $user->id ?? 0)
                  ->orWhere('puid', $search);
            });
        }

        $reviews = $query->orderBy('id', 'ASC')
                         ->offset($skip)
                         ->limit($numPerPage)
                         ->get();

        $data = [];
        foreach ($reviews as $review) {
            $customer = DB::table('users')->where('id', $review->customerid)->first();
            $product = DB::table('products')->where('id', $review->pid)->first();

            $data[] = [
                'review' => $review,
                'customer' => $customer,
                'product' => $product,
            ];
        }

        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json(['error' => 'Some Error!'], 500);
    }
}




}
