<?php
if (!defined('ABSPATH')) exit;

/**
 * Goal Model for Unclutter Finance
 * 
 * Handles all database interactions for savings goals
 */
class Unclutter_Goal_Model extends Unclutter_Base_Model {
    protected static $fillable = [
        'profile_id', 'name', 'target_amount', 'current_amount', 'start_date', 'target_date', 'status', 'goal_type', 'income_percentage', 'account_id', 'notes', 'created_at', 'updated_at'
    ];
    /**
     * Get table name
     */
    protected static function get_table_name() {
        global $wpdb;
        return $wpdb->prefix . 'unclutter_finance_goals';
    }
    
    /**
     * Insert a new goal
     * 
     * @param array $data Goal data
     * @return int|false The goal ID on success, false on failure
     */
    public static function insert_goal($data) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Ensure required fields
        if (empty($data['profile_id']) || empty($data['name']) || 
            !isset($data['target_amount']) || empty($data['start_date']) || 
            empty($data['target_date'])) {
            return false;
        }
        
        // Set default values if not provided
        if (!isset($data['current_amount'])) {
            $data['current_amount'] = 0.00;
        }
        
        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }
        
        if (!isset($data['goal_type'])) {
            $data['goal_type'] = 'fixed';
        }
        
        // Set created_at and updated_at
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        
        // Insert goal
        $result = $wpdb->insert($table, $data);
        
        return $result ? $wpdb->insert_id : false;
    }
    
    /**
     * Update a goal
     * 
     * @param int $id Goal ID
     * @param array $data Goal data
     * @return bool True on success, false on failure
     */
    public static function update_goal($id, $data) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Set updated_at
        $data['updated_at'] = current_time('mysql');
        
        // Update goal
        $result = $wpdb->update(
            $table,
            $data,
            ['id' => $id]
        );
        
        return $result !== false;
    }
    
    /**
     * Delete a goal
     * 
     * @param int $id Goal ID
     * @return bool True on success, false on failure
     */
    public static function delete_goal($id) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Delete goal
        $result = $wpdb->delete(
            $table,
            ['id' => $id]
        );
        
        return $result !== false;
    }
    
    /**
     * Get a goal by ID
     * 
     * @param int $id Goal ID
     * @return object|null Goal object or null if not found
     */
    public static function get_goal($id) {
        global $wpdb;
        $table = self::get_table_name();
        $accounts_table = $wpdb->prefix . 'unclutter_finance_accounts';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT g.*, a.name as account_name 
             FROM $table g 
             LEFT JOIN $accounts_table a ON g.account_id = a.id 
             WHERE g.id = %d",
            $id
        ));
    }

    /**
     * Get all goals
     * 
     * @param array $args Additional arguments (status, account_id, etc.)
     * @return array Array of goal objects
     */
    public static function get_goals($args = []) {
        global $wpdb;
        $table = self::get_table_name();
        $accounts_table = $wpdb->prefix . 'unclutter_finance_accounts';
        // profile_id is required
        if (empty($args['profile_id'])) {
            return [];
        }
        $query = "SELECT g.*, a.name as account_name FROM $table g LEFT JOIN $accounts_table a ON g.account_id = a.id WHERE g.profile_id = %d";
        $params = [(int)$args['profile_id']];
        // Add status filter if provided
        if (isset($args['status'])) {
            $query .= " AND g.status = %s";
            $params[] = $args['status'];
        }
        // Add account_id filter if provided
        if (isset($args['account_id'])) {
            $query .= " AND g.account_id = %d";
            $params[] = $args['account_id'];
        }
        // Add goal_type filter if provided
        if (isset($args['goal_type'])) {
            $query .= " AND g.goal_type = %s";
            $params[] = $args['goal_type'];
        }
        // Add name filter if provided (for goal_exists)
        if (isset($args['name'])) {
            $query .= " AND g.name = %s";
            $params[] = $args['name'];
        }
        // Add order by
        $query .= " ORDER BY g.target_date ASC";
        return $wpdb->get_results($wpdb->prepare($query, $params));
    }
    
    /**
     * Get goals by profile ID
     * 
     * @param int $profile_id Profile ID
     * @param array $args Additional arguments (status, account_id, etc.)
     * @return array Array of goal objects
     */
    public static function get_goals_by_profile($profile_id, $args = []) {
        global $wpdb;
        $table = self::get_table_name();
        $accounts_table = $wpdb->prefix . 'unclutter_finance_accounts';
        
        if (empty($profile_id)) {
            return [];
        }
        
        $query = "SELECT g.*, a.name as account_name 
                 FROM $table g 
                 LEFT JOIN $accounts_table a ON g.account_id = a.id 
                 WHERE g.profile_id = %d";
        $params = [(int)$profile_id];
        
        // Add status filter if provided
        if (isset($args['status'])) {
            $query .= " AND g.status = %s";
            $params[] = $args['status'];
        }
        
        // Add account_id filter if provided
        if (isset($args['account_id'])) {
            $query .= " AND g.account_id = %d";
            $params[] = $args['account_id'];
        }
        
        // Add goal_type filter if provided
        if (isset($args['goal_type'])) {
            $query .= " AND g.goal_type = %s";
            $params[] = $args['goal_type'];
        }
        
        // Add order by
        $query .= " ORDER BY g.target_date ASC";
        
        return $wpdb->get_results($wpdb->prepare($query, $params));
    }
    
    /**
     * Update goal progress
     * 
     * @param int $id Goal ID
     * @param float $amount Amount to add (positive) or subtract (negative)
     * @return bool True on success, false on failure
     */
    public static function update_goal_progress($id, $amount) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Get current goal data
        $goal = self::get_goal($id);
        
        if (!$goal) {
            return false;
        }
        
        // Calculate new amount
        $new_amount = (float) $goal->current_amount + (float) $amount;
        
        // Check if goal is completed
        $status = $goal->status;
        if ($new_amount >= (float) $goal->target_amount && $goal->status === 'active') {
            $status = 'completed';
        }
        
        // Update goal
        return self::update_goal($id, [
            'current_amount' => $new_amount,
            'status' => $status
        ]);
    }
    
    /**
     * Get goal progress history
     * 
     * @param int $id Goal ID
     * @param int $limit Limit results
     * @return array Array of transaction objects related to this goal
     */
    public static function get_goal_progress_history($id, $limit = 10) {
        global $wpdb;
        $goal_table = self::get_table_name();
        $transactions_table = $wpdb->prefix . 'unclutter_finance_transactions';
        $accounts_table = $wpdb->prefix . 'unclutter_finance_accounts';
        
        // Get goal data
        $goal = self::get_goal($id);
        
        if (!$goal || !$goal->account_id) {
            return [];
        }
        
        // Get transactions for this goal's account
        return $wpdb->get_results($wpdb->prepare(
            "SELECT t.*, a.name as account_name 
             FROM $transactions_table t 
             JOIN $accounts_table a ON t.account_id = a.id 
             WHERE t.account_id = %d 
             AND t.type = 'income' 
             AND t.transaction_date BETWEEN %s AND %s 
             ORDER BY t.transaction_date DESC 
             LIMIT %d",
            $goal->account_id,
            $goal->start_date,
            $goal->target_date,
            $limit
        ));
    }
    
    /**
     * Calculate goal progress percentage
     * 
     * @param object $goal Goal object
     * @return float Progress percentage
     */
    public static function calculate_goal_progress_percentage($goal) {
        if (!$goal || (float) $goal->target_amount <= 0) {
            return 0;
        }
        
        return ((float) $goal->current_amount / (float) $goal->target_amount) * 100;
    }
    
    /**
     * Calculate days remaining for a goal
     * 
     * @param object $goal Goal object
     * @return int Days remaining (negative if past due)
     */
    public static function calculate_days_remaining($goal) {
        if (!$goal) {
            return 0;
        }
        
        $now = time();
        $target_date = strtotime($goal->target_date);
        
        return floor(($target_date - $now) / (60 * 60 * 24));
    }
    
    /**
     * Calculate required monthly contribution to reach goal
     * 
     * @param object $goal Goal object
     * @return float Monthly contribution amount
     */
    public static function calculate_required_monthly_contribution($goal) {
        if (!$goal) {
            return 0;
        }
        
        $now = time();
        $start_date = strtotime($goal->start_date);
        $target_date = strtotime($goal->target_date);
        
        // If start date is in the future, use that instead of now
        $from_date = max($now, $start_date);
        
        // Calculate months remaining
        $months_remaining = max(1, (($target_date - $from_date) / (60 * 60 * 24 * 30)));
        
        // Calculate amount still needed
        $amount_needed = (float) $goal->target_amount - (float) $goal->current_amount;
        
        // If goal is already met or past due, return 0
        if ($amount_needed <= 0 || $target_date < $now) {
            return 0;
        }
        
        return $amount_needed / $months_remaining;
    }
    
    /**
     * Get percentage-based goals for a profile
     * 
     * @param int $profile_id Profile ID
     * @return array Array of percentage-based goal objects
     */
    public static function get_percentage_based_goals($profile_id) {
        return self::get_goals_by_profile($profile_id, [
            'status' => 'active',
            'goal_type' => 'percentage'
        ]);
    }
    
    /**
     * Update percentage-based goals based on income
     * 
     * @param int $profile_id Profile ID
     * @param float $income_amount Income amount
     * @param int $income_category_id Income category ID
     * @return bool True on success, false on failure
     */
    public static function update_percentage_goals_from_income($profile_id, $income_amount, $income_category_id) {
        // Get all active percentage-based goals
        $goals = self::get_percentage_based_goals($profile_id);
        
        if (empty($goals)) {
            return true; // No goals to update
        }
        
        $success = true;
        
        foreach ($goals as $goal) {
            // Check if this income category qualifies for this goal
            // If no income_percentage is set, skip this goal
            if (empty($goal->income_percentage)) {
                continue;
            }
            
            // Calculate contribution amount based on percentage
            $contribution = ($income_amount * (float) $goal->income_percentage) / 100;
            
            // Update goal progress
            $updated = self::update_goal_progress($goal->id, $contribution);
            
            if (!$updated) {
                $success = false;
            }
        }
        
        return $success;
    }
}
