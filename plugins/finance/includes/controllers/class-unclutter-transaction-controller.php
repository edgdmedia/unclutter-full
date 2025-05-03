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
    public static function register_routes()
    {
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
            'args' => [
                'amount' => [
                    'description' => 'Transaction amount',
                    'type' => 'number',
                    'required' => true,
                ],
                'type' => [
                    'description' => 'Transaction type (income or expense)',
                    'type' => 'string',
                    'required' => true,
                ],
                'transaction_date' => [
                    'description' => 'Transaction date (YYYY-MM-DD)',
                    'type' => 'string',
                    'required' => true,
                ],
                'category_id' => [
                    'description' => 'Category ID',
                    'type' => 'integer',
                    'required' => true,
                ],
                'account_id' => [
                    'description' => 'Account ID',
                    'type' => 'integer',
                    'required' => true,
                ],
                'description' => [
                    'description' => 'Transaction description',
                    'type' => 'string',
                    'required' => false,
                ],
                'tags' => [
                    'description' => 'Array of tag IDs',
                    'type' => 'array',
                    'required' => false,
                ],
                'attachments' => [
                    'description' => 'Array of attachment URLs',
                    'type' => 'array',
                    'required' => false,
                ],
            ]
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
            'args' => [
                'id' => [
                    'description' => 'Transaction ID',
                    'type' => 'integer',
                    'required' => true,
                ],
            ]
        ]);
        // Delete transaction
        register_rest_route('api/v1/finance', '/transactions/(?P<id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [self::class, 'delete_transaction'],
            'permission_callback' => [Unclutter_Finance_Utils::class, 'auth_required'],
            'args' => [
                'id' => [
                    'description' => 'Transaction ID',
                    'type' => 'integer',
                    'required' => true,
                ],
            ]
        ]);
    }

    public static function get_transactions($request)
    {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($request);
        $params = $request->get_params();
        $result = Unclutter_Transaction_Service::get_transactions($profile_id, $params);
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }

    public static function get_transaction($request)
    {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $result = Unclutter_Transaction_Service::get_transaction($profile_id, $id);
        if (!$result) {
            return new WP_Error('not_found', __('Transaction not found.'), array('status' => 404));
        }
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }

    public static function create_transaction($request)
    {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($request);
        $data = $request->get_json_params();
        $data['profile_id'] = $profile_id;
        $result = Unclutter_Transaction_Service::create_transaction($profile_id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }

    public static function update_transaction($request)
    {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $data = $request->get_json_params();
        $data['profile_id'] = $profile_id;
        $result = Unclutter_Transaction_Service::update_transaction($profile_id, $id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }

    public static function delete_transaction($request)
    {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $result = Unclutter_Transaction_Service::delete_transaction($profile_id, $id);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['deleted' => true]);
    }
}

// Initialize the controller
new Unclutter_Transaction_Controller();
