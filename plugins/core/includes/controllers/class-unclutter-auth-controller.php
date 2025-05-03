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
        ]);
        register_rest_route('api/v1/auth', '/reset-password', [
            'methods' => 'POST',
            'callback' => [self::class, 'reset_password'],
            'permission_callback' => '__return_true',
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
            'permission_callback' => [self::class, 'auth_required'],
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
    public static function auth_required($request) {
        $auth = $request->get_header('authorization');
        if (!$auth || stripos($auth, 'Bearer ') !== 0) return false;
        $jwt = trim(substr($auth, 7));
        $result = Unclutter_Auth_Service::verify_token($jwt);
        return $result && !empty($result['success']);
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
        $result = Unclutter_Auth_Service::reset_password($params['profile_id'] ?? 0, $params['token'] ?? '', $params['new_password'] ?? '');
        return new WP_REST_Response($result, $result['success'] ? 200 : 400);
    }

    public static function change_password($request) {
        $params = $request->get_json_params();
        $profile_id = self::get_profile_id_from_token($request);
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
        $params = $request->get_json_params();
        $profile_id = $params['profile_id'] ?? 0;
        $refresh_token = $params['refresh_token'] ?? '';
        $result = Unclutter_Auth_Service::refresh_token($profile_id, $refresh_token);
        return new WP_REST_Response($result, $result['success'] ? 200 : 401);
    }

    public static function get_profile_id_from_token($request)
    {
        $auth = $request->get_header('authorization');
        if (!$auth || stripos($auth, 'Bearer ') !== 0) return null;
        $jwt = trim(substr($auth, 7));
        $result = Unclutter_Auth_Service::verify_token($jwt);
        return $result && !empty($result['success']) ? $result['profile_id'] : null;
    }
}

