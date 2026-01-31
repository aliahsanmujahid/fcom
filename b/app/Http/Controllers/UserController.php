<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\HelperController;
use DB;

class UserController extends Controller
{
    public function autosignup(Request $request)
    {
        try {
            // Extract POST body data
            $otp    = $request->input('otp');
            $phone  = $request->input('phone');
            $name   = $request->input('name');
            $gender = $request->input('gender');
            $dob    = $request->input('dob');

            // OTP and phone are required
            if (!$otp || !$phone) {
                return response()->json([
                    'nomach' => true,
                    'message' => "3/OTP সঠিক নয়।"
                ]);
            }

            // Fetch OTP record for the phone
            $otpRecord = DB::select('SELECT * FROM otpcheck WHERE phone = ?', [$phone]);

            // Fetch master key
            $masterKey = DB::select('SELECT * FROM sitemanage');
            $masterKeyValue = $masterKey[0]->masterkey ?? null;

            $otpMatch = isset($otpRecord[0]->otp) && $otpRecord[0]->otp == $otp;
            $masterMatch = $masterKeyValue && $masterKeyValue == $otp;

            if ($otpMatch || $masterMatch) {

                // If not master key, delete OTP
                if (!$masterMatch) {
                  //  DB::delete('DELETE FROM otpcheck WHERE phone = ?', [$phone]);
                }

                // Check if user exists
                $userData = DB::select('SELECT * FROM users WHERE phone = ?', [$phone]);

                if (count($userData) == 0) {
                    // Insert new user
                    DB::table('users')->insert([
                        'uid' => base_convert(time(), 10, 36),
                        'name' => $name,
                        'gender' => $gender,
                        'dob' => $dob,
                        'phone' => $phone,
                        'role' => 'user',
                    ]);

                    // Fetch newly created user
                    $userData = DB::select('SELECT * FROM users WHERE phone = ?', [$phone]);
                }

                $userObject = $userData[0]; // stdClass from DB

                // Generate JWT using HelperController
                $jwtToken = HelperController::jwtMake($userObject);

                return response()->json([
                    'success' => true,
                    'msg' => '1/লগইন সফল হয়েছে।',
                    'jwt' => $jwtToken
                ]);

            } else {
                return response()->json([
                    'nomach' => true,
                    'message' => "3/OTP সঠিক নয়।"
                ]);
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Some Error!',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function updateUser(Request $request)
{
    try {
        $uid = $request->input('uid');
        $name = $request->input('name');
        $gender = $request->input('gender');
        $bodytype = $request->input('bodytype');
        $dob = $request->input('dob');

        // Update the user
        DB::table('users')->where('id', $uid)->update([
            'name' => $name,
            'gender' => $gender,
            'bodytype' => $bodytype,
            'dob' => $dob
        ]);

        // Fetch the updated user
        $user = DB::table('users')->where('id', $uid)->first();

        // Generate JWT token (assuming you have a helper like jwtmake)
        $jwtToken = HelperController::jwtMake($user);


        return response()->json([
            'success' => true,
            'msg' => '1/User updated successfully',
            'jwt' => $jwtToken
        ]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}


public function getUserInfo(Request $request)
{
    try {
        $uid = $request->input('uid');

        if (!$uid) {
            return response()->json(null);
        }

        // Get the user by id or uid
        $user = DB::table('users')
            ->where('id', $uid)
            ->orWhere('uid', $uid)
            ->first();

        if (!$user) {
            return response()->json(null);
        }

        // Get user's addresses
        $address = DB::table('address')->where('uid', $user->id)->get();

        // Get coupons (phone matches or phone is null) with limit 2
        $coupons = DB::table('coupons')
            ->where('phone', $user->phone)
            ->orWhereNull('phone')
            ->limit(2)
            ->get();

        // Attach related data
        $user->address = $address;
        $user->coupons = $coupons;

        return response()->json($user);

    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}

public function createAdminUser(Request $request)
{
    try {
        $phone = $request->input('phone');
        $name = $request->input('name');
        $role = $request->input('role');

        $existing = DB::table('users')->where('phone', $phone)->first();

        $data = [
            'name' => $name,
            'phone' => $phone,
            'role' => $role
        ];

        if ($existing) {
            DB::table('users')->where('id', $existing->id)->update($data);
            return response()->json(['success' => true, 'message' => '1/User updated successfully.']);
        } else {
            $data['uid'] = base_convert(time(), 10, 36); // unique UID like Node.js
            DB::table('users')->insert($data);
            return response()->json(['success' => true, 'message' => '1/User created successfully.']);
        }
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}

public function searchUser(Request $request)
{
    try {
        $phone = $request->input('phone');

        $data = DB::table('users')->where('phone', $phone)->get();

        return response()->json($data);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}


public function setAdminModerator(Request $request)
{
    try {
        $id = $request->input('id');
        $role = $request->input('role');

        // Check how many admin users exist
        $admins = DB::table('users')->where('role', 'admin')->get();

        if ($admins->count() == 1) {
            if ($admins->first()->id == $id) {
                return response()->json([
                    'message' => '3/Must need one admin user.'
                ]);
            }
        }

        // Update the role
        DB::table('users')->where('id', $id)->update(['role' => $role]);

        return response()->json([
            'id' => $id,
            'role' => $role,
            'message' => '3/User Role Updated.'
        ]);

    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}


public function getUsersCountByRole()
{
    try {
        $adminCount = DB::table('users')->where('role', 'admin')->count();

        $data = [
            'admin' => $adminCount
        ];

        return response()->json($data);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}



public function activeUpdate(Request $request)
{
    try {
        $visitorId = $request->input('visitorid');
        $user = $request->input('user');

        if (!$visitorId) {
            return response()->json(null);
        }

        // Check if visitor exists
        $visitor = DB::table('visitors')->where('visitorid', $visitorId)->first();

        if ($visitor) {
            DB::table('visitors')->where('visitorid', $visitorId)->update([
                'adate' => now()
            ]);
        } else {
            DB::table('visitors')->insert([
                'visitorid' => $visitorId
            ]);
        }

        // Update user's adate if user id exists
        if (!empty($user['id'])) {
            DB::table('users')->where('id', $user['id'])->update([
                'adate' => now()
            ]);
        }

        return response()->json('');

    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Some Error!']);
    }
}






}
