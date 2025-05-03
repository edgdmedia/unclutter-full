<?php
if (!defined('ABSPATH')) exit;

/**
 * Category Service for Unclutter Finance
 * 
 * Business logic for categories (unified taxonomy)
 */
class Unclutter_Category_Service {
    /**
     * Get categories by profile and type
     * 
     * @param int $profile_id Profile ID
     * @param string $type Category type (account_type, income, expense, tag, etc.)
     * @param array $args Additional arguments
     * @return array Array of categories
     */
    public static function get_categories($profile_id, $type = null, $args = []) {
        if ($type) {
            return Unclutter_Category_Model::get_categories_by_profile_and_type($profile_id, $type, $args);
        } else {
            $categories = [];
            
            // Get account types
            $account_types = Unclutter_Category_Model::get_categories_by_profile_and_type($profile_id, 'account_type', $args);
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
            
            return $categories;
        }
    }
    
    /**
     * Get category hierarchy
     * 
     * @param int $profile_id Profile ID
     * @param string $type Category type
     * @return array Array of categories with children
     */
    public static function get_category_hierarchy($profile_id, $type = null) {
        if ($type) {
            return Unclutter_Category_Model::get_category_hierarchy($profile_id, $type);
        } else {
            $hierarchy = [];
            
            // Get account types hierarchy
            $account_types = Unclutter_Category_Model::get_category_hierarchy($profile_id, 'account_type');
            foreach ($account_types as $category) {
                $hierarchy[] = $category;
            }
            
            // Get income categories hierarchy
            $income_categories = Unclutter_Category_Model::get_category_hierarchy($profile_id, 'income');
            foreach ($income_categories as $category) {
                $hierarchy[] = $category;
            }
            
            // Get expense categories hierarchy
            $expense_categories = Unclutter_Category_Model::get_category_hierarchy($profile_id, 'expense');
            foreach ($expense_categories as $category) {
                $hierarchy[] = $category;
            }
            
            // Get tags hierarchy
            $tags = Unclutter_Category_Model::get_category_hierarchy($profile_id, 'tag');
            foreach ($tags as $category) {
                $hierarchy[] = $category;
            }
            
            return $hierarchy;
        }
    }
    
    /**
     * Create a new category
     * 
     * @param int $profile_id Profile ID
     * @param array $data Category data
     * @return int|false Category ID on success, false on failure
     */
    public static function create_category($profile_id, $data) {
        // Ensure profile_id is set
        $data['profile_id'] = $profile_id;
        
        // Insert category
        return Unclutter_Category_Model::insert_category($data);
    }
    
    /**
     * Update a category
     * 
     * @param int $id Category ID
     * @param array $data Category data
     * @return bool True on success, false on failure
     */
    public static function update_category($id, $data) {
        return Unclutter_Category_Model::update_category($id, $data);
    }
    
    /**
     * Delete a category
     * 
     * @param int $id Category ID
     * @return bool True on success, false on failure
     */
    public static function delete_category($id) {
        return Unclutter_Category_Model::delete_category($id);
    }
    
    /**
     * Search categories
     * 
     * @param int $profile_id Profile ID
     * @param string $search Search term
     * @param string $type Optional category type filter
     * @return array Array of matching categories
     */
    public static function search_categories($profile_id, $search, $type = null) {
        return Unclutter_Category_Model::search_categories($profile_id, $search, $type);
    }
    
