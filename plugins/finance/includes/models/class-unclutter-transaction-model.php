<?php
if (!defined('ABSPATH')) exit;

/**
 * Transaction Model for Unclutter Finance
 * 
 * Handles all database interactions for financial transactions
 */
class Unclutter_Transaction_Model extends Unclutter_Base_Model {
    protected static $fillable = [
        'profile_id', 'account_id', 'category_id', 'amount', 'transaction_date', 'type', 'notes', 'created_at', 'updated_at'
    ];
    /**
     * Get table name
     */
    protected static function get_table_name() {
        global $wpdb;
        return $wpdb->prefix . 'unclutter_finance_transactions';
    }
    
    /**
     * Get tags table name
     */
    private static function get_tags_table_name() {
        global $wpdb;
        return $wpdb->prefix . 'unclutter_finance_transaction_tags';
    }
    
    /**
     * Get attachments table name
     */
    private static function get_attachments_table_name() {
        global $wpdb;
        return $wpdb->prefix . 'unclutter_finance_transaction_attachments';
    }
    
    /**
     * Insert a new transaction
     * 
     * @param array $data Transaction data
     * @param array $tags Optional array of tag IDs
     * @param array $attachments Optional array of attachment URLs
     * @return int|false The transaction ID on success, false on failure
     */
    public static function insert_transaction($data) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Ensure required fields
        if (empty($data['profile_id']) || empty($data['account_id']) || 
            empty($data['category_id']) || !isset($data['amount']) || 
            empty($data['transaction_date']) || empty($data['type'])) {
            return false;
        }
        
        // Start transaction
        $wpdb->query('START TRANSACTION');
        
