<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Auth_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/auth', '/login', [
            'methods' => 'POST',
            'callback' => [self::class, 'login'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('api/v1/auth', '/register', [
            'methods' => 'POST',
            'callback' => [self::class, 'register'],
            'permission_callback' => '__return_true',
            'args' => [
                'email' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && filter_var($param, FILTER_VALIDATE_EMAIL);
                    },
                ],
                'password' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && strlen($param) >= 8;
                    },
                ],
                'first_name' => [
                    'required' => false,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && preg_match('/^[a-zA-Z ]+$/', $param);
                    },
                ],
                'last_name' => [
                    'required' => false,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && preg_match('/^[a-zA-Z ]+$/', $param);
                    },
                ],
            ],
        ]);
        register_rest_route('api/v1/auth', '/verify-email', [
            'methods' => 'POST',
            'callback' => [self::class, 'verify_email'],
            'permission_callback' => '__return_true',
            'args' => [
                'email' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && filter_var($param, FILTER_VALIDATE_EMAIL);
                    },
                ],
                'code' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && strlen($param) >= 8;
                    },
                ],
            ],
        ]);
        register_rest_route('api/v1/auth', '/resend-verification', [
            'methods' => 'POST',
            'callback' => [self::class, 'resend_verification'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('api/v1/auth', '/forgot-password', [
            'methods' => 'POST',
            'callback' => [self::class, 'forgot_password'],
            'permission_callback' => '__return_true',
            'args' => [
                'email' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && filter_var($param, FILTER_VALIDATE_EMAIL);
                    },
                ],
            ],
        ]);
        register_rest_route('api/v1/auth', '/reset-password', [
            'methods' => 'POST',
            'callback' => [self::class, 'reset_password'],
            'permission_callback' => '__return_true',
            'args' => [
                'email' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && filter_var($param, FILTER_VALIDATE_EMAIL);
                    },
                ],
                'code' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && strlen($param) >= 8;
                    },
                ],
                'new_password' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && strlen($param) >= 8;
                    },
                ],
            ],
        ]);
        register_rest_route('api/v1/auth', '/verify-token', [
            'methods' => 'POST',
            'callback' => [self::class, 'verify_token'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('api/v1/auth', '/logout', [
            'methods' => 'POST',
            'callback' => [self::class, 'logout'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('api/v1/auth', '/refresh', [
            'methods' => 'POST',
            'callback' => [self::class, 'refresh'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('api/v1/auth', '/change-password', [
            'methods' => 'POST',
            'callback' => [self::class, 'change_password'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'current_password' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && strlen($param) >= 8;
                    },
                ],
                'new_password' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param) && strlen($param) >= 8;
                    },
                ],
            ],
        ]);
    }
    public static function login($request) {
        $params = $request->get_json_params();
        $result = Unclutter_Auth_Service::login($params['email'] ?? '', $params['password'] ?? '');
        return new WP_REST_Response($result, $result['success'] ? 200 : 401);
    }
    public static function register($request) {
        $params = $request->get_json_params();
        $result = Unclutter_Auth_Service::register($params);
        return new WP_REST_Response($result, $result['success'] ? 200 : 400);
    }
    public static function verify_email($request) {
        $params = $request->get_json_params();
        $result = Unclutter_Auth_Service::verify_email($params['email'] ?? '', $params['code'] ?? '');
        return new WP_REST_Response($result, $result['success'] ? 200 : 400);
    }
    public static function resend_verification($request) {
        $params = $request->get_json_params();
        $result = Unclutter_Auth_Service::resend_verification($params['profile_id'] ?? 0);
        return new WP_REST_Response($result, $result['success'] ? 200 : 400);
    }
    public static function forgot_password($request) {
        $params = $request->get_json_params();
        $result = Unclutter_Auth_Service::initiate_password_reset($params['email'] ?? '');
        return new WP_REST_Response($result, 200);
    }
    public static function reset_password($request) {
        $params = $request->get_json_params();
        $email = $params['email'] ?? '';
        $code = $params['code'] ?? '';
        $new_password = $params['new_password'] ?? '';
        
        // Look up profile_id from email
        $profile = Unclutter_Profile_Model::get_profile_by_email($email);
        if (!$profile) {
            return new WP_REST_Response([
                'success' => false, 
                'message' => 'Invalid email or token'
            ], 400);
        }
        
        $profile_id = $profile->id;
        
        // Add debugging
        $reset_token = Unclutter_Profile_Model::get_meta($profile_id, 'reset_token');
        $reset_expires = Unclutter_Profile_Model::get_meta($profile_id, 'reset_expires');
        
        if (!$reset_token) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'No reset token found for this user',
                'debug' => ['profile_id' => $profile_id]
            ], 400);
        }
        
        if ($reset_token !== $code) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Token mismatch',
                'debug' => [
                    'expected' => $reset_token,
                    'received' => $code,
                    'length_expected' => strlen($reset_token),
                    'length_received' => strlen($code)
                ]
            ], 400);
        }
        
        if (strtotime($reset_expires) < time()) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Token expired',
                'debug' => [
                    'expires' => $reset_expires,
                    'current' => date('Y-m-d H:i:s')
                ]
            ], 400);
        }
        
        $result = Unclutter_Auth_Service::reset_password($profile_id, $code, $new_password);
        return new WP_REST_Response($result, $result['success'] ? 200 : 400);
    }

    public static function change_password($request) {
        $params = $request->get_json_params();
        $profile_id = Unclutter_Utils::get_profile_id_from_token($request);
        $result = Unclutter_Auth_Service::change_password($profile_id, $params['current_password'] ?? '', $params['new_password'] ?? '');
        return new WP_REST_Response($result, $result['success'] ? 200 : 400);
    }
    public static function verify_token($request) {
        $params = $request->get_json_params();
        $result = Unclutter_Auth_Service::verify_token($params['token'] ?? '');
        return new WP_REST_Response($result, $result['success'] ? 200 : 401);
    }
    public static function logout($request) {
        $params = $request->get_json_params();
        $result = Unclutter_Auth_Service::logout($params['token'] ?? '');
        return new WP_REST_Response($result, 200);
    }

    public static function refresh($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_json_params();
        $refresh_token = $params['refresh_token'] ?? '';
        $result = Unclutter_Auth_Service::refresh_token($profile_id, $refresh_token);
        return new WP_REST_Response(['success' => $result['success'], 'data' => $result['access_token']], $result['success'] ? 200 : 401);
    }

}

