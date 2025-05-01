<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Notification_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/notification', '/send', [
            'methods' => 'POST',
            'callback' => [self::class, 'send_notification'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/notification', '/list', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_notifications'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
    }
    public static function send_notification($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $params = $request->get_json_params();
        $result = Unclutter_Notification_Service::send_notification($profile_id, $params['type'] ?? '', $params['content'] ?? []);
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
    public static function get_notifications($request) {
        $profile_id = self::get_profile_id_from_request($request);
        $notifications = Unclutter_Notification_Service::get_notifications($profile_id);
        return new WP_REST_Response(['success' => true, 'notifications' => $notifications], 200);
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
    public static function send_notification_data($profile_id, $type, $content) {
        $ok = Unclutter_Notification_Service::send_notification($profile_id, $type, $content);
        return ['success' => $ok];
    }
    public static function send_email_data($profile_id, $subject, $body) {
        $ok = Unclutter_Notification_Service::send_email($profile_id, $subject, $body);
        return ['success' => $ok];
    }
}
