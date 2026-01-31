<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;   

class CategoryController extends Controller
{
     
    public function getCategories(Request $request)
{
    try {
        $data = [];

        // Get categories for this origin
        $categories = DB::table('cate')
            ->get();

        foreach ($categories as $category) {

            // Get subcategories for this category and origin
            $subcategories = DB::table('subcate')
                ->where('cateid', $category->id)
                ->get();

            // Count products for this category and origin
            $categoryTp = DB::table('products')
                ->where('cateid', $category->id)
                ->count();

            foreach ($subcategories as $sub) {
                // Count products for this subcategory and origin
                $sub->tp = DB::table('products')
                    ->where('cateid', $category->id)
                    ->where('subcateid', $sub->id)
                    ->count();
            }

            $data[] = [
                'id' => $category->id,
                'name' => $category->name,
                'image' => $category->image,
                'tp' => $categoryTp,
                'subcate' => $subcategories
            ];
        }

        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage() // optional for debugging
        ], 500);
    }
}


  public function createCate(Request $request)
{
    try {
        $user = $request->user;

        $id = $request->input('id', 0);

        $data = [
            'name'  => $request->input('name'),
            'image' => $request->input('image'),
        ];

        if (!$id || $id == 0) {
            // Insert new category
            $insertId = DB::table('cate')->insertGetId($data);
            $category = DB::table('cate')->where('id', $insertId)->first();
        } else {
            // Update existing category
            DB::table('cate')->where('id', $id)->update($data);
            $category = DB::table('cate')->where('id', $id)->first();
        }

        return response()->json($category);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage() // optional for debugging
        ], 500);
    }
}

   

public function createSubcate(Request $request)
{
    try {
        $user = $request->user; // get the user

        $id = $request->input('id', 0);

        $data = [
            'cateid' => $request->input('cateid'),
            'name'   => $request->input('name'),
            'image'  => $request->input('image'),
        ];

        if ($id > 0) {
            // Update existing subcategory
            DB::table('subcate')->where('id', $id)->update($data);
            $subcategory = DB::table('subcate')->where('id', $id)->first();
        } else {
            // Insert new subcategory
            $insertId = DB::table('subcate')->insertGetId($data);
            $subcategory = DB::table('subcate')->where('id', $insertId)->first();
        }

        return response()->json($subcategory);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage() // optional for debugging
        ], 500);
    }
}



public function getAllCate(Request $request)
{
    try {
        $data = [];

        // Get all categories for this origin
        $categories = DB::table('cate')
            ->get();

        foreach ($categories as $category) {
            // Get subcategories for this category and origin
            $subcate = DB::table('subcate')
                ->where('cateid', $category->id)
                ->get();

            // Convert category to array and add subcategories
            $data[] = array_merge((array)$category, ['subcate' => $subcate]);
        }

        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage() // optional for debugging
        ], 500);
    }
}


public function getSubCateById(Request $request)
{
    try {
        $id = $request->id;

        // Get subcategories for this category AND origin
        $data = DB::table('subcate')
            ->where('cateid', $id)
            ->get();

        return response()->json($data);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage() // optional for debugging
        ], 500);
    }
}


public function deleteCate(Request $request)
{
    try {
        $id   = $request->id;
        $user = $request->user;

        // Delete subcategories only for this origin
        DB::table('subcate')
            ->where('cateid', $id)
            ->delete();

        // Delete category only if origin matches
        $deleted = DB::table('cate')
            ->where('id', $id)
            ->delete();

        return response()->json(['success' => true]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}


public function deleteSubCate(Request $request)
{
    try {
        $id   = $request->id;
        $user = $request->user;

        // Delete subcategory only if origin matches
        $deleted = DB::table('subcate')
            ->where('id', $id)
            ->delete();

        if (!$deleted) {
            return response()->json(['error' => 'Unauthorized or not found'], 401);
        }

        return response()->json(['success' => true]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
        ], 500);
    }
}


     

}