    /**
     * Check if a category belongs to a profile
     * 
     * @param int $category_id Category ID
     * @param int $profile_id Profile ID
     * @return bool True if the category belongs to the profile or is a system category
     */
    /**
     * Get a single category with children, checking profile authorization
     *
     * @param int $category_id
     * @param int $profile_id
     * @return array [success, data, message, status]
     */
    public static function get_category($category_id, $profile_id) {

    /**
     * Get a single category with children and budget details
     *
     * @param int $category_id
     * @param int $profile_id
     * @param int|null $month
     * @param int|null $year
     * @return array [success, data, message, status]
     */
    public static function get_category_details($category_id, $profile_id, $month = null, $year = null, $page = 1, $per_page = 20) {
        $category_result = self::get_category($category_id, $profile_id);
        if (!$category_result['success']) {
            return $category_result;
        }
        $category = $category_result['data'];
        // Default to current month/year if not provided
        if (!$month) $month = (int)date('n');
        if (!$year) $year = (int)date('Y');
        if (!$page || $page < 1) $page = 1;
        if (!$per_page || $per_page < 1) $per_page = 20;
        // Fetch the budget for this category/profile/month/year
        $budget = null;
        if (class_exists('Unclutter_Budget_Model')) {
            $budget = Unclutter_Budget_Model::get_budget_by_category_and_period([
                'profile_id' => $profile_id,
                'category_id' => $category_id,
                'month' => $month,
                'year' => $year
            ]);
        }
        // Prepare date range
        $start_date = sprintf('%04d-%02d-01', $year, $month);
        $end_date = date('Y-m-t', strtotime($start_date));
        // Always compute both totals
        $total_income = 0.0;
        $total_expense = 0.0;
        $transactions = [];
        $type = isset($category->type) ? $category->type : null;
        if (class_exists('Unclutter_Transaction_Model')) {
            $total_income = Unclutter_Transaction_Model::get_total_income($profile_id, $start_date, $end_date);
            $total_expense = Unclutter_Transaction_Model::get_total_expenses($profile_id, $start_date, $end_date);
            // Fetch all transactions for this category/period
            $all_transactions = Unclutter_Transaction_Model::get_transactions_by_profile($profile_id, [
                'category_id' => $category_id,
                'start_date' => $start_date,
                'end_date' => $end_date
            ]);
            $total = count($all_transactions);
            $total_pages = (int)ceil($total / $per_page);
            $offset = ($page - 1) * $per_page;
            $transactions = array_slice($all_transactions, $offset, $per_page);
        } else {
            $total = 0;
            $total_pages = 1;
        }
        $category->budget = $budget;
        $category->total_income = (float)$total_income;
        $category->total_expense = (float)$total_expense;
        $category->transactions = $transactions;
        $category->transactions_pagination = [
            'total' => $total,
            'page' => $page,
            'per_page' => $per_page,
            'total_pages' => $total_pages
        ];
        return [
            'success' => true,
            'data' => $category,
            'message' => '',
            'status' => 200
        ];
    }
        $category_result = self::get_category($category_id, $profile_id);
        if (!$category_result['success']) {
            return $category_result;
        }
        $category = $category_result['data'];
        // Default to current month/year if not provided
        if (!$month) $month = (int)date('n');
        if (!$year) $year = (int)date('Y');
        // Fetch the budget for this category/profile/month/year
        $budget = null;
        if (class_exists('Unclutter_Budget_Model')) {
            $budget = Unclutter_Budget_Model::get_budget_by_category_and_period([
                'profile_id' => $profile_id,
                'category_id' => $category_id,
                'month' => $month,
                'year' => $year
            ]);
        }
        // Prepare date range
        $start_date = sprintf('%04d-%02d-01', $year, $month);
        $end_date = date('Y-m-t', strtotime($start_date));
        // Detect category type and fetch totals/transactions
        $total = 0.0;
        $transactions = [];
        $type = isset($category->type) ? $category->type : null;
        if (class_exists('Unclutter_Transaction_Model')) {
            if ($type === 'income') {
                // Total income
                $total = Unclutter_Transaction_Model::get_total_income($profile_id, $start_date, $end_date);
                // All income transactions for this category/period
                $transactions = Unclutter_Transaction_Model::get_transactions_by_profile($profile_id, [
                    'category_id' => $category_id,
                    'type' => 'income',
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ]);
            } elseif ($type === 'expense') {
                // Total expense
                $total = Unclutter_Transaction_Model::get_total_expenses($profile_id, $start_date, $end_date);
                // All expense transactions for this category/period
                $transactions = Unclutter_Transaction_Model::get_transactions_by_profile($profile_id, [
                    'category_id' => $category_id,
                    'type' => 'expense',
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ]);
            } else {
                // For other types, fetch all transactions for this category/period
                $transactions = Unclutter_Transaction_Model::get_transactions_by_profile($profile_id, [
                    'category_id' => $category_id,
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ]);
            }
        }
        $category->budget = $budget;
        $category->total = (float)$total;
        $category->transactions = $transactions;
        return [
            'success' => true,
            'data' => $category,
            'message' => '',
            'status' => 200
        ];
    }
        $category_result = self::get_category($category_id, $profile_id);
        if (!$category_result['success']) {
            return $category_result;
        }
        $category = $category_result['data'];
        // Default to current month/year if not provided
        if (!$month) $month = (int)date('n');
        if (!$year) $year = (int)date('Y');
        // Fetch the budget for this category/profile/month/year
        $budget = null;
        if (class_exists('Unclutter_Budget_Model')) {
            $budget = Unclutter_Budget_Model::get_budget_by_category_and_period([
                'profile_id' => $profile_id,
                'category_id' => $category_id,
                'month' => $month,
                'year' => $year
            ]);
        }
        // Fetch total spent for this category/profile/month/year
        $spend = 0.0;
        if (class_exists('Unclutter_Transaction_Model')) {
            global $wpdb;
            $transactions_table = Unclutter_Transaction_Model::get_table_name();
            $start_date = sprintf('%04d-%02d-01', $year, $month);
            $end_date = date('Y-m-t', strtotime($start_date));
            $spend = $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(amount) FROM $transactions_table WHERE profile_id = %d AND category_id = %d AND type = 'expense' AND transaction_date BETWEEN %s AND %s",
                $profile_id,
                $category_id,
                $start_date,
                $end_date
            ));
            if (!$spend) $spend = 0.0;
        }
        $category->budget = $budget;
        $category->spend = (float)$spend;
        return [
            'success' => true,
            'data' => $category,
            'message' => '',
            'status' => 200
        ];
    }
        $category_result = self::get_category($category_id, $profile_id);
        if (!$category_result['success']) {
            return $category_result;
        }
        $category = $category_result['data'];
        // Default to current month/year if not provided
        if (!$month) $month = (int)date('n');
        if (!$year) $year = (int)date('Y');
        // Fetch the budget for this category/profile/month/year
        $budget = null;
        if (class_exists('Unclutter_Budget_Model')) {
            $budget = Unclutter_Budget_Model::get_budget_by_category_and_period([
                'profile_id' => $profile_id,
                'category_id' => $category_id,
                'month' => $month,
                'year' => $year
            ]);
        }
        $category->budget = $budget;
        return [
            'success' => true,
            'data' => $category,
            'message' => '',
            'status' => 200
        ];
    }
        $category = Unclutter_Category_Model::get_category($category_id);
        if (!$category) {
            return [
                'success' => false,
                'data' => null,
                'message' => 'Category not found',
                'status' => 404
            ];
        }
        // Check if the category belongs to the user or is a system category (profile_id = 0)
        if ($category->profile_id != $profile_id && $category->profile_id != 0) {
            return [
                'success' => false,
                'data' => null,
                'message' => 'Unauthorized',
                'status' => 401
            ];
        }
        // Get child categories
        $category->children = Unclutter_Category_Model::get_child_categories($category->id);
        return [
            'success' => true,
            'data' => $category,
            'message' => '',
            'status' => 200
        ];
    }

    public static function category_belongs_to_profile($category_id, $profile_id) {
        $category = Unclutter_Category_Model::get_category($category_id);
        
        if (!$category) {
            return false;
        }
        
        return $category->profile_id == $profile_id || $category->profile_id == 0;
    }
}
