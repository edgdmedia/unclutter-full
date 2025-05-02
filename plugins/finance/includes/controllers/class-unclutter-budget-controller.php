<?php

/**
 * Class Unclutter_Budget_Controller
 * Handles REST API endpoints for managing budgets
 */
if (! defined('ABSPATH')) {
    exit;
}
class Unclutter_Budget_Controller
{
    public static function register_routes()
    {
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

    /**
     * Authentication check
     * 
     * @param WP_REST_Request $request
     * @return bool
     */
    public static function auth_required($request)
    {
        $result = Unclutter_Auth_Controller::auth_required($request);
        return $result && !empty($result['success']);
    }

    public function permissions_check($request)
    {
        if (!is_user_logged_in()) {
            return new WP_Error('rest_forbidden', __('You are not authorized.'), array('status' => 401));
        }
        return true;
    }

    /**
     * Get all budgets
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_budgets($request)
    {
        $params = $request->get_params();
        // $result = Unclutter_Budget_Service::get_budgets($params);
        return new WP_REST_Response([], 200);
    }
    /**
     * Get a single budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_budget($request)
    {
        $id = (int) $request['id'];
        $result = Unclutter_Budget_Service::get_budget($id);
        if (!$result) {
            return new WP_Error('not_found', __('Budget not found.'), array('status' => 404));
        }
        return rest_ensure_response($result);
    }
    /**
     * Create a new budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function create_budget($request)
    {
        $data = $request->get_json_params();
        $result = Unclutter_Budget_Service::create_budget($data);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response($result);
    }
    /**
     * Update an existing budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function update_budget($request)
    {
        $id = (int) $request['id'];
        $data = $request->get_json_params();
        $result = Unclutter_Budget_Service::update_budget($id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response($result);
    }
    /**
     * Delete an existing budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function delete_budget($request)
    {
        $id = (int) $request['id'];
        $result = Unclutter_Budget_Service::delete_budget($id);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response(['deleted' => true]);
    }
}
