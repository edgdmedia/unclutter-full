<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Profile_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/profile', '/me', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_me'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/profile', '/me', [
            'methods' => 'POST',
            'callback' => [self::class, 'update_me'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/profile', '/preferences', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_preferences'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/profile', '/preferences', [
            'methods' => 'POST',
            'callback' => [self::class, 'set_preferences'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
    }
    public static function get_me($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $profile = Unclutter_Profile_Service::get_profile($profile_id);
        return new WP_REST_Response(['success' => (bool)$profile, 'profile' => $profile], $profile ? 200 : 404);
    }
    public static function update_me($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_json_params();
        $result = Unclutter_Profile_Service::update_profile($profile_id, $params);
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
    public static function get_preferences($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $prefs = Unclutter_Profile_Service::get_preferences($profile_id);
        return new WP_REST_Response(['success' => true, 'preferences' => $prefs], 200);
    }
    public static function set_preferences($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_json_params();
        $result = Unclutter_Profile_Service::set_preferences($profile_id, $params['preferences'] ?? []);
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
}
