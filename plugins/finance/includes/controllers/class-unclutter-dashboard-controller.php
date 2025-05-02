<?php
/**
 * Class Unclutter_Dashboard_Controller
 * Handles REST API endpoints for dashboard analytics
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Dashboard_Controller {
    private static $service;
    public static function register_routes() {
        self::$service = new Unclutter_Dashboard_Service();
        // Dashboard summary
        register_rest_route('api/v1/finance', '/dashboard/summary', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_summary'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Dashboard trends
        register_rest_route('api/v1/finance', '/dashboard/trends', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_trends'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
    }
    public static function auth_required() {
        if (!is_user_logged_in()) {
            return new WP_Error('rest_forbidden', __('You are not authorized.'), array('status' => 401));
        }
        return true;
    }
    public function permissions_check($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('rest_forbidden', __('You are not authorized.'), array('status' => 401));
        }
        return true;
    }
    public function get_summary($request) {
        $params = $request->get_params();
        $result = $this->service->get_summary($params);
        return rest_ensure_response($result);
    }
    public function get_trends($request) {
        $params = $request->get_params();
        $result = $this->service->get_trends($params);
        return rest_ensure_response($result);
    }
}
