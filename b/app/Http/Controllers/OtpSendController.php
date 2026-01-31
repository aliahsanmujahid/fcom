<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;
use App\Http\Controllers\HelperController;

class OtpSendController extends Controller
{
    public static function insertOtp($phone, $randomOtp)
    {
        try {
            DB::delete('DELETE FROM otpcheck WHERE phone = ?', [$phone]);
            DB::insert('INSERT INTO otpcheck (phone, otp, date) VALUES (?, ?, NOW())', [
                $phone,
                $randomOtp
            ]);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Send OTP
     */
    public function sendOtp(Request $request)
    {
        try {
            $phone = $request->input('phone');
            $stop = $request->input('stop', false);

            if (!$phone) {
                return response()->json([
                    'otpsended' => false,
                    'message' => "2/OTP পাঠাতে ব্যর্থ হয়েছে।"
                ]);
            }

            // Site name from origin header
            $siteName = preg_replace('/^https?:\/\//', '', $request->headers->get('origin', ''));

            // Generate random 4-digit OTP
            $randomOtp = rand(1000, 9999);
            $msg = "OTP from {$siteName} = {$randomOtp}";

            // Check if user exists
            $users = DB::select('SELECT name FROM users WHERE phone = ?', [$phone]);
            $nameExists = count($users) > 0 && !empty($users[0]->name);

            // Check if OTP already sent
            $existingOtp = DB::select("
                SELECT *, TIME_TO_SEC(TIMEDIFF(NOW(), date)) AS secondsAgo 
                FROM otpcheck 
                WHERE phone = ?
            ", [$phone]);

            if (!empty($existingOtp) && $existingOtp[0]->secondsAgo < 180) {
                return response()->json([
                    'nameExists' => $nameExists,
                    'otpsended' => true,
                    'time' => $existingOtp[0]->date,
                    'message' => "3/৩ মিনিট পর নতুন OTP পাঠানো যাবে।"
                ]);
            }

            // If stop flag not set, send SMS and insert OTP
            if (!$stop) {
                $sent = HelperController::sendMsg($phone, $msg);
                self::insertOtp($phone, $randomOtp);
                
                if (!$sent) {
                    return response()->json([
                        'otpsended' => false,
                        'message' => "2/OTP পাঠাতে ব্যর্থ হয়েছে।"
                    ]);
                }
            }

            return response()->json([
                'nameExists' => $nameExists,
                'otpsended' => true,
                'message' => "3/OTP সফলভাবে পাঠানো হয়েছে।"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    public function otpSendAgain(Request $request)
    {
        try {
            $phone = $request->input('phone');
            $stop  = $request->input('stop', false);

            if (!$phone) {
                return response()->json([
                    'otpsended' => false,
                    'message' => "2/OTP পাঠাতে ব্যর্থ হয়েছে।"
                ]);
            }

            // Site name from origin header
            $siteName = preg_replace('/^https?:\/\//', '', $request->headers->get('origin', ''));

            // Delete old OTP
            DB::delete('DELETE FROM otpcheck WHERE phone = ?', [$phone]);

            // Generate new OTP
            $randomOtp = rand(1000, 9999);
            $msg = "OTP from {$siteName} = {$randomOtp}";

            if (!$stop) {
                // Send SMS
                $sent = HelperController::sendMsg($phone, $msg);

                // Insert new OTP
                self::insertOtp($phone, $randomOtp);

                if (!$sent) {
                    return response()->json([
                        'otpsended' => false,
                        'message' => "2/OTP পাঠাতে ব্যর্থ হয়েছে।"
                    ]);
                }
            }

            return response()->json([
                'otpsended' => true,
                'message' => "3/OTP সফলভাবে পাঠানো হয়েছে।"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Some Error!',
                'message' => $e->getMessage()
            ], 500);
        }
    }

}
