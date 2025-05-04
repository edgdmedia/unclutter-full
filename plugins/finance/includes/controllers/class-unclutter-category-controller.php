<?php
if (!defined('ABSPATH')) exit;

/**
 * Category Controller for Unclutter Finance
 * 
 * Handles REST API endpoints for categories (unified taxonomy)
 */
class Unclutter_Category_Controller {

    public static function register_routes() {
        // ...existing routes...

        // Get a single category with details (budget + spend)
        register_rest_route('api/v1/finance', '/categories/(?P<id>\d+)/details', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_category_details'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'month' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param >= 1 && $param <= 12;
                    },
                ],
                'year' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param >= 2000 && $param <= 2100;
                    },
                ],
            ],
        ]);

        // Get all categories by type
        register_rest_route('api/v1/finance', '/categories', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_categories'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'type' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_string($param);
                    },
                ],
                'parent_id' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    },
                ],
                'hierarchy' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_bool($param) || in_array($param, ['true', 'false', '0', '1']);
                    },
                ],
            ],
        ]);
        
        // Get a single category
        register_rest_route('api/v1/finance', '/categories/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_category'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        
        // Create a new category
        register_rest_route('api/v1/finance', '/categories', [
            'methods' => 'POST',
            'callback' => [self::class, 'create_category'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'name' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_string($param) && !empty($param);
                    },
                ],
                'type' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_string($param) && !empty($param);
                    },
                ],
                'parent_id' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_numeric($param) || $param === null || $param === '';
                    },
                ],
                'description' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_string($param) || $param === null || $param === '';
                    },
                ],
            ],
        ]);
        
        // Update a category
        register_rest_route('api/v1/finance', '/categories/(?P<id>\d+)', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_category'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'name' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_string($param) && !empty($param);
                    },
                ],
                'parent_id' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_numeric($param) || is_null($param);
                    },
                ],
                'description' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_string($param);
                    },
                ],
                'is_active' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_bool($param) || in_array($param, ['true', 'false', '0', '1']);
                    },
                ],
            ],
        ]);
        
        // Delete a category
        register_rest_route('api/v1/finance', '/categories/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [self::class, 'delete_category'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        
        // Search categories
        register_rest_route('api/v1/finance', '/categories/search', [
            'methods' => 'GET',
            'callback' => [self::class, 'search_categories'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
            'args' => [
                'search' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_string($param) && !empty($param);
                    },
                ],
                'type' => [
                    'required' => false,
                    'validate_callback' => function($param) {
                        return is_string($param);
                    },
                ],
            ],
        ]);
    }

    
    /**
     * Get categories
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_categories($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        
        $type = $request->get_param('type');
        $parent_id = $request->get_param('parent_id');
        $hierarchy = $request->get_param('hierarchy');
        
        // Convert string boolean to actual boolean
        if ($hierarchy !== null) {
            $hierarchy = filter_var($hierarchy, FILTER_VALIDATE_BOOLEAN);
        }
        
        if ($hierarchy) {
            // Get hierarchical categories
            $categories = Unclutter_Category_Model::get_category_hierarchy($profile_id, $type);
        } else {
            // Get flat list of categories
            $args = [];
            if ($parent_id !== null) {
                $args['parent_id'] = $parent_id;
            }
            
            if ($type) {
                $categories = Unclutter_Category_Model::get_categories_by_profile_and_type($profile_id, $type, $args);
            } else {
                // If no type specified, get all categories
                $categories = [];
                
                // Get account types
                $account_types = Unclutter_Category_Model::get_categories_by_profile_and_type($profile_id, 'account', $args);
                foreach ($account_types as $category) {
                    $categories[] = $category;
                }
                
                // Get income categories
                $income_categories = Unclutter_Category_Model::get_categories_by_profile_and_type($profile_id, 'income', $args);
                foreach ($income_categories as $category) {
                    $categories[] = $category;
                }
                
                // Get expense categories
                $expense_categories = Unclutter_Category_Model::get_categories_by_profile_and_type($profile_id, 'expense', $args);
                foreach ($expense_categories as $category) {
                    $categories[] = $category;
                }
                
                // Get tags
                $tags = Unclutter_Category_Model::get_categories_by_profile_and_type($profile_id, 'tag', $args);
                foreach ($tags as $category) {
                    $categories[] = $category;
                }
            }
        }
        
        return new WP_REST_Response(['success' => true, 'data' => $categories], 200);
    }
    
    /**
     * Get a single category with details (budget, totals, paginated transactions)
     *
     * Query params:
     * - month, year: period to query
     * - page: page number for transaction pagination (default 1)
     * - per_page: transactions per page (default 20)
     *
     * Returns:
     * - category (with children)
     * - budget
     * - total_income
     * - total_expense
     * - transactions[] (paginated)
     * - transactions_pagination: {total, page, per_page, total_pages}
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_category_details($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $id = $request->get_param('id');
        $month = $request->get_param('month');
        $year = $request->get_param('year');
        $page = (int)$request->get_param('page');
        $per_page = (int)$request->get_param('per_page');
        $result = Unclutter_Category_Service::get_category_details($id, $profile_id, $month, $year, $page, $per_page);
        return new WP_REST_Response([
            'success' => true,
            'data' => $result['data'],
            'message' => $result['message']
        ], 200);
    }
       

    /**
     * Get a single category
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_category($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $id = $request->get_param('id');
        $result = Unclutter_Category_Service::get_category($id, $profile_id);
        return new WP_REST_Response([
            'success' => $result['success'],
            'data' => $result['data'],
            'message' => $result['message']
        ], $result['status']);
    }
    
    /**
     * Create a new category
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function create_category($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        
        $params = $request->get_json_params();
        
        // Required fields
        $name = sanitize_text_field($params['name'] ?? '');
        $type = sanitize_text_field($params['type'] ?? '');
        
        if (empty($name) || empty($type)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Name and type are required'], 400);
        }
        
        // Optional fields
        $parent_id = isset($params['parent_id']) ? intval($params['parent_id']) : null;
        $description = isset($params['description']) ? sanitize_textarea_field($params['description']) : '';
        
        // Check if parent category exists and belongs to the user
        if ($parent_id) {
            $parent = Unclutter_Category_Model::get_category($parent_id);
            if (!$parent || ($parent->profile_id != $profile_id && $parent->profile_id != 0)) {
                return new WP_REST_Response(['success' => false, 'message' => 'Invalid parent category'], 400);
            }
        }
        
        // Prepare data
        $data = [
            'profile_id' => $profile_id,
            'name' => $name,
            'type' => $type,
            'parent_id' => $parent_id,
            'description' => $description,
            'is_active' => 1
        ];
        
        // Insert category
        $category_id = Unclutter_Category_Model::insert_category($data);
        
        if (!$category_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Failed to create category'], 500);
        }
        
        // Get the newly created category
        $category = Unclutter_Category_Model::get_category($category_id);
        
        return new WP_REST_Response(['success' => true, 'category' => $category], 201);
    }
    
    /**
     * Update a category
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function update_category($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        
        $id = $request->get_param('id');
        $category = Unclutter_Category_Model::get_category($id);
        
        if (!$category) {
            return new WP_REST_Response(['success' => false, 'message' => 'Category not found'], 404);
        }
        
        // Check if the category belongs to the user (cannot edit system categories)
        if ($category->profile_id != $profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Cannot edit system categories'], 403);
        }
        
        $params = $request->get_json_params();
        $data = [];
        
        // Optional fields
        if (isset($params['name'])) {
            $data['name'] = sanitize_text_field($params['name']);
        }
        
        if (isset($params['parent_id'])) {
            $parent_id = $params['parent_id'] === null ? null : intval($params['parent_id']);
            
            // Check if parent category exists and belongs to the user
            if ($parent_id) {
                $parent = Unclutter_Category_Model::get_category($parent_id);
                if (!$parent || ($parent->profile_id != $profile_id && $parent->profile_id != 0)) {
                    return new WP_REST_Response(['success' => false, 'message' => 'Invalid parent category'], 400);
                }
            }
            
            $data['parent_id'] = $parent_id;
        }
        
        if (isset($params['description'])) {
            $data['description'] = sanitize_textarea_field($params['description']);
        }
        
        if (isset($params['is_active'])) {
            $data['is_active'] = filter_var($params['is_active'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }
        
        // Update category
        $updated = Unclutter_Category_Model::update_category($id, $data);
        
        if (!$updated) {
            return new WP_REST_Response(['success' => false, 'message' => 'Failed to update category'], 500);
        }
        
        // Get the updated category
        $category = Unclutter_Category_Model::get_category($id);
        
        return new WP_REST_Response(['success' => true, 'category' => $category], 200);
    }
    
    /**
     * Delete a category
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function delete_category($request) {
        $profile_id = self::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        
        $id = $request->get_param('id');
        $category = Unclutter_Category_Model::get_category($id);
        
        if (!$category) {
            return new WP_REST_Response(['success' => false, 'message' => 'Category not found'], 404);
        }
        
        // Check if the category belongs to the user (cannot delete system categories)
        if ($category->profile_id != $profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Cannot delete system categories'], 403);
        }
        
        // Delete category
        $deleted = Unclutter_Category_Model::delete_category($id);
        
        if (!$deleted) {
            return new WP_REST_Response(['success' => false, 'message' => 'Failed to delete category'], 500);
        }
        
        return new WP_REST_Response(['success' => true], 200);
    }
    
    /**
     * Search categories
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function search_categories($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        
        $search = sanitize_text_field($request->get_param('search'));
        $type = $request->get_param('type');
        
        if (empty($search)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Search term is required'], 400);
        }
        
        $categories = Unclutter_Category_Model::search_categories($profile_id, $search, $type);
        
        return new WP_REST_Response(['success' => true, 'categories' => $categories], 200);
    }
}
