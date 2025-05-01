<?php
/**
 * Class Unclutter_Report_Controller
 * Handles REST API endpoints for reports
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Report_Controller {
    private static $service;
    public static function register_routes() {
        self::$service = new Unclutter_Report_Service();
        // Summary report
        register_rest_route('api/v1/finance', '/reports/summary', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_summary'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // By category
        register_rest_route('api/v1/finance', '/reports/by-category', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_by_category'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // By account
        register_rest_route('api/v1/finance', '/reports/by-account', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_by_account'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
    }
    public static function auth_required() {
        if (!is_user_logged_in()) {
            return new WP_Error('rest_forbidden', __('You are not authorized.'), array('status' => 401));
        }
        return true;
    }
        register_rest_route($this->namespace, '/' . $this->resource . '/summary', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_summary'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);
        register_rest_route($this->namespace, '/' . $this->resource . '/by-category', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_by_category'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);
        register_rest_route($this->namespace, '/' . $this->resource . '/by-account', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_by_account'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);
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
    public function get_by_category($request) {
        $params = $request->get_params();
        $result = $this->service->get_by_category($params);
        return rest_ensure_response($result);
    }
    public function get_by_account($request) {
        $params = $request->get_params();
        $result = $this->service->get_by_account($params);
        return rest_ensure_response($result);
    }
}
