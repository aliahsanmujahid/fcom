<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use DB;

class IfIsAuth
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->header('access_token');

            if (!$token) {
                $request->user = null;
                return $next($request);
            }

            try {
                $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            } catch (\Exception $e) {
                $request->user = null;
                return $next($request);
            }

            if (!isset($decoded->id)) {
                $request->user = null;
                return $next($request);
            }

            $user = DB::table('users')->where('id', $decoded->id)->first();
            $request->user = $user ?: null;

            return $next($request);

        } catch (\Exception $e) {
            return response()->json([
             'message' => 'Some Error!',
             'error' => $e->getMessage() // optional for debugging
            ], 500);
        }
    }
}
