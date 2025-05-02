<?php
if (!defined('ABSPATH')) exit;

/**
 * Account Controller for Unclutter Finance
 * 
 * Handles REST API endpoints for financial accounts
 */
class Unclutter_Account_Controller
{
    /**
     * Register REST API routes
     */
    public static function register_routes()
    {
        // Get all accounts
        register_rest_route('api/v1/finance', '/accounts', [
            [
                'methods' => 'GET',
                'callback' => [self::class, 'get_accounts'],
                'permission_callback' => [self::class, 'auth_required'],
                'args' => [
                    'type_id' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_numeric($param);
                        },
                    ],
                    'is_active' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_bool($param) || in_array($param, ['true', 'false', '0', '1']);
                        },
                    ],
                ],
            ],
            [
                'methods' => 'POST',
                'callback' => [self::class, 'create_account'],
                'permission_callback' => [self::class, 'auth_required'],
                'args' => [
                    'name' => [
                        'required' => true,
                        'validate_callback' => function ($param) {
                            return is_string($param) && !empty($param);
                        },
                    ],
                    'type_id' => [
                        'required' => true,
                        'validate_callback' => function ($param) {
                            return is_numeric($param);
                        },
                    ],
                    'balance' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_numeric($param);
                        },
                    ],
                    'description' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_string($param);
                        },
                    ],
                    'institution' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_string($param);
                        },
                    ],
                ],
            ]
        ]);

        // Get a single account
        register_rest_route('api/v1/finance', '/accounts/(?P<id>\d+)', [
            [
                'methods' => 'GET',
                'callback' => [self::class, 'get_account'],
                'permission_callback' => [self::class, 'auth_required'],
            ],
            [
                'methods' => 'PUT',
                'callback' => [self::class, 'update_account'],
                'permission_callback' => [self::class, 'auth_required'],
                'args' => [
                    'name' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_string($param) && !empty($param);
                        },
                    ],
                    'type_id' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_numeric($param);
                        },
                    ],
                    'balance' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_numeric($param);
                        },
                    ],
                    'description' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_string($param);
                        },
                    ],
                    'institution' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_string($param);
                        },
                    ],
                    'is_active' => [
                        'required' => false,
                        'validate_callback' => function ($param) {
                            return is_bool($param) || in_array($param, ['true', 'false', '0', '1']);
                        },
                    ],
                ],
            ],
            [
                'methods' => 'DELETE',
                'callback' => [self::class, 'delete_account'],
                'permission_callback' => [self::class, 'auth_required'],
            ],
        ]);

        // Get account balance history
        register_rest_route('api/v1/finance', '/accounts/(?P<id>\d+)/balance-history', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_balance_history'],
            'permission_callback' => [self::class, 'auth_required'],
            'args' => [
                'start_date' => [
                    'required' => false,
                    'validate_callback' => function ($param) {
                        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $param);
                    },
                ],
                'end_date' => [
                    'required' => false,
                    'validate_callback' => function ($param) {
                        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $param);
                    },
                ],
            ],
        ]);

        // Search accounts
        register_rest_route('api/v1/finance', '/accounts/search', [
            'methods' => 'GET',
            'callback' => [self::class, 'search_accounts'],
            'permission_callback' => [self::class, 'auth_required'],
            'args' => [
                'search' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_string($param) && !empty($param);
                    },
                ],
            ],
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
        return Unclutter_Auth_Controller::auth_required($request);
    }

    /**
     * Get profile ID from token
     * 
     * @param WP_REST_Request $request
     * @return int|null
     */
    private static function get_profile_id_from_token($request)
    {
        $auth = $request->get_header('authorization');
        if (!$auth || stripos($auth, 'Bearer ') !== 0) return null;
        $jwt = trim(substr($auth, 7));
        $result = Unclutter_Auth_Service::verify_token($jwt);
        return $result && !empty($result['success']) ? $result['profile_id'] : null;
    }

    /**
     * Get accounts
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_accounts($request)
    {
        $profile_id = self::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $args = [];

        // Add type_id filter if provided
        if ($request->get_param('type_id')) {
            $args['type_id'] = intval($request->get_param('type_id'));
        }

        // Add is_active filter if provided
        if ($request->get_param('is_active') !== null) {
            $args['is_active'] = filter_var($request->get_param('is_active'), FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }

        $accounts = Unclutter_Account_Service::get_accounts($profile_id, $args);
        $total_balance = Unclutter_Account_Service::get_total_balance($profile_id);

        return new WP_REST_Response([
            'success' => true,
            'accounts' => $accounts,
            'total_balance' => $total_balance
        ], 200);
    }

    /**
     * Get a single account
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_account($request)
    {
        $profile_id = self::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $id = $request->get_param('id');
        $account = Unclutter_Account_Service::get_account($id);

        if (!$account) {
            return new WP_REST_Response(['success' => false, 'message' => 'Account not found'], 404);
        }

        // Check if the account belongs to the user
        if ($account->profile_id != $profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        return new WP_REST_Response(['success' => true, 'account' => $account], 200);
    }

    /**
     * Create a new account
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function create_account($request)
    {
        $profile_id = self::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $params = $request->get_json_params();

        // Required fields
        $name = sanitize_text_field($params['name'] ?? '');
        $type_id = intval($params['type_id'] ?? 0);

        if (empty($name) || empty($type_id)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Name and type are required' . $name . $type_id], 400);
        }

        // Check if type exists and belongs to the user or is a system type
        if (!Unclutter_Category_Service::category_belongs_to_profile($type_id, $profile_id)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Invalid account type'], 400);
        }

        // Optional fields
        $balance = isset($params['balance']) ? floatval($params['balance']) : 0.00;
        $description = isset($params['description']) ? sanitize_textarea_field($params['description']) : '';
        $institution = isset($params['institution']) ? sanitize_text_field($params['institution']) : '';

        // Prepare data
        $data = [
            'name' => $name,
            'type_id' => $type_id,
            'balance' => $balance,
            'description' => $description,
            'institution' => $institution,
            'is_active' => 1
        ];

        // Insert account
        $account_id = Unclutter_Account_Service::create_account($profile_id, $data);

        if (!$account_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Failed to create account'], 500);
        }

        // Get the newly created account
        $account = Unclutter_Account_Service::get_account($account_id);

        return new WP_REST_Response(['success' => true, 'account' => $account], 201);
    }

    /**
     * Update an account
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function update_account($request)
    {
        $profile_id = self::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $id = $request->get_param('id');
        $account = Unclutter_Account_Service::get_account($id);

        if (!$account) {
            return new WP_REST_Response(['success' => false, 'message' => 'Account not found'], 404);
        }

        // Check if the account belongs to the user
        if ($account->profile_id != $profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $params = $request->get_json_params();
        $data = [];

        // Optional fields
        if (isset($params['name'])) {
            $data['name'] = sanitize_text_field($params['name']);
        }

        if (isset($params['type_id'])) {
            $type_id = intval($params['type_id']);

            // Check if type exists and belongs to the user or is a system type
            if (!Unclutter_Category_Service::category_belongs_to_profile($type_id, $profile_id)) {
                return new WP_REST_Response(['success' => false, 'message' => 'Invalid account type'], 400);
            }

            $data['type_id'] = $type_id;
        }

        if (isset($params['balance'])) {
            $data['balance'] = floatval($params['balance']);
        }

        if (isset($params['description'])) {
            $data['description'] = sanitize_textarea_field($params['description']);
        }

        if (isset($params['institution'])) {
            $data['institution'] = sanitize_text_field($params['institution']);
        }

        if (isset($params['is_active'])) {
            $data['is_active'] = filter_var($params['is_active'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }

        // Update account
        $updated = Unclutter_Account_Service::update_account($id, $data);

        if (!$updated) {
            return new WP_REST_Response(['success' => false, 'message' => 'Failed to update account'], 500);
        }

        // Get the updated account
        $account = Unclutter_Account_Service::get_account($id);

        return new WP_REST_Response(['success' => true, 'account' => $account], 200);
    }

    /**
     * Delete an account
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function delete_account($request)
    {
        $profile_id = self::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $id = $request->get_param('id');
        $account = Unclutter_Account_Service::get_account($id);

        if (!$account) {
            return new WP_REST_Response(['success' => false, 'message' => 'Account not found'], 404);
        }

        // Check if the account belongs to the user
        if ($account->profile_id != $profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Delete account
        $deleted = Unclutter_Account_Service::delete_account($id);

        if (!$deleted) {
            return new WP_REST_Response(['success' => false, 'message' => 'Failed to delete account'], 500);
        }

        return new WP_REST_Response(['success' => true], 200);
    }

    /**
     * Get account balance history
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_balance_history($request)
    {
        $profile_id = self::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $id = $request->get_param('id');
        $account = Unclutter_Account_Service::get_account($id);

        if (!$account) {
            return new WP_REST_Response(['success' => false, 'message' => 'Account not found'], 404);
        }

        // Check if the account belongs to the user
        if ($account->profile_id != $profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Get date range parameters
        $start_date = $request->get_param('start_date') ?? date('Y-m-d', strtotime('-30 days'));
        $end_date = $request->get_param('end_date') ?? date('Y-m-d');

        // Get balance history
        $history = Unclutter_Account_Service::get_balance_history($id, $start_date, $end_date);

        return new WP_REST_Response(['success' => true, 'history' => $history], 200);
    }

    /**
     * Search accounts
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function search_accounts($request)
    {
        $profile_id = self::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $search = sanitize_text_field($request->get_param('search'));

        if (empty($search)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Search term is required'], 400);
        }

        $accounts = Unclutter_Account_Service::search_accounts($profile_id, $search);

        return new WP_REST_Response(['success' => true, 'accounts' => $accounts], 200);
    }
}
