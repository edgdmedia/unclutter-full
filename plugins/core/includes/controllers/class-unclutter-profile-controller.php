<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Profile_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/profile', '/me', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_me'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/profile', '/me', [
            'methods' => 'POST',
            'callback' => [self::class, 'update_me'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/profile', '/preferences', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_preferences'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/profile', '/preferences', [
            'methods' => 'POST',
            'callback' => [self::class, 'set_preferences'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
    }
    public static function get_me($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $profile = Unclutter_Profile_Service::get_profile($profile_id);
        return new WP_REST_Response(['success' => (bool)$profile, 'profile' => $profile], $profile ? 200 : 404);
    }
    public static function update_me($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $params = $request->get_json_params();
        $result = Unclutter_Profile_Service::update_profile($profile_id, $params);
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
    public static function get_preferences($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $prefs = Unclutter_Profile_Service::get_preferences($profile_id);
        return new WP_REST_Response(['success' => true, 'preferences' => $prefs], 200);
    }
    public static function set_preferences($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $params = $request->get_json_params();
        $result = Unclutter_Profile_Service::set_preferences($profile_id, $params['preferences'] ?? []);
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
    public static function get_me_data($profile_id) {
        // $profile = Unclutter_Profile_Service::get_profile($profile_id);
        // if (!$profile) {
        //     return ['success' => false, 'message' => 'Profile not found'];
        // }
        return ['success' => true, 'profile' => []];
    }

    public static function update_me_data($profile_id, $data) {
        $ok = Unclutter_Profile_Service::update_profile($profile_id, $data);
        if (!$ok) {
            return ['success' => false, 'message' => 'Update failed'];
        }
        $profile = Unclutter_Profile_Service::get_profile($profile_id);
        return ['success' => true, 'profile' => $profile];
    }

    public static function get_preferences_data($profile_id) {
        $prefs = Unclutter_Preferences_Service::get($profile_id);
        return ['success' => true, 'preferences' => $prefs];
    }

    public static function set_preferences_data($profile_id, $prefs) {
        $ok = Unclutter_Preferences_Service::set($profile_id, $prefs);
        if (!$ok) {
            return ['success' => false, 'message' => 'Update failed'];
        }
        return ['success' => true];
    }
}
