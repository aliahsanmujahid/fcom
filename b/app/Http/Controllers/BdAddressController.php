<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BdAddressController extends Controller
{
    
    public static function getbdaddress()
    {
       try {
        
        $divisions = json_decode(
            file_get_contents(storage_path('bd_address.json')),
            true
        );
         
         return response()->json($divisions);

        } catch (\Exception $e) {

           return response()->json([
            'message' => 'Some Error!',
            'error' => $e->getMessage()
           ], 500);
        }
    }

}
