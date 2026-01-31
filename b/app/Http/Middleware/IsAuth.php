<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use DB;

class IsAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->header('access_token');
        if (!$token) {
            return response()->json(['error' => 'Unauthorized access!'], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Authorization failed'], 401);
        }
        if (!isset($decoded->id)) {
            return response()->json(['error' => 'Unauthorized access!'], 401);
        }

        $user = DB::table('users')->where('id', $decoded->id)->first();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized access!'], 401);
        }
    
        // Attach user to request
        $request->user = $user;

        return $next($request);
    }
}
