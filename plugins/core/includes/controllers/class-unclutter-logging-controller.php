<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Logging_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/logging', '/error', [
            'methods' => 'POST',
            'callback' => [self::class, 'log_error'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/logging', '/audit', [
            'methods' => 'POST',
            'callback' => [self::class, 'log_audit'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
    }
    public static function log_error($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $params = $request->get_json_params();
        $result = Unclutter_Logging_Service::log_error($profile_id, $params['endpoint'] ?? '', $params['error_message'] ?? '', $params['error_code'] ?? null);
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
    public static function log_audit($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $params = $request->get_json_params();
        $result = Unclutter_Logging_Service::log_audit($profile_id, $params['action'] ?? '', $params['details'] ?? []);
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
    public static function log_error_data($profile_id, $endpoint, $error_message, $error_code = null) {
        $ok = Unclutter_Logging_Service::log_error($profile_id, $endpoint, $error_message, $error_code);
        return ['success' => $ok];
    }
    public static function log_audit_data($profile_id, $action, $details = []) {
        $ok = Unclutter_Logging_Service::log_audit($profile_id, $action, $details);
        return ['success' => $ok];
    }
}