        try {
            // Set created_at and updated_at
            $data['created_at'] = current_time('mysql');
            $data['updated_at'] = current_time('mysql');
            
            // Insert transaction
            $result = $wpdb->insert($table, $data);
            
            if (!$result) {
                throw new Exception('Failed to insert transaction');
            }
            
            $transaction_id = $wpdb->insert_id;
            
            // Update account balance
            $amount = (float) $data['amount'];
            $type = $data['type'];
            
            // For expenses, amount should be negative when updating account balance
            if ($type === 'expense') {
                $amount = -$amount;
            }
            
            // Update account balance
            $account_updated = Unclutter_Account_Model::update_balance($data['account_id'], $amount);
            
            if (!$account_updated) {
                throw new Exception('Failed to update account balance');
            }
            
            // Commit transaction
            $wpdb->query('COMMIT');
            
            return $transaction_id;
        } catch (Exception $e) {
            // Rollback transaction on error
            $wpdb->query('ROLLBACK');
            return false;
        }
    }
    
    /**
     * Update a transaction
     * 
     * @param int $id Transaction ID
     * @param array $data Transaction data
     * @param array $tags Optional array of tag IDs (replaces existing tags)
     * @param array $attachments Optional array of attachment URLs (adds to existing attachments)
     * @return bool True on success, false on failure
     */
    public static function update_transaction($id, $data, $tags = null, $attachments = []) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Start transaction
        $wpdb->query('START TRANSACTION');
        
        try {
            // Get current transaction data for balance adjustment
            $current_transaction = self::get_transaction($id);
            
            if (!$current_transaction) {
                throw new Exception('Transaction not found');
            }
            
            // Set updated_at
            $data['updated_at'] = current_time('mysql');
            
            // If amount or type changed, adjust account balance
            if ((isset($data['amount']) && $data['amount'] != $current_transaction->amount) ||
                (isset($data['type']) && $data['type'] != $current_transaction->type) ||
                (isset($data['account_id']) && $data['account_id'] != $current_transaction->account_id)) {
                
                // Reverse the previous transaction effect on the account
                $reverse_amount = (float) $current_transaction->amount;
                if ($current_transaction->type === 'expense') {
                    $reverse_amount = -$reverse_amount;
                }
                
                // Reverse the effect on the original account
                $account_reversed = Unclutter_Account_Model::update_balance(
                    $current_transaction->account_id, 
                    -$reverse_amount
                );
                
                if (!$account_reversed) {
                    throw new Exception('Failed to adjust original account balance');
                }
                
                // Apply the new transaction effect
                $new_amount = isset($data['amount']) ? (float) $data['amount'] : (float) $current_transaction->amount;
                $new_type = isset($data['type']) ? $data['type'] : $current_transaction->type;
                $new_account_id = isset($data['account_id']) ? $data['account_id'] : $current_transaction->account_id;
                
                if ($new_type === 'expense') {
                    $new_amount = -$new_amount;
                }
                
                // Update the new account balance
                $account_updated = Unclutter_Account_Model::update_balance($new_account_id, $new_amount);
                
                if (!$account_updated) {
                    throw new Exception('Failed to update new account balance');
                }
            }
            
            // Update transaction
            $result = $wpdb->update(
                $table,
                $data,
                ['id' => $id]
            );
            
            if ($result === false) {
                throw new Exception('Failed to update transaction');
            }
            
            // Update tags if provided
            if ($tags !== null) {
                // Remove existing tags
                self::remove_all_tags_from_transaction($id);
                
                // Add new tags
                if (!empty($tags)) {
                    self::add_tags_to_transaction($id, $tags);
                }
            }
            
            // Add attachments if provided
            if (!empty($attachments)) {
                self::add_attachments_to_transaction($id, $attachments);
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
     * Delete a transaction
     * 
     * @param int $id Transaction ID
     * @return bool True on success, false on failure
     */
    public static function delete_transaction($profile_id, $id) {
        global $wpdb;
        $table = self::get_table_name();
        $tags_table = self::get_tags_table_name();
        $attachments_table = self::get_attachments_table_name();
        
        // Start transaction
        $wpdb->query('START TRANSACTION');
        
        try {
            // Get current transaction data for balance adjustment
            $transaction = self::get_transaction($profile_id, $id);
            
            if (!$transaction) {
                throw new Exception('Transaction not found');
            }
            
            // Reverse the transaction effect on the account
            $amount = (float) $transaction->amount;
            if ($transaction->type === 'expense') {
                $amount = -$amount;
            }
            
            // Reverse the effect on the account
            $account_updated = Unclutter_Account_Model::update_balance(
                $transaction->account_id, 
                -$amount
            );
            
            if (!$account_updated) {
                throw new Exception('Failed to adjust account balance');
            }
            
            // Delete transaction tags
            $wpdb->delete($tags_table, ['transaction_id' => $profile_id, $id]);
            
            // Delete transaction attachments
            $wpdb->delete($attachments_table, ['transaction_id' => $profile_id, $id]);
            
            // Delete transaction
            $result = $wpdb->delete($table, ['id' => $id]);
            
            if (!$result) {
                throw new Exception('Failed to delete transaction');
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
     * Get a transaction by ID
     * 
     * @param int $id Transaction ID
     * @return object|null Transaction object or null if not found
     */
    public static function get_transaction($profile_id, $id) {
        global $wpdb;
        $table = self::get_table_name();
        $accounts_table = $wpdb->prefix . 'unclutter_finance_accounts';
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        $transaction = $wpdb->get_row($wpdb->prepare(
            "SELECT t.*, 
                    a.name as account_name, 
                    c.name as category_name 
             FROM $table t 
             LEFT JOIN $accounts_table a ON t.account_id = a.id 
             LEFT JOIN $categories_table c ON t.category_id = c.id 
             WHERE t.id = %d AND t.profile_id = %d",
            $id,
            $profile_id
        ));
        
        return $transaction;
    }
    
    /**
     * Get transactions by profile ID
     * 
     * @param int $profile_id Profile ID
     * @param array $args Additional arguments (account_id, category_id, type, date range, etc.)
     * @param int $limit Limit results
     * @param int $offset Offset for pagination
     * @return array Array of transaction objects
     */
    public static function get_transactions_by_profile($profile_id, $args = [], $limit = 0, $offset = 0) {
        global $wpdb;
        $table = self::get_table_name();
        $accounts_table = $wpdb->prefix . 'unclutter_finance_accounts';
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        $query = "SELECT t.*, 
                        a.name as account_name, 
                        c.name as category_name 
                 FROM $table t 
                 LEFT JOIN $accounts_table a ON t.account_id = a.id 
                 LEFT JOIN $categories_table c ON t.category_id = c.id 
                 WHERE t.profile_id = %d";
        $params = [$profile_id];
        
        // Add account_id filter if provided
        if (isset($args['account_id'])) {
            $query .= " AND t.account_id = %d";
            $params[] = $args['account_id'];
        }
        
        // Add category_id filter if provided
        if (isset($args['category_id'])) {
            $query .= " AND t.category_id = %d";
            $params[] = $args['category_id'];
        }
        
        // Add type filter if provided
        if (isset($args['type'])) {
            $query .= " AND t.type = %s";
            $params[] = $args['type'];
        }
        
        // Add date range filter if provided
        if (isset($args['start_date'])) {
            $query .= " AND t.transaction_date >= %s";
            $params[] = $args['start_date'];
        }
        
        if (isset($args['end_date'])) {
            $query .= " AND t.transaction_date <= %s";
            $params[] = $args['end_date'];
        }
        
        // Add amount range filter if provided
        if (isset($args['min_amount'])) {
            $query .= " AND t.amount >= %f";
            $params[] = $args['min_amount'];
        }
        
        if (isset($args['max_amount'])) {
            $query .= " AND t.amount <= %f";
            $params[] = $args['max_amount'];
        }
        
        // Add search filter if provided
        if (isset($args['search'])) {
            $query .= " AND (t.description LIKE %s OR t.notes LIKE %s)";
            $search_term = '%' . $wpdb->esc_like($args['search']) . '%';
            $params[] = $search_term;
            $params[] = $search_term;
        }
        
        // Add tag filter if provided
        if (isset($args['tag_id'])) {
            $tags_table = self::get_tags_table_name();
            $query .= " AND t.id IN (SELECT transaction_id FROM $tags_table WHERE category_id = %d)";
            $params[] = $args['tag_id'];
        }
        
        // Add order by
        $query .= " ORDER BY t.transaction_date DESC, t.id DESC";
        
        // Add limit and offset if provided
        if ($limit > 0) {
            $query .= " LIMIT %d";
            $params[] = $limit;
            
            if ($offset > 0) {
                $query .= " OFFSET %d";
                $params[] = $offset;
            }
        }
        
        $transactions = $wpdb->get_results($wpdb->prepare($query, $params));
        
        // Get tags and attachments for each transaction
        foreach ($transactions as &$transaction) {
            $transaction->tags = self::get_transaction_tags($transaction->id);
            $transaction->attachments = self::get_transaction_attachments($transaction->id);
        }
        
        return $transactions;
    }
    
    /**
     * Count transactions by profile ID with filters
     * 
     * @param int $profile_id Profile ID
     * @param array $args Additional arguments (account_id, category_id, type, date range, etc.)
     * @return int Count of matching transactions
     */
    public static function count_transactions_by_profile($profile_id, $args = []) {
        global $wpdb;
        $table = self::get_table_name();
        
        $query = "SELECT COUNT(*) FROM $table t WHERE t.profile_id = %d";
        $params = [$profile_id];
        
        // Add account_id filter if provided
        if (isset($args['account_id'])) {
            $query .= " AND t.account_id = %d";
            $params[] = $args['account_id'];
        }
        
        // Add category_id filter if provided
        if (isset($args['category_id'])) {
            $query .= " AND t.category_id = %d";
            $params[] = $args['category_id'];
        }
        
        // Add type filter if provided
        if (isset($args['type'])) {
            $query .= " AND t.type = %s";
            $params[] = $args['type'];
        }
        
        // Add date range filter if provided
        if (isset($args['start_date'])) {
            $query .= " AND t.transaction_date >= %s";
            $params[] = $args['start_date'];
        }
        
        if (isset($args['end_date'])) {
            $query .= " AND t.transaction_date <= %s";
            $params[] = $args['end_date'];
        }
        
        // Add amount range filter if provided
        if (isset($args['min_amount'])) {
            $query .= " AND t.amount >= %f";
            $params[] = $args['min_amount'];
        }
        
        if (isset($args['max_amount'])) {
            $query .= " AND t.amount <= %f";
            $params[] = $args['max_amount'];
        }
        
        // Add search filter if provided
        if (isset($args['search'])) {
            $query .= " AND (t.description LIKE %s OR t.notes LIKE %s)";
            $search_term = '%' . $wpdb->esc_like($args['search']) . '%';
            $params[] = $search_term;
            $params[] = $search_term;
        }
        
        // Add tag filter if provided
        if (isset($args['tag_id'])) {
            $tags_table = self::get_tags_table_name();
            $query .= " AND t.id IN (SELECT transaction_id FROM $tags_table WHERE category_id = %d)";
            $params[] = $args['tag_id'];
        }
        
        return (int) $wpdb->get_var($wpdb->prepare($query, $params));
    }
    
    /**
     * Get transaction tags
     * 
     * @param int $transaction_id Transaction ID
     * @return array Array of tag objects
     */
    public static function get_transaction_tags($transaction_id) {
        global $wpdb;
        $tags_table = self::get_tags_table_name();
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT c.* 
             FROM $tags_table t 
             JOIN $categories_table c ON t.category_id = c.id 
             WHERE t.transaction_id = %d 
             ORDER BY c.name ASC",
            $transaction_id
        ));
    }
    
    /**
     * Add tags to a transaction
     * 
     * @param int $transaction_id Transaction ID
     * @param array $tag_ids Array of tag IDs
     * @return bool True on success, false on failure
     */
    public static function add_tags_to_transaction($transaction_id, $tag_ids) {
        global $wpdb;
        $tags_table = self::get_tags_table_name();
        
        foreach ($tag_ids as $tag_id) {
            // Check if tag already exists for this transaction
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM $tags_table WHERE transaction_id = %d AND category_id = %d",
                $transaction_id,
                $tag_id
            ));
            
            if (!$exists) {
                $result = $wpdb->insert(
                    $tags_table,
                    [
                        'transaction_id' => $transaction_id,
                        'category_id' => $tag_id,
                        'created_at' => current_time('mysql')
                    ]
                );
                
                if (!$result) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Remove a tag from a transaction
     * 
     * @param int $transaction_id Transaction ID
     * @param int $tag_id Tag ID
     * @return bool True on success, false on failure
     */
    public static function remove_tag_from_transaction($transaction_id, $tag_id) {
        global $wpdb;
        $tags_table = self::get_tags_table_name();
        
        $result = $wpdb->delete(
            $tags_table,
            [
                'transaction_id' => $transaction_id,
                'category_id' => $tag_id
            ]
        );
        
        return $result !== false;
    }
    
    /**
     * Remove all tags from a transaction
     * 
     * @param int $transaction_id Transaction ID
     * @return bool True on success, false on failure
     */
    public static function remove_all_tags_from_transaction($transaction_id) {
        global $wpdb;
        $tags_table = self::get_tags_table_name();
        
        $result = $wpdb->delete(
            $tags_table,
            ['transaction_id' => $transaction_id]
        );
        
        return $result !== false;
    }
    
    /**
     * Get transaction attachments
     * 
     * @param int $transaction_id Transaction ID
     * @return array Array of attachment objects
     */
    public static function get_transaction_attachments($transaction_id) {
        global $wpdb;
        $attachments_table = self::get_attachments_table_name();
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $attachments_table WHERE transaction_id = %d ORDER BY id ASC",
            $transaction_id
        ));
    }
    
    /**
     * Add attachments to a transaction
     * 
     * @param int $transaction_id Transaction ID
     * @param array $attachments Array of attachment URLs or attachment data arrays
     * @return bool True on success, false on failure
     */
    public static function add_attachments_to_transaction($transaction_id, $attachments) {
        global $wpdb;
        $attachments_table = self::get_attachments_table_name();
        
        foreach ($attachments as $attachment) {
            $data = [
                'transaction_id' => $transaction_id,
                'created_at' => current_time('mysql')
            ];
            
            if (is_array($attachment)) {
                $data['attachment_url'] = $attachment['url'];
                if (isset($attachment['type'])) {
                    $data['attachment_type'] = $attachment['type'];
                }
            } else {
                $data['attachment_url'] = $attachment;
            }
            
            $result = $wpdb->insert($attachments_table, $data);
            
            if (!$result) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Remove an attachment from a transaction
     * 
     * @param int $attachment_id Attachment ID
     * @return bool True on success, false on failure
     */
    public static function remove_attachment($attachment_id) {
        global $wpdb;
        $attachments_table = self::get_attachments_table_name();
        
        $result = $wpdb->delete(
            $attachments_table,
            ['id' => $attachment_id]
        );
        
        return $result !== false;
    }
    
    /**
     * Get total income for a profile within a date range
     * 
     * @param int $profile_id Profile ID
     * @param string $start_date Start date (YYYY-MM-DD)
     * @param string $end_date End date (YYYY-MM-DD)
     * @return float Total income
     */
    public static function get_total_income($profile_id, $start_date, $end_date) {
        global $wpdb;
        $table = self::get_table_name();
        
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM $table 
             WHERE profile_id = %d 
             AND type = 'income' 
             AND transaction_date BETWEEN %s AND %s",
            $profile_id,
            $start_date,
            $end_date
        ));
        
        return $total ? (float) $total : 0.00;
    }
    
    /**
     * Get total expenses for a profile within a date range
     * 
     * @param int $profile_id Profile ID
     * @param string $start_date Start date (YYYY-MM-DD)
     * @param string $end_date End date (YYYY-MM-DD)
     * @return float Total expenses
     */
    public static function get_total_expenses($profile_id, $start_date, $end_date) {
        global $wpdb;
        $table = self::get_table_name();
        
        $total = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM $table 
             WHERE profile_id = %d 
             AND type = 'expense' 
             AND transaction_date BETWEEN %s AND %s",
            $profile_id,
            $start_date,
            $end_date
        ));
        
        return $total ? (float) $total : 0.00;
    }
    
    /**
     * Get income and expenses by category for a profile within a date range
     * 
     * @param int $profile_id Profile ID
     * @param string $type Transaction type (income or expense)
     * @param string $start_date Start date (YYYY-MM-DD)
     * @param string $end_date End date (YYYY-MM-DD)
     * @return array Array of category totals
     */
    public static function get_totals_by_category($profile_id, $type, $start_date, $end_date) {
        global $wpdb;
        $table = self::get_table_name();
        $categories_table = $wpdb->prefix . 'unclutter_finance_categories';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT t.category_id, c.name as category_name, SUM(t.amount) as total 
             FROM $table t 
             JOIN $categories_table c ON t.category_id = c.id 
             WHERE t.profile_id = %d 
             AND t.type = %s 
             AND t.transaction_date BETWEEN %s AND %s 
             GROUP BY t.category_id 
             ORDER BY total DESC",
            $profile_id,
            $type,
            $start_date,
            $end_date
        ));
    }
    
    /**
     * Get income or expenses by account for a profile within a date range
     *
     * @param int $profile_id Profile ID
     * @param string $type Transaction type ('income' or 'expense')
     * @param string $start_date Start date (YYYY-MM-DD)
     * @param string $end_date End date (YYYY-MM-DD)
     * @return array Array of account totals
     */
    public static function get_totals_by_account($profile_id, $type, $start_date, $end_date) {
        global $wpdb;
        $table = self::get_table_name();
        $accounts_table = $wpdb->prefix . 'unclutter_finance_accounts';
        return $wpdb->get_results($wpdb->prepare(
            "SELECT t.account_id, a.name as account_name, SUM(t.amount) as total 
             FROM $table t 
             JOIN $accounts_table a ON t.account_id = a.id 
             WHERE t.profile_id = %d 
             AND t.type = %s 
             AND t.transaction_date BETWEEN %s AND %s 
             GROUP BY t.account_id 
             ORDER BY total DESC",
            $profile_id,
            $type,
            $start_date,
            $end_date
        ));
    }

    /**
     * Get income and expenses by date for a profile within a date range
     * 
     * @param int $profile_id Profile ID
     * @param string $interval Date interval (day, week, month, year)
     * @param string $start_date Start date (YYYY-MM-DD)
     * @param string $end_date End date (YYYY-MM-DD)
     * @return array Array of date totals
     */
    public static function get_totals_by_date($profile_id, $interval, $start_date, $end_date) {
        global $wpdb;
        $table = self::get_table_name();
        
        $date_format = '%Y-%m-%d'; // Default: day
        
        if ($interval === 'week') {
            $date_format = '%x-W%v'; // ISO year and week number
        } else if ($interval === 'month') {
            $date_format = '%Y-%m';
        } else if ($interval === 'year') {
            $date_format = '%Y';
        }
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT 
                DATE_FORMAT(transaction_date, %s) as date_group, 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income, 
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses 
             FROM $table 
             WHERE profile_id = %d 
             AND transaction_date BETWEEN %s AND %s 
             GROUP BY date_group 
             ORDER BY MIN(transaction_date) ASC",
            $date_format,
            $profile_id,
            $start_date,
            $end_date
        ));
    }
}
