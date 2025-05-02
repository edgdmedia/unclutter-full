<?php
if (!defined('ABSPATH')) exit;

/**
 * Account Service for Unclutter Finance
 * 
 * Business logic for financial accounts
 */
class Unclutter_Account_Service {
    /**
     * Get accounts by profile
     * 
     * @param int $profile_id Profile ID
     * @param array $args Additional arguments
     * @return array Array of accounts
     */
    public static function get_accounts($profile_id, $args = []) {
        return Unclutter_Account_Model::get_accounts_by_profile($profile_id, $args);
    }
    
    /**
     * Get a single account
     * 
     * @param int $id Account ID
     * @return object|null Account object or null if not found
     */
    public static function get_account($id) {
        return Unclutter_Account_Model::get_account($id);
    }
    
    /**
     * Create a new account
     * 
     * @param int $profile_id Profile ID
     * @param array $data Account data
     * @return int|false Account ID on success, false on failure
     */
    public static function create_account($profile_id, $data) {
        // Ensure profile_id is set
        $data['profile_id'] = $profile_id;
        
        // Insert account
        return Unclutter_Account_Model::insert_account($data);
    }
    
    /**
     * Update an account
     * 
     * @param int $id Account ID
     * @param array $data Account data
     * @return bool True on success, false on failure
     */
    public static function update_account($id, $data) {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($id);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        return Unclutter_Account_Model::update_account($id, $data);
    }
    
    /**
     * Delete an account
     * 
     * @param int $id Account ID
     * @return bool True on success, false on failure
     */
    public static function delete_account($id) {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($id);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        return Unclutter_Account_Model::delete_account($id);
    }
    
    /**
     * Get total balance for a profile
     * 
     * @param int $profile_id Profile ID
     * @param bool $active_only Only include active accounts
     * @return float Total balance
     */
    public static function get_total_balance($profile_id, $active_only = true) {
        return Unclutter_Account_Model::get_total_balance($profile_id, $active_only);
    }
    
    /**
     * Get accounts by type
     * 
     * @param int $profile_id Profile ID
     * @param int $type_id Account type ID
     * @param bool $active_only Only include active accounts
     * @return array Array of accounts
     */
    public static function get_accounts_by_type($profile_id, $type_id, $active_only = true) {
        return Unclutter_Account_Model::get_accounts_by_type($profile_id, $type_id, $active_only);
    }
    
    /**
     * Update account balance
     * 
     * @param int $id Account ID
     * @param float $amount Amount to add (positive) or subtract (negative)
     * @return bool True on success, false on failure
     */
    public static function update_balance($id, $amount) {
        return Unclutter_Account_Model::update_balance($id, $amount);
    }
    
    /**
     * Search accounts
     * 
     * @param int $profile_id Profile ID
     * @param string $search Search term
     * @return array Array of matching accounts
     */
    public static function search_accounts($profile_id, $search) {
        return Unclutter_Account_Model::search_accounts($profile_id, $search);
    }
    
    /**
     * Check if an account belongs to a profile
     * 
     * @param int $account_id Account ID
     * @param int $profile_id Profile ID
     * @return bool True if the account belongs to the profile
     */
    public static function account_belongs_to_profile($account_id, $profile_id) {
        $account = Unclutter_Account_Model::get_account($account_id);
        
        if (!$account) {
            return false;
        }
        
        return $account->profile_id == $profile_id;
    }
    
    /**
     * Get account balance history
     * 
     * @param int $account_id Account ID
     * @param string $start_date Start date (YYYY-MM-DD)
     * @param string $end_date End date (YYYY-MM-DD)
     * @return array Array of balance history data points
     */
    public static function get_balance_history($account_id, $start_date, $end_date) {
        global $wpdb;
        $transactions_table = $wpdb->prefix . 'unclutter_finance_transactions';
        
        // Get account
        $account = Unclutter_Account_Model::get_account($account_id);
        
        if (!$account) {
            return [];
        }
        
        // Get all transactions for this account in the date range
        $transactions = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $transactions_table 
             WHERE account_id = %d 
             AND transaction_date BETWEEN %s AND %s 
             ORDER BY transaction_date ASC, id ASC",
            $account_id,
            $start_date,
            $end_date
        ));
        
        if (empty($transactions)) {
            // No transactions, return single data point with current balance
            return [
                [
                    'date' => date('Y-m-d'),
                    'balance' => (float) $account->balance
                ]
            ];
        }
        
        // Calculate balance at the start date
        $start_balance = (float) $account->balance;
        
        // Subtract all transactions after the end date
        $after_end_sum = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) 
             FROM $transactions_table 
             WHERE account_id = %d AND transaction_date > %s",
            $account_id,
            $end_date
        ));
        
        if ($after_end_sum) {
            $start_balance -= (float) $after_end_sum;
        }
        
        // Add all transactions before the start date
        $before_start_sum = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) 
             FROM $transactions_table 
             WHERE account_id = %d AND transaction_date < %s",
            $account_id,
            $start_date
        ));
        
        if ($before_start_sum) {
            $start_balance += (float) $before_start_sum;
        }
        
        // Build balance history
        $history = [];
        $current_balance = $start_balance;
        $current_date = null;
        $daily_transactions = [];
        
        foreach ($transactions as $transaction) {
            $transaction_date = $transaction->transaction_date;
            
            // If date changed, add the previous day's balance
            if ($current_date !== null && $current_date != $transaction_date) {
                $history[] = [
                    'date' => $current_date,
                    'balance' => $current_balance,
                    'transactions' => $daily_transactions
                ];
                $daily_transactions = [];
            }
            
            // Update current date
            $current_date = $transaction_date;
            
            // Update balance
            $amount = (float) $transaction->amount;
            if ($transaction->type === 'expense') {
                $amount = -$amount;
            }
            $current_balance += $amount;
            
            // Add transaction to daily transactions
            $daily_transactions[] = [
                'id' => $transaction->id,
                'amount' => (float) $transaction->amount,
                'type' => $transaction->type,
                'description' => $transaction->description
            ];
        }
        
        // Add the last day's balance
        if ($current_date !== null) {
            $history[] = [
                'date' => $current_date,
                'balance' => $current_balance,
                'transactions' => $daily_transactions
            ];
        }
        
        return $history;
    }
}
