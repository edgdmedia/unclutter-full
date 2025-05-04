<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Role_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/role', '/list', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_roles'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/role', '/assign', [
            'methods' => 'POST',
            'callback' => [self::class, 'assign_role'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/role', '/remove', [
            'methods' => 'POST',
            'callback' => [self::class, 'remove_role'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/role', '/check-permission', [
            'methods' => 'POST',
            'callback' => [self::class, 'check_permission'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
    }
    public static function get_roles($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $roles = Unclutter_Role_Service::get_roles($profile_id);
        return new WP_REST_Response(['success' => true, 'roles' => $roles], 200);
    }
    public static function assign_role($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_json_params();
        $result = Unclutter_Role_Service::assign_role($profile_id, $params['role'] ?? '');
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
    public static function remove_role($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_json_params();
        $result = Unclutter_Role_Service::remove_role($profile_id, $params['role'] ?? '');
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
    public static function check_permission($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_json_params();
        $result = Unclutter_Role_Service::check_permission($profile_id, $params['permission'] ?? '');
        return new WP_REST_Response(['success' => (bool)$result], 200);
    }
    public static function get_roles_data($profile_id) {
        $roles = Unclutter_Role_Service::get_roles($profile_id);
        return ['success' => true, 'roles' => $roles];
    }
    public static function assign_role_data($profile_id, $role_name) {
        $ok = Unclutter_Role_Service::assign_role($profile_id, $role_name);
        return ['success' => $ok];
    }
    public static function remove_role_data($profile_id, $role_name) {
        $ok = Unclutter_Role_Service::remove_role($profile_id, $role_name);
        return ['success' => $ok];
    }
    public static function check_permission_data($profile_id, $permission) {
        $ok = Unclutter_Role_Service::check_permission($profile_id, $permission);
        return ['success' => $ok];
    }
}
