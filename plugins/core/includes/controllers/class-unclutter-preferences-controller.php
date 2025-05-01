<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Preferences_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/preferences', '/get', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_preferences'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/preferences', '/set', [
            'methods' => 'POST',
            'callback' => [self::class, 'set_preferences'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
    }
    public static function get_preferences($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $prefs = Unclutter_Preferences_Service::get_preferences($profile_id);
        return new WP_REST_Response(['success' => true, 'preferences' => $prefs], 200);
    }
    public static function set_preferences($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $params = $request->get_json_params();
        $result = Unclutter_Preferences_Service::set_preferences($profile_id, $params['preferences'] ?? []);
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
    public static function auth_required($request) {
        $auth = $request->get_header('authorization');
        if (!$auth || stripos($auth, 'Bearer ') !== 0) return false;
        $jwt = trim(substr($auth, 7));
        $result = Unclutter_Auth_Service::verify_token($jwt);
        return $result && !empty($result['success']);
    }
    private static function get_profile_id_from_request($request) {
        // TODO: Extract profile_id from JWT or request context
        return (int) ($request['profile_id'] ?? 0);
    }
}
