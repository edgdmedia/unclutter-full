<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Subscription_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/subscription', '/me', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_subscription'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/subscription', '/update', [
            'methods' => 'POST',
            'callback' => [self::class, 'update_subscription'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        register_rest_route('api/v1/subscription', '/check-entitlement', [
            'methods' => 'POST',
            'callback' => [self::class, 'check_entitlement'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
    }
    public static function get_subscription($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $subscription = Unclutter_Subscription_Service::get_subscription($profile_id);
        return new WP_REST_Response(['success' => (bool)$subscription, 'subscription' => $subscription], $subscription ? 200 : 404);
    }
    public static function update_subscription($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_json_params();
        $result = Unclutter_Subscription_Service::update_subscription($profile_id, $params);
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
    public static function check_entitlement($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_json_params();
        $result = Unclutter_Subscription_Service::check_entitlement($profile_id, $params['feature'] ?? '');
        return new WP_REST_Response(['success' => (bool)$result], 200);
    }
    public static function auth_required($request) {
        $auth = $request->get_header('authorization');
        if (!$auth || stripos($auth, 'Bearer ') !== 0) return false;
        $jwt = trim(substr($auth, 7));
        $result = Unclutter_Auth_Service::verify_token($jwt);
        return $result && !empty($result['success']);
    }

    public static function get_subscription_data($profile_id) {
        $sub = Unclutter_Subscription_Service::get_subscription($profile_id);
        return ['success' => !!$sub, 'subscription' => $sub];
    }
    public static function update_subscription_data($profile_id, $data) {
        $ok = Unclutter_Subscription_Service::update_subscription($profile_id, $data);
        return ['success' => $ok];
    }
    public static function check_entitlement_data($profile_id, $feature) {
        $ok = Unclutter_Subscription_Service::check_entitlement($profile_id, $feature);
        return ['success' => $ok];
    }
}
