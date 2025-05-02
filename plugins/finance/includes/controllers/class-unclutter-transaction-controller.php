<?php

/**
 * Class Unclutter_Transaction_Controller
 * Handles REST API endpoints for managing financial transactions
 */
if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class Unclutter_Transaction_Controller
{
    private static $service;
    public static function register_routes()
    {
        self::$service = new Unclutter_Transaction_Service();
        // Get all transactions
        register_rest_route('api/v1/finance', '/transactions', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_transactions'],
            'permission_callback' => [Unclutter_Finance_Utils::class, 'auth_required'],
            'args' => [
                'account_id' => [
                    'description' => 'Filter by account ID',
                    'type' => 'integer',
                    'required' => false,
                ],
                'category_id' => [
                    'description' => 'Filter by category ID',
                    'type' => 'integer',
                    'required' => false,
                ],
                'start_date' => [
                    'description' => 'Start date filter (YYYY-MM-DD)',
                    'type' => 'string',
                    'required' => false,
                ],
                'end_date' => [
                    'description' => 'End date filter (YYYY-MM-DD)',
                    'type' => 'string',
                    'required' => false,
                ],
                'search' => [
                    'description' => 'Search in description or tags',
                    'type' => 'string',
                    'required' => false,
                ],
                'per_page' => [
                    'description' => 'Number of items per page',
                    'type' => 'integer',
                    'default' => 20,
                ],
                'page' => [
                    'description' => 'Page number',
                    'type' => 'integer',
                    'default' => 1,
                ]
            ]
        ]);
        // Create transaction
        register_rest_route('api/v1/finance', '/transactions', [
            'methods' => 'POST',
            'callback' => [self::class, 'create_transaction'],
            'permission_callback' => [Unclutter_Finance_Utils::class, 'auth_required'],
        ]);
        // Get single transaction
        register_rest_route('api/v1/finance', '/transactions/(?P<id>\\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_transaction'],
            'permission_callback' => [Unclutter_Finance_Utils::class, 'auth_required'],
        ]);
        // Update transaction
        register_rest_route('api/v1/finance', '/transactions/(?P<id>\\d+)', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_transaction'],
            'permission_callback' => [Unclutter_Finance_Utils::class, 'auth_required'],
        ]);
        // Delete transaction
        register_rest_route('api/v1/finance', '/transactions/(?P<id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [self::class, 'delete_transaction'],
            'permission_callback' => [Unclutter_Finance_Utils::class, 'auth_required'],
        ]);
    }

    public function get_transactions($request)
    {
        $params = $request->get_params();
        $result = $this->service->get_transactions($params);
        return rest_ensure_response($result);
    }

    public function get_transaction($request)
    {
        $id = (int) $request['id'];
        $result = $this->service->get_transaction($id);
        if (!$result) {
            return new WP_Error('not_found', __('Transaction not found.'), array('status' => 404));
        }
        return rest_ensure_response($result);
    }

    public function create_transaction($request)
    {
        $data = $request->get_json_params();
        $result = $this->service->create_transaction($data);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response($result);
    }

    public function update_transaction($request)
    {
        $id = (int) $request['id'];
        $data = $request->get_json_params();
        $result = $this->service->update_transaction($id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response($result);
    }

    public function delete_transaction($request)
    {
        $id = (int) $request['id'];
        $result = $this->service->delete_transaction($id);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response(['deleted' => true]);
    }
}

// Initialize the controller
new Unclutter_Transaction_Controller();
