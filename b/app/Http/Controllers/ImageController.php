<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use DB;   
use Illuminate\Support\Facades\File;

class ImageController extends Controller
{
    
    public function imageUpload(Request $request)
{
    try {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'type'  => 'required|string',
        ]);

        $image = $request->file('image');

        // main image
        $filename = Str::uuid() . '.webp';
        $path = public_path('uploads/' . $filename);
        @mkdir(dirname($path), 0755, true);

        Image::read($image)->toWebp(80)->save($path);
        $fileUrl = url('uploads/' . $filename);

        // order image
        $orderName = Str::uuid() . '.webp';
        $orderPath = public_path('uploads/ordersimg/' . $orderName);
        @mkdir(dirname($orderPath), 0755, true);

        Image::read($image)
            ->toWebp(40)
            ->save($orderPath);

        $orderImgUrl = url('uploads/ordersimg/' . $orderName);

        // insert DB
        $insertData = [
            'img'      => $fileUrl,
            'orderimg' => $orderImgUrl,
            'type'     => $request->type,
        ];

        $id = DB::table('files')->insertGetId($insertData);
        $savedRow = DB::table('files')->where('id', $id)->first();

        return response()->json([
            'success'   => true,
            'message'   => 'Image Uploaded.',
            'imagePath' => $fileUrl,
            'data'      => $savedRow
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Some Error!',
            'error'   => $e->getMessage()
        ], 500);
    }
}



public function deleteImage(Request $request)
{
    try {

        $request->validate([
            'imagePath'      => 'required|string',
            'data.id'        => 'required|integer',
            'data.orderimg'  => 'nullable|string',
        ]);

        $data = $request->input('data');

        // ✅ FIXED helper (URL → filesystem path)
        $toPublicPath = function ($url) {
            if (!$url) return null;

            $path = parse_url($url, PHP_URL_PATH); // /uploads/xxx.webp
            if (!$path) return null;

            return base_path('public' . $path);
        };

        /** ORDER IMAGE **/
        if (!empty($data['orderimg'])) {

            $orderImgUsed = DB::table('orderitems')
                ->where('img', $data['orderimg'])
                ->exists();

            if (!$orderImgUsed) {
                $orderImgPath = $toPublicPath($data['orderimg']);

                if ($orderImgPath && file_exists($orderImgPath)) {
                    unlink($orderImgPath);
                }
            }
        }

        /** MAIN IMAGE **/
        $imagePath = $toPublicPath($request->imagePath);

        if ($imagePath && file_exists($imagePath)) {
            unlink($imagePath);
        }

        /** DB DELETE **/
        DB::table('files')->where('id', $data['id'])->delete();

        return response()->json([
            'success' => true,
            'path'    => $imagePath,
            'message' => 'Image deleted successfully'
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Some error occurred',
            'error'   => $e->getMessage()
        ], 500);
    }
}




public function getImageFile(Request $request)
{
    try {

        $data = DB::table('files')
            ->where('type', $request->input('type'))
            ->get();

        return response()->json($data);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Problem to set Image',
            'error' => $e->getMessage()
        ], 500);

    }
}


}
