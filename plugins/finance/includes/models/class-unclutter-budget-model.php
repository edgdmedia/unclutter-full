<?php
if (!defined('ABSPATH')) exit;

/**
 * Budget Model for Unclutter Finance
 * 
 * Handles all database interactions for budgets
 */
class Unclutter_Budget_Model {
    /**
     * Get table name
     */
    private static function get_table_name() {
        global $wpdb;
        return $wpdb->prefix . 'unclutter_finance_budgets';
    }
    
    /**
     * Insert a new budget
     * 
     * @param array $data Budget data
     * @return int|false The budget ID on success, false on failure
     */
    public static function insert_budget($data) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Ensure required fields
        if (empty($data['profile_id']) || empty($data['category_id']) || 
            !isset($data['amount']) || empty($data['month']) || empty($data['year'])) {
            return false;
        }
        
        // Check if budget already exists for this category and month/year
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table 
             WHERE profile_id = %d AND category_id = %d AND month = %d AND year = %d",
            $data['profile_id'],
            $data['category_id'],
            $data['month'],
            $data['year']
        ));
        
        if ($exists) {
            // Update existing budget
            return self::update_budget($exists, $data);
        }
        
        // Set created_at and updated_at
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        
        // Insert budget
        $result = $wpdb->insert($table, $data);
        
        return $result ? $wpdb->insert_id : false;
    }
    
    /**
     * Update a budget
     * 
     * @param int $id Budget ID
     * @param array $data Budget data
     * @return bool True on success, false on failure
     */
    public static function update_budget($id, $data) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Set updated_at
        $data['updated_at'] = current_time('mysql');
        
        // Update budget
        $result = $wpdb->update(
            $table,
            $data,
            ['id' => $id]
        );
        
        return $result !== false;
    }
    
    /**
     * Delete a budget
     * 
     * @param int $id Budget ID
     * @return bool True on success, false on failure
     */
    public static function delete_budget($id) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Delete budget
        $result = $wpdb->delete(
            $table,
            ['id' => $id]
        );
        
        return $result !== false;
    }

    /**
     * Get budgets 
     * 
     * @param array $params Query parameters
     * @return array Array of budget objects
     */
    public static function get_budgets($params = []) {
        global $wpdb;
        $table = self::get_table_name();
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT b.*, c.name as category_name 
             FROM $table b 
             LEFT JOIN $categories_table c ON b.category_id = c.id 
             WHERE b.profile_id = %d AND b.month = %d AND b.year = %d 
             ORDER BY b.amount DESC",
            $params['profile_id'],
            $params['month'],
            $params['year']
        ));
    }
    
    /**
     * Get a budget by ID
     * 
     * @param int $id Budget ID
     * @return object|null Budget object or null if not found
     */
    public static function get_budget($id) {
        global $wpdb;
        $table = self::get_table_name();
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT b.*, c.name as category_name 
             FROM $table b 
             LEFT JOIN $categories_table c ON b.category_id = c.id 
             WHERE b.id = %d",
            $id
        ));
    }
    
    /**
     * Get budgets by profile, month, and year
     * 
     * @param int $profile_id Profile ID
     * @param int $month Month (1-12)
     * @param int $year Year (e.g., 2025)
     * @return array Array of budget objects
     */
    public static function get_budgets_by_period($profile_id, $month, $year) {
        global $wpdb;
        $table = self::get_table_name();
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT b.*, c.name as category_name 
             FROM $table b 
             LEFT JOIN $categories_table c ON b.category_id = c.id 
             WHERE b.profile_id = %d AND b.month = %d AND b.year = %d 
             ORDER BY b.amount DESC",
            $profile_id,
            $month,
            $year
        ));
    }
    
    /**
     * Get budget by profile, category, month, and year
     * 
     * @param int $profile_id Profile ID
     * @param int $category_id Category ID
     * @param int $month Month (1-12)
     * @param int $year Year (e.g., 2025)
     * @return object|null Budget object or null if not found
     */
    public static function get_budget_by_category_and_period($profile_id, $category_id, $month, $year) {
        global $wpdb;
        $table = self::get_table_name();
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT b.*, c.name as category_name 
             FROM $table b 
             LEFT JOIN $categories_table c ON b.category_id = c.id 
             WHERE b.profile_id = %d AND b.category_id = %d AND b.month = %d AND b.year = %d",
            $profile_id,
            $category_id,
            $month,
            $year
        ));
    }
    
    /**
     * Get total budget amount for a period
     * 
     * @param int $profile_id Profile ID
     * @param int $month Month (1-12)
     * @param int $year Year (e.g., 2025)
     * @return float Total budget amount
     */
    public static function get_total_budget_for_period($profile_id, $month, $year) {
        global $wpdb;
        $table = self::get_table_name();
        
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM $table 
             WHERE profile_id = %d AND month = %d AND year = %d",
            $profile_id,
            $month,
            $year
        ));
        
        return $total ? (float) $total : 0.00;
    }
    
    /**
     * Get budget status with actual spending for a period
     * 
     * @param int $profile_id Profile ID
     * @param int $month Month (1-12)
     * @param int $year Year (e.g., 2025)
     * @return array Array of budget status objects
     */
    public static function get_budget_status_for_period($profile_id, $month, $year) {
        global $wpdb;
        $budgets_table = self::get_table_name();
        $transactions_table = $wpdb->prefix . 'unclutter_finance_transactions';
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        // Get start and end dates for the month
        $start_date = sprintf('%04d-%02d-01', $year, $month);
        $end_date = date('Y-m-t', strtotime($start_date));
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT 
                b.id, 
                b.category_id, 
                c.name as category_name, 
                b.amount as budget_amount, 
                COALESCE(SUM(t.amount), 0) as spent_amount, 
                (COALESCE(SUM(t.amount), 0) / b.amount) * 100 as percentage_used 
             FROM $budgets_table b 
             LEFT JOIN $categories_table c ON b.category_id = c.id 
             LEFT JOIN $transactions_table t ON 
                t.category_id = b.category_id AND 
                t.profile_id = b.profile_id AND 
                t.type = 'expense' AND 
                t.transaction_date BETWEEN %s AND %s 
             WHERE b.profile_id = %d AND b.month = %d AND b.year = %d 
             GROUP BY b.id 
             ORDER BY percentage_used DESC",
            $start_date,
            $end_date,
            $profile_id,
            $month,
            $year
        ));
    }
    
    /**
     * Get overall budget summary for a period
     * 
     * @param int $profile_id Profile ID
     * @param int $month Month (1-12)
     * @param int $year Year (e.g., 2025)
     * @return object Budget summary object
     */
    public static function get_budget_summary_for_period($profile_id, $month, $year) {
        global $wpdb;
        $budgets_table = self::get_table_name();
        $transactions_table = $wpdb->prefix . 'unclutter_finance_transactions';
        
        // Get start and end dates for the month
        $start_date = sprintf('%04d-%02d-01', $year, $month);
        $end_date = date('Y-m-t', strtotime($start_date));
        
        $summary = $wpdb->get_row($wpdb->prepare(
            "SELECT 
                SUM(b.amount) as total_budget, 
                COALESCE(SUM(t.amount), 0) as total_spent, 
                SUM(b.amount) - COALESCE(SUM(t.amount), 0) as remaining, 
                (COALESCE(SUM(t.amount), 0) / SUM(b.amount)) * 100 as percentage_used 
             FROM $budgets_table b 
             LEFT JOIN $transactions_table t ON 
                t.profile_id = b.profile_id AND 
                t.type = 'expense' AND 
                t.transaction_date BETWEEN %s AND %s 
             WHERE b.profile_id = %d AND b.month = %d AND b.year = %d",
            $start_date,
            $end_date,
            $profile_id,
            $month,
            $year
        ));
        
        // If no budgets exist, return default values
        if (!$summary || $summary->total_budget === null) {
            return (object) [
                'total_budget' => 0.00,
                'total_spent' => 0.00,
                'remaining' => 0.00,
                'percentage_used' => 0.00
            ];
        }
        
        return $summary;
    }
    
    /**
     * Copy budgets from one period to another
     * 
     * @param int $profile_id Profile ID
     * @param int $source_month Source month (1-12)
     * @param int $source_year Source year (e.g., 2025)
     * @param int $target_month Target month (1-12)
     * @param int $target_year Target year (e.g., 2025)
     * @return bool True on success, false on failure
     */
    public static function copy_budgets_to_new_period($profile_id, $source_month, $source_year, $target_month, $target_year) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Start transaction
        $wpdb->query('START TRANSACTION');
        
        try {
            // Get source budgets
            $source_budgets = self::get_budgets_by_period($profile_id, $source_month, $source_year);
            
            if (empty($source_budgets)) {
                // No source budgets to copy
                $wpdb->query('COMMIT');
                return true;
            }
            
            // Delete any existing budgets in the target period
            $wpdb->delete(
                $table,
                [
                    'profile_id' => $profile_id,
                    'month' => $target_month,
                    'year' => $target_year
                ]
            );
            
            // Insert new budgets for the target period
            foreach ($source_budgets as $budget) {
                $result = $wpdb->insert(
                    $table,
                    [
                        'profile_id' => $profile_id,
                        'category_id' => $budget->category_id,
                        'amount' => $budget->amount,
                        'month' => $target_month,
                        'year' => $target_year,
                        'notes' => $budget->notes,
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql')
                    ]
                );
                
                if (!$result) {
                    throw new Exception('Failed to copy budget');
                }
            }
            
            // Commit transaction
            $wpdb->query('COMMIT');
            
            return true;
        } catch (Exception $e) {
            // Rollback transaction on error
            $wpdb->query('ROLLBACK');
            return false;
        }
    }
    
    /**
     * Get budget history for a category
     * 
     * @param int $profile_id Profile ID
     * @param int $category_id Category ID
     * @param int $months Number of months to retrieve
     * @return array Array of budget history objects
     */
    public static function get_budget_history_for_category($profile_id, $category_id, $months = 12) {
        global $wpdb;
        $budgets_table = self::get_table_name();
        $transactions_table = $wpdb->prefix . 'unclutter_finance_transactions';
        
        // Get current month and year
        $current_month = date('n');
        $current_year = date('Y');
        
        $results = [];
        
        // Get budgets and spending for the past X months
        for ($i = 0; $i < $months; $i++) {
            $month = $current_month - $i;
            $year = $current_year;
            
            // Adjust for previous years
            while ($month <= 0) {
                $month += 12;
                $year -= 1;
            }
            
            // Get start and end dates for the month
            $start_date = sprintf('%04d-%02d-01', $year, $month);
            $end_date = date('Y-m-t', strtotime($start_date));
            
            // Get budget for this month
            $budget = self::get_budget_by_category_and_period($profile_id, $category_id, $month, $year);
            
            // Get spending for this month
            $spent = $wpdb->get_var($wpdb->prepare(
                "SELECT COALESCE(SUM(amount), 0) FROM $transactions_table 
                 WHERE profile_id = %d AND category_id = %d AND type = 'expense' 
                 AND transaction_date BETWEEN %s AND %s",
                $profile_id,
                $category_id,
                $start_date,
                $end_date
            ));
            
            $results[] = [
                'month' => $month,
                'year' => $year,
                'month_name' => date('F', strtotime($start_date)),
                'budget_amount' => $budget ? (float) $budget->amount : 0.00,
                'spent_amount' => (float) $spent,
                'percentage_used' => $budget && $budget->amount > 0 ? ((float) $spent / (float) $budget->amount) * 100 : 0
            ];
        }
        
        // Sort by date (oldest first)
        usort($results, function($a, $b) {
            return ($a['year'] * 12 + $a['month']) - ($b['year'] * 12 + $b['month']);
        });
        
        return $results;
    }
}
