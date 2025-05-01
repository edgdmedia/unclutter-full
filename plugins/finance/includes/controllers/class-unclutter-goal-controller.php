<?php
/**
 * Class Unclutter_Goal_Controller
 * Handles REST API endpoints for managing savings goals
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Goal_Controller {
    private static $service;
    public static function register_routes() {
        self::$service = new Unclutter_Goal_Service();
        // Get all goals
        register_rest_route('api/v1/finance', '/goals', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_goals'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Create goal
        register_rest_route('api/v1/finance', '/goals', [
            'methods' => 'POST',
            'callback' => [self::class, 'create_goal'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Get single goal
        register_rest_route('api/v1/finance', '/goals/(?P<id>\\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_goal'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Update goal
        register_rest_route('api/v1/finance', '/goals/(?P<id>\\d+)', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_goal'],
            'permission_callback' => [self::class, 'auth_required'],
        ]);
        // Delete goal
        register_rest_route('api/v1/finance', '/goals/(?P<id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [self::class, 'delete_goal'],
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
                'callback' => [$this, 'get_goals'],
                'permission_callback' => [$this, 'permissions_check'],
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [$this, 'create_goal'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);
        register_rest_route($this->namespace, '/' . $this->resource . '/(?P<id>\\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_goal'],
                'permission_callback' => [$this, 'permissions_check'],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [$this, 'update_goal'],
                'permission_callback' => [$this, 'permissions_check'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [$this, 'delete_goal'],
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
    public function get_goals($request) {
        $params = $request->get_params();
        $result = $this->service->get_goals($params);
        return rest_ensure_response($result);
    }
    public function get_goal($request) {
        $id = (int) $request['id'];
        $result = $this->service->get_goal($id);
        if (!$result) {
            return new WP_Error('not_found', __('Goal not found.'), array('status' => 404));
        }
        return rest_ensure_response($result);
    }
    public function create_goal($request) {
        $data = $request->get_json_params();
        $result = $this->service->create_goal($data);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response($result);
    }
    public function update_goal($request) {
        $id = (int) $request['id'];
        $data = $request->get_json_params();
        $result = $this->service->update_goal($id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response($result);
    }
    public function delete_goal($request) {
        $id = (int) $request['id'];
        $result = $this->service->delete_goal($id);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response(['deleted' => true]);
    }
}
