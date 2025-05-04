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
        $controller = new self();
        // Get all budgets
        register_rest_route('api/v1/finance', '/budgets', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_budgets'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'month' => [
                    'required' => false,
                    'default' => date('n'),
                    'validate_callback' => function($param, $request, $key) {
                        return $param === '' || is_null($param) || is_numeric($param);
                    },
                ],
                'year' => [
                    'required' => false,
                    'default' => date('Y'),
                    'validate_callback' => function($param, $request, $key) {
                        return $param === '' || is_null($param) || is_numeric($param);
                    },
                ],
            ],
        ]);
        // Create budget
        register_rest_route('api/v1/finance', '/budgets', [
            'methods' => 'POST',
            'callback' => [self::class, 'create_budget'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'category_id' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    },
                ],
                'amount' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    },
                ],
                'month' => [
                    'default' => date('n'),
                    'validate_callback' => function($param, $request, $key) {
                        return $param === '' || is_null($param) || is_numeric($param);
                    },
                ],
                'year' => [
                    'default' => date('Y'),
                    'validate_callback' => function($param, $request, $key) {
                        return $param === '' || is_null($param) || is_numeric($param);
                    },
                ],
                'notes' => [
                    'validate_callback' => function($param, $request, $key) {
                        return $param === '' || is_null($param) || is_string($param);
                    },
                ],
            ],
        ]);
        // Get single budget
        register_rest_route('api/v1/finance', '/budgets/(?P<id>\\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_budget'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required']
        ]);
        //Get Budget by category and period
        register_rest_route('api/v1/finance', '/budgets/category/(?P<category_id>\\d+)/(?P<month>\\d+)/(?P<year>\\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_budget_by_category_and_period'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'category_id' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    },
                ],
                'month' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    },
                ],
                'year' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    },
                ],
            ],
        ]); 
    }

    /**
     * Get budget by category and period
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_budget_by_category_and_period($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $category_id = $request['category_id'];
        $month = $request['month'];
        $year = $request['year'];
        $data = [
            'profile_id' => $profile_id,
            'category_id' => $category_id,
            'month' => $month,
            'year' => $year
        ];
        $result = Unclutter_Budget_Service::get_budget_by_category_and_period($data);
        if (!$result) {
            return new WP_Error('not_found', __('Budget not found for this category and period.'), array('status' => 404));
        }
        return new WP_REST_Response([
            'success' => true,
            'data' => $result
        ], 200);
    }


    /**
     * Authentication check
     * 
     * @param WP_REST_Request $request
     * @return bool
     */
    // Authorization now handled by Unclutter_Finance_Utils::auth_required

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
    public static function get_budgets($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $data['profile_id'] = $profile_id;
        $result = Unclutter_Budget_Service::get_budgets($data);
        return new WP_REST_Response([
            'success' => true,
            'data' => $result
        ], 200);
    }
    /**
     * Get a single budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_budget($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $data['id'] = $request['id'];
        $data['profile_id'] = $profile_id;
        $result = Unclutter_Budget_Service::get_budget($data);
        if (!$result) {
            return new WP_Error('not_found', __('Budget not found.'), array('status' => 404));
        }
        return new WP_REST_Response([
            'success' => true,
            'data' => $result
        ], 200);
    }
    /**
     * Create a new budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function create_budget($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $data = $request->get_json_params();
        $data['profile_id'] = $profile_id;
        $result = Unclutter_Budget_Service::create_budget($data);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response([
            'success' => true,
            'data' => $result
        ], 200);
    }
    /**
     * Update an existing budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function update_budget($request)
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
    public static function delete_budget($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $id = (int) $request['id'];
        $result = Unclutter_Budget_Service::delete_budget($profile_id, $id);
        if (is_wp_error($result)) {
            return $result;
        }
        return rest_ensure_response(['deleted' => true]);
    }
}
