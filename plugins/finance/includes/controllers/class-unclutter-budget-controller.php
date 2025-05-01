<?php
/**
 * Class Unclutter_Budget_Controller
 * Handles REST API endpoints for managing budgets
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Budget_Controller {
    private static $service;
    public static function register_routes() {
        self::$service = new Unclutter_Budget_Service();
        // Get all budgets
        register_rest_route('api/v1/finance', '/budgets', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_budgets'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Create budget
        register_rest_route('api/v1/finance', '/budgets', [
            'methods' => 'POST',
            'callback' => [self::class, 'create_budget'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Get single budget
        register_rest_route('api/v1/finance', '/budgets/(?P<id>\\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_budget'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Update budget
        register_rest_route('api/v1/finance', '/budgets/(?P<id>\\d+)', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_budget'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Delete budget
        register_rest_route('api/v1/finance', '/budgets/(?P<id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [self::class, 'delete_budget'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
    }
    public static function auth_required() {
        if (!is_user_logged_in()) {
            return new WP_Error('rest_forbidden', __('You are not authorized.'), array('status' => 401));
        }
        return true;
    }
        register_rest_route($this->namespace, '/' . $this->resource, [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_budgets'],
                'permission_callback' => [$this, 'permissions_check'],
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [$this, 'create_budget'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);
        register_rest_route($this->namespace, '/' . $this->resource . '/(?P<id>\\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_budget'],
                'permission_callback' => [$this, 'permissions_check'],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [$this, 'update_budget'],
                'permission_callback' => [$this, 'permissions_check'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [$this, 'delete_budget'],
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
    public function get_budgets($request) {
        $params = $request->get_params();
        $result = $this->service->get_budgets($params);
        return rest_ensure_response($result);
    }
    public function get_budget($request) {
        $id = (int) $request['id'];
        $result = $this->service->get_budget($id);
        if (!$result) {
            return new WP_Error('not_found', __('Budget not found.'), array('status' => 404));
        }
        return rest_ensure_response($result);
    }
    public function create_budget($request) {
        $data = $request->get_json_params();
        $result = $this->service->create_budget($data);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response($result);
    }
    public function update_budget($request) {
        $id = (int) $request['id'];
        $data = $request->get_json_params();
        $result = $this->service->update_budget($id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response($result);
    }
    public function delete_budget($request) {
        $id = (int) $request['id'];
        $result = $this->service->delete_budget($id);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response(['deleted' => true]);
    }
}
