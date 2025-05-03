<?php
/**
 * Unclutter Auth Service
 * Handles all business logic for authentication.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Auth_Service {
    /**
     * Authenticate user and issue JWT if successful
     */
    public static function login($email, $password) {
        $profile = Unclutter_Profile_Model::get_profile_by_email($email);
        if (!$profile) {
            return ['success' => false, 'message' => 'Invalid credentials'];
        }
        $profile_id = $profile->id;
        $hash = Unclutter_Profile_Model::get_meta($profile_id, 'password_hash');
        if (!wp_check_password($password, $hash)) {
            return ['success' => false, 'message' => 'Invalid credentials'];
        }
        $verified = Unclutter_Profile_Model::get_meta($profile_id, 'email_verified');
        if (!$verified) {
            return ['success' => false, 'message' => 'Email not verified'];
        }
        // Also log in to WordPress core
        // $wp_user_id = isset($profile->wp_user_id) ? $profile->wp_user_id : null;
        // if ($wp_user_id) {
        //     $user = get_user_by('id', $wp_user_id);
        //     if ($user) {
        //         wp_set_current_user($user->ID);
        //         wp_set_auth_cookie($user->ID);
        //     }
        // }
        // Generate tokens
        $access_token = self::generate_jwt($profile_id, 900); // 15 min
        $refresh_token = self::generate_refresh_token();
        $refresh_expires = date('Y-m-d H:i:s', strtotime('+7 days'));
        // Store refresh token in usermeta
        Unclutter_Profile_Model::set_meta($profile_id, [
            'refresh_token' => $refresh_token,
            'refresh_expires' => $refresh_expires
        ]);
        return [
            'success' => true,
            'access_token' => $access_token,
            'refresh_token' => $refresh_token,
            'profile_id' => $profile_id,
            'email' => $profile->email,
            'first_name' => $profile->first_name,
            'last_name' => $profile->last_name,
            'display_name' => $profile->display_name,
        ];
    }

    /**
     * Refresh access token using a valid refresh token
     */
    public static function refresh_token($profile_id, $refresh_token) {
        $stored_token = Unclutter_Profile_Model::get_meta($profile_id, 'refresh_token');
        $expires = Unclutter_Profile_Model::get_meta($profile_id, 'refresh_expires');
        if (!$stored_token || $stored_token !== $refresh_token) {
            return ['success' => false, 'message' => 'Invalid refresh token'];
        }
        if (strtotime($expires) < time()) {
            return ['success' => false, 'message' => 'Refresh token expired'];
        }
        $access_token = self::generate_jwt($profile_id, 900); // 15 min
        return [
            'success' => true,
            'access_token' => $access_token
        ];
    }

    /**
     * Blacklist (revoke) an access token (by signature)
     */
    private static function blacklist_token($profile_id, $token) {
        // Store blacklisted token signature in usermeta (expires when token would expire)
        $parts = explode('.', $token);
        if (count($parts) !== 3) return;
        list($header, $payload, $signature) = $parts;
        $payload_data = json_decode(base64_decode($payload), true);
        $exp = isset($payload_data['exp']) ? $payload_data['exp'] : time() + 900;
        $blacklist_key = 'blacklist_' . $signature;
        Unclutter_Profile_Model::set_meta($profile_id, [ $blacklist_key => $exp ]);
    }

    /**
     * Check if token is blacklisted
     */
    private static function is_token_blacklisted($profile_id, $token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;
        $signature = $parts[2];
        $blacklist_key = 'blacklist_' . $signature;
        $exp = Unclutter_Profile_Model::get_meta($profile_id, $blacklist_key);
        return $exp && time() < intval($exp);
    }

    /**
     * Register new user, create profile, send verification
     */
    public static function register($data) {
        $email = sanitize_email($data['email']);
        $password = $data['password'];
        if (!is_email($email) || empty($password)) {
            return ['success' => false, 'message' => 'Email and password are required'];
        }
        $exists = Unclutter_Profile_Model::get_profile_by_meta('email', $email);
        if ($exists) {
            return ['success' => false, 'message' => 'Email already registered'];
        }
        // // Create native WordPress user first
        // $wp_user_id = wp_create_user($email, $password, $email);
        // if (is_wp_error($wp_user_id)) {
        //     return ['success' => false, 'message' => $wp_user_id->get_error_message()];
        // }
        $hash = wp_hash_password($password);
        $verification_code = wp_generate_password(8, false);
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $profile_data = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'display_name' => isset($data['display_name']) ? $data['display_name'] : $data['first_name'] . ' ' . $data['last_name'],
            'email' => $email,
            'phone' => isset($data['phone']) ? $data['phone'] : '',
            'created_at' => current_time('mysql')
        ];
        $profile_id = Unclutter_Profile_Model::insert_profile($profile_data);
        // Store auth/meta fields
        $meta_data = [
            'email' => $email,
            'password_hash' => $hash,
            'email_verified' => 0,
            'verification_code' => $verification_code,
            'verification_expires' => $expires
        ];
        Unclutter_Profile_Model::set_meta($profile_id, $meta_data);
        // Assign default role (user)
        $role_id = Unclutter_Role_Model::get_role_id('user');
        if ($role_id) {
            Unclutter_Role_Model::assign_role($profile_id, $role_id);
        }
        // Send verification email
        self::send_verification_email($email, $verification_code);
        return ['success' => true, 'profile_id' => $profile_id];
    }

    /**
     * Verify email with code
     */
    public static function verify_email($email, $code) {
        $profile = Unclutter_Profile_Model::get_profile_by_email($email);
        if (!$profile) {
            return ['success' => false, 'message' => 'Invalid request'];
        }
        $profile_id = $profile->id;
        $stored_code = Unclutter_Profile_Model::get_meta($profile_id, 'verification_code');
        $expires = Unclutter_Profile_Model::get_meta($profile_id, 'verification_expires');
        $verified = Unclutter_Profile_Model::get_meta($profile_id, 'email_verified');
        if ($verified) {
            return ['success' => false, 'message' => 'Invalid request'];
        }
        if ($stored_code !== $code) {
            return ['success' => false, 'message' => 'Invalid code'];
        }
        if (strtotime($expires) < time()) {
            return ['success' => false, 'message' => 'Code expired'];
        }
        Unclutter_Profile_Model::update_meta($profile_id, 'email_verified', 1);
        Unclutter_Profile_Model::unset_meta($profile_id, 'verification_code');
        Unclutter_Profile_Model::unset_meta($profile_id, 'verification_expires');
        return ['success' => true];
    }

    /**
     * Resend verification code
     */
    public static function resend_verification($profile_id) {
        $email = Unclutter_Profile_Model::get_meta($profile_id, 'email');
        $verified = Unclutter_Profile_Model::get_meta($profile_id, 'email_verified');
        if (!$email || $verified) {
            return ['success' => false, 'message' => 'Invalid request'];
        }
        $verification_code = wp_generate_password(8, false);
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $meta_data = [
            'verification_code' => $verification_code,
            'verification_expires' => $expires
        ];
        Unclutter_Profile_Model::set_meta($profile_id, $meta_data);
        self::send_verification_email($email, $verification_code);
        return ['success' => true];
    }

    /**
     * Initiate password reset
     */
    public static function initiate_password_reset($email) {
        $profile = Unclutter_Profile_Model::get_profile_by_email($email);
        if (!$profile) {
            // Do not reveal if email exists
            return ['success' => true];
        }
        $profile_id = $profile->id;
        $reset_token = wp_generate_password(16, false);
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        $meta_data = [
            'reset_token' => $reset_token,
            'reset_expires' => $expires
        ];
        Unclutter_Profile_Model::set_meta($profile_id, $meta_data);
        self::send_password_reset_email($email, $reset_token);
        return ['success' => true];
    }

    /**
     * Reset password with token
     */
    public static function reset_password($profile_id, $token, $new_password) {
        $reset_token = Unclutter_Profile_Model::get_meta($profile_id, 'reset_token');
        $reset_expires = Unclutter_Profile_Model::get_meta($profile_id, 'reset_expires');
        if (!$reset_token || $reset_token !== $token) {
            return ['success' => false, 'message' => 'Invalid token'];
        }
        if (strtotime($reset_expires) < time()) {
            return ['success' => false, 'message' => 'Token expired'];
        }
        $hash = wp_hash_password($new_password);
        Unclutter_Profile_Model::set_meta($profile_id, ['password_hash' => $hash]);
        Unclutter_Profile_Model::unset_meta($profile_id, 'reset_token');
        Unclutter_Profile_Model::unset_meta($profile_id, 'reset_expires');
        return ['success' => true];
    }

    public static function change_password($profile_id, $current_password, $new_password) {
        $hash = Unclutter_Profile_Model::get_meta($profile_id, 'password_hash');
        if (!wp_check_password($current_password, $hash)) {
            return ['success' => false, 'message' => 'Invalid current password'];
        }
        $hash = wp_hash_password($new_password);
        Unclutter_Profile_Model::set_meta($profile_id, ['password_hash' => $hash]);
        return ['success' => true];
    }

    /**
     * Validate JWT token
     */
    public static function verify_token($token) {
        $payload = self::decode_jwt($token);
        if (!$payload || empty($payload['profile_id']) || $payload['exp'] < time()) {
            return ['success' => false, 'message' => 'Invalid token'];
        }
        $profile_id = $payload['profile_id'];
        if (self::is_token_blacklisted($profile_id, $token)) {
            return ['success' => false, 'message' => 'Token revoked'];
        }
        return ['success' => true, 'profile_id' => $profile_id];
    }

    /**
     * Invalidate JWT (optional: implement blacklist)
     */
    public static function logout($token) {
        $payload = self::decode_jwt($token);
        if (!$payload || empty($payload['profile_id'])) {
            return ['success' => true];
        }
        $profile_id = $payload['profile_id'];
        // Blacklist the access token
        self::blacklist_token($profile_id, $token);
        // Remove refresh token
        Unclutter_Profile_Model::unset_meta($profile_id, 'refresh_token');
        Unclutter_Profile_Model::unset_meta($profile_id, 'refresh_expires');
        return ['success' => true];
    }

    /**
     * Generate JWT for authentication
     */
    // Generate JWT access token
    private static function generate_jwt($profile_id, $exp = 3600) {
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode([
            'profile_id' => $profile_id,
            'exp' => time() + $exp
        ]));
        $signature = hash_hmac('sha256', "$header.$payload", AUTH_KEY);
        return "$header.$payload.$signature";
    }

    // Generate secure refresh token
    private static function generate_refresh_token() {
        return bin2hex(random_bytes(32));
    }

    /**
     * Decode JWT (for demo; use a library in production)
     */
    private static function decode_jwt($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return false;
        list($header, $payload, $signature) = $parts;
        $valid = hash_hmac('sha256', "$header.$payload", AUTH_KEY);
        if (!hash_equals($valid, $signature)) return false;
        return json_decode(base64_decode($payload), true);
    }

    /**
     * Send verification email
     */
    private static function send_verification_email($email, $code) {
        $subject = 'Verify your email';
        $body = "Your verification code is: $code";
        wp_mail($email, $subject, $body);
    }

    /**
     * Send password reset email
     */
    private static function send_password_reset_email($email, $token) {
        $subject = 'Reset your password';
        $body = "Your password reset code is: $token";
        wp_mail($email, $subject, $body);
    }
}

