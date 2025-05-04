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
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
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
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'amount' => [
                    'description' => 'Transaction amount',
                    'type' => 'number',
                    'required' => true,
                ],
                'type' => [
                    'description' => 'Transaction type (income, expense, or transfer)',
                    'type' => 'string',
                    'enum' => ['income', 'expense', 'transfer'],
                    'required' => true,
                ],
                'transaction_date' => [
                    'description' => 'Transaction date (YYYY-MM-DD)',
                    'type' => 'string',
                    'required' => true,
                ],
                'category_id' => [
                    'description' => 'Category ID (not required for transfer transactions)',
                    'type' => ['integer', 'null', 'string'],
                    'required' => false,
                ],
                'account_id' => [
                    'description' => 'Account ID (source account for transfers)',
                    'type' => 'integer',
                    'required' => true,
                ],
                'destination_account_id' => [
                    'description' => 'Destination account ID (required for transfer transactions)',
                    'type' => 'integer',
                    'required' => false,
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
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        // Update transaction
        register_rest_route('api/v1/finance', '/transactions/(?P<id>\\d+)', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_transaction'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
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
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
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
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_params();

        // Pagination
        $per_page = isset($params['per_page']) && (int)$params['per_page'] > 0 ? (int)$params['per_page'] : 10;
        $page = isset($params['page']) && (int)$params['page'] > 0 ? (int)$params['page'] : 1;
        $offset = ($page - 1) * $per_page;

        // Allow order and order_by from query string even if not in route args
        if (isset($_GET['order'])) {
            $params['order'] = $_GET['order'];
        }
        if (isset($_GET['order_by'])) {
            $params['order_by'] = $_GET['order_by'];
        }

        $transactions = Unclutter_Transaction_Service::get_transactions($profile_id, $params, $per_page, $offset);
        $total = Unclutter_Transaction_Service::count_transactions($profile_id, $params);

        $response = [
            'success' => true,
            'data' => $transactions,
            'pagination' => [
                'total' => $total,
                'per_page' => $per_page,
                'page' => $page,
                'total_pages' => $per_page > 0 ? (int)ceil($total / $per_page) : 1,
            ]
        ];
        return new WP_REST_Response($response, 200);
    }

    public static function get_transaction($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $result = Unclutter_Transaction_Service::get_transaction($profile_id, $id);
        if (!$result) {
            return new WP_Error('not_found', __('Transaction not found.'), array('status' => 404));
        }
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }

    public static function create_transaction($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $data = $request->get_json_params();
        $data['profile_id'] = $profile_id;
        
        // Handle category_id for transfer transactions
        if (isset($data['type']) && $data['type'] === 'transfer') {
            // If category_id is null, empty string, or not set, remove it from the data
            // so the model layer can handle it appropriately
            if (empty($data['category_id']) || $data['category_id'] === null || $data['category_id'] === '') {
                unset($data['category_id']);
            }
        }
        
        $result = Unclutter_Transaction_Service::create_transaction($profile_id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }

    public static function update_transaction($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $data = $request->get_json_params();
        $data['profile_id'] = $profile_id;
        
        // Handle category_id for transfer transactions
        if (isset($data['type']) && $data['type'] === 'transfer') {
            // If category_id is null, empty string, or not set, remove it from the data
            // so the model layer can handle it appropriately
            if (empty($data['category_id']) || $data['category_id'] === null || $data['category_id'] === '') {
                unset($data['category_id']);
            }
        }
        
        $result = Unclutter_Transaction_Service::update_transaction($profile_id, $id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['success' => true], 200);
    }

    public static function delete_transaction($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $result = Unclutter_Transaction_Service::delete_transaction($profile_id, $id);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['success' => true], 200);
    }
}

// Initialize the controller
new Unclutter_Transaction_Controller();
