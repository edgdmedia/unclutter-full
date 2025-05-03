<?php
if (!defined('ABSPATH')) exit;

/**
 * Transaction Service for Unclutter Finance
 * 
 * Business logic for financial transactions
 */
class Unclutter_Transaction_Service {
    /**
     * Get transactions by profile
     * 
     * @param int $profile_id Profile ID
     * @param array $args Additional arguments
     * @param int $limit Limit results
     * @param int $offset Offset for pagination
     * @return array Array of transactions
     */
    public static function get_transactions($profile_id, $args = [], $limit = 0, $offset = 0) {
        return Unclutter_Transaction_Model::get_transactions_by_profile($profile_id, $args, $limit, $offset);
    }
    
    /**
     * Count transactions by profile
     * 
     * @param int $profile_id Profile ID
     * @param array $args Additional arguments
     * @return int Count of transactions
     */
    public static function count_transactions($profile_id, $args = []) {
        return Unclutter_Transaction_Model::count_transactions_by_profile($profile_id, $args);
    }
    
    /**
     * Get a single transaction
     * 
     * @param int $id Transaction ID
     * @return object|null Transaction object or null if not found
     */
    public static function get_transaction($profile_id, $id) {
        $transaction = Unclutter_Transaction_Model::get_transaction($profile_id, $id);
        if (!$transaction) {
            return new WP_Error('not_found', __('Transaction not found.'), array('status' => 404));
        }
        $transaction->tags = Unclutter_Transaction_Model::get_transaction_tags($id);
        $transaction->attachments = Unclutter_Transaction_Model::get_transaction_attachments($id);
        return $transaction;
    }
    
    /**
     * Create a new transaction
     * 
     * @param int $profile_id Profile ID
     * @param array $data Transaction data
     * @param array $tags Optional array of tag IDs
     * @param array $attachments Optional array of attachment URLs
     * @return int|false Transaction ID on success, false on failure
     */
    /**
     * Create a new transaction for a profile
     * @param int $profile_id
     * @param array $data
     * @return array|WP_Error
     */
    public static function create_transaction($profile_id, $data) {
        // Validate required fields
        if (empty($data['amount']) || empty($data['type']) || empty($data['transaction_date'])) {
            return new WP_Error('missing_fields', 'Required fields: amount, type, transaction_date.');
        }
        $data['profile_id'] = $profile_id;

        // Extract tags and attachments, remove from $data
        $tags = isset($data['tags']) ? $data['tags'] : [];
        unset($data['tags']);
        $attachments = isset($data['attachments']) ? $data['attachments'] : [];
        unset($data['attachments']);

        // Insert transaction (only the main transaction fields)
        $transaction_id = Unclutter_Transaction_Model::insert_transaction($data);
        if (!$transaction_id) {
            return new WP_Error('db_error', 'Could not create transaction.');
        }
        // Add tags if provided
        if (!empty($tags)) {
            $success = Unclutter_Transaction_Model::add_tags_to_transaction($transaction_id, $tags);
            if (!$success) {
                return new WP_Error('db_error', 'Transaction created, but failed to add tags.');
            }
        }
        // Add attachments if provided
        if (!empty($attachments)) {
            $success = Unclutter_Transaction_Model::add_attachments_to_transaction($transaction_id, $attachments);
            if (!$success) {
                return new WP_Error('db_error', 'Transaction created, but failed to add attachments.');
            }
        }
        return Unclutter_Transaction_Model::get_transaction($profile_id, $transaction_id);
    }
    
    /**
     * Update a transaction
     * 
     * @param int $id Transaction ID
     * @param array $data Transaction data
     * @param array $tags Optional array of tag IDs
     * @param array $attachments Optional array of attachment URLs
     * @return bool True on success, false on failure
     */
    public static function update_transaction($profile_id, $id, $data) {
        // Get the original transaction for comparison
        $original = Unclutter_Transaction_Model::get_transaction($profile_id, $id);

        // Extract tags and attachments, remove from $data
        $tags = isset($data['tags']) ? $data['tags'] : [];
        unset($data['tags']);
        $attachments = isset($data['attachments']) ? $data['attachments'] : [];
        unset($data['attachments']);
        
        // Update transaction
        $updated = Unclutter_Transaction_Model::update_transaction($profile_id, $id, $data);

        // Add tags if provided
        if (!empty($tags)) {
            $success = Unclutter_Transaction_Model::add_tags_to_transaction($id, $tags);
            if (!$success) {
                return new WP_Error('db_error', 'Transaction created, but failed to add tags.');
            }
        }
        // Add attachments if provided
        if (!empty($attachments)) {
            $success = Unclutter_Transaction_Model::add_attachments_to_transaction($id, $attachments);
            if (!$success) {
                return new WP_Error('db_error', 'Transaction created, but failed to add attachments.');
            }
        }
        
        // Update percentage-based goals if this was an income transaction
        // and the amount or category changed
        if ($updated && 
            ($original->type === 'income' || (isset($data['type']) && $data['type'] === 'income')) && 
            (isset($data['amount']) || isset($data['category_id']))) {
            
            // Get the updated transaction
            $transaction = Unclutter_Transaction_Model::get_transaction($profile_id, $id);
            
            if ($transaction->type === 'income') {
                // If the amount changed, update goals based on the difference
                if (isset($data['amount']) && $data['amount'] != $original->amount) {
                    $amount_diff = $data['amount'] - $original->amount;
                    $category_id = isset($data['category_id']) ? $data['category_id'] : $original->category_id;
                    
                    Unclutter_Goal_Model::update_percentage_goals_from_income(
                        $transaction->profile_id, 
                        $amount_diff, 
                        $category_id
                    );
                }
                // If only the category changed, update goals based on the new category
                else if (isset($data['category_id']) && $data['category_id'] != $original->category_id) {
                    Unclutter_Goal_Model::update_percentage_goals_from_income(
                        $transaction->profile_id, 
                        $transaction->amount, 
                        $data['category_id']
                    );
                }
            }
        }
        
        return $updated;
    }
    
    /**
     * Delete a transaction
     * 
     * @param int $id Transaction ID
     * @return bool True on success, false on failure
     */
    public static function delete_transaction($profile_id, $id) {
        // Get the transaction before deleting it
        $transaction = Unclutter_Transaction_Model::get_transaction($profile_id, $id);
        
        if (!$transaction) {
            return false;
        }
        
        // Delete transaction
        $deleted = Unclutter_Transaction_Model::delete_transaction($profile_id, $id);
        
        // Update percentage-based goals if this was an income transaction
        if ($deleted && $transaction->type === 'income') {
            // Negative amount to reverse the effect
            $negative_amount = -$transaction->amount;
            
            Unclutter_Goal_Model::update_percentage_goals_from_income(
                $transaction->profile_id, 
                $negative_amount, 
                $transaction->category_id
            );
        }
        
        return $deleted;
    }
    
    /**
     * Add tags to a transaction
     * 
     * @param int $transaction_id Transaction ID
     * @param array $tag_ids Array of tag IDs
     * @return bool True on success, false on failure
     */
    public static function add_tags_to_transaction($transaction_id, $tag_ids) {
        return Unclutter_Transaction_Model::add_tags_to_transaction($transaction_id, $tag_ids);
    }
    
    /**
     * Remove a tag from a transaction
     * 
     * @param int $transaction_id Transaction ID
     * @param int $tag_id Tag ID
     * @return bool True on success, false on failure
     */
    public static function remove_tag_from_transaction($transaction_id, $tag_id) {
        return Unclutter_Transaction_Model::remove_tag_from_transaction($transaction_id, $tag_id);
    }
    
    /**
     * Add attachments to a transaction
     * 
     * @param int $transaction_id Transaction ID
     * @param array $attachments Array of attachment URLs or attachment data arrays
     * @return bool True on success, false on failure
     */
    public static function add_attachments_to_transaction($transaction_id, $attachments) {
        return Unclutter_Transaction_Model::add_attachments_to_transaction($transaction_id, $attachments);
    }
    
    /**
     * Remove an attachment from a transaction
     * 
     * @param int $attachment_id Attachment ID
     * @return bool True on success, false on failure
     */
    public static function remove_attachment($attachment_id) {
        return Unclutter_Transaction_Model::remove_attachment($attachment_id);
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
        return Unclutter_Transaction_Model::get_total_income($profile_id, $start_date, $end_date);
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
        return Unclutter_Transaction_Model::get_total_expenses($profile_id, $start_date, $end_date);
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
        return Unclutter_Transaction_Model::get_totals_by_category($profile_id, $type, $start_date, $end_date);
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
        return Unclutter_Transaction_Model::get_totals_by_date($profile_id, $interval, $start_date, $end_date);
    }
    
    /**
     * Check if a transaction belongs to a profile
     * 
     * @param int $transaction_id Transaction ID
     * @param int $profile_id Profile ID
     * @return bool True if the transaction belongs to the profile
     */
    public static function transaction_belongs_to_profile($transaction_id, $profile_id) {
        $transaction = Unclutter_Transaction_Model::get_transaction($profile_id, $transaction_id);
        
        if (!$transaction) {
            return false;
        }
        
        return $transaction->profile_id == $profile_id;
    }
    
    /**
     * Export transactions to CSV
     * 
     * @param int $profile_id Profile ID
     * @param array $args Additional arguments
     * @return string CSV content
     */
    public static function export_transactions_to_csv($profile_id, $args = []) {
        // Get transactions
        $transactions = Unclutter_Transaction_Model::get_transactions_by_profile($profile_id, $args);
        
        if (empty($transactions)) {
            return '';
        }
        
        // Create CSV content
        $csv = "Date,Type,Category,Account,Amount,Description,Notes\n";
        
        foreach ($transactions as $transaction) {
            $csv .= sprintf(
                '"%s","%s","%s","%s","%.2f","%s","%s"' . "\n",
                $transaction->transaction_date,
                $transaction->type,
                $transaction->category_name,
                $transaction->account_name,
                $transaction->amount,
                str_replace('"', '""', $transaction->description),
                str_replace('"', '""', $transaction->notes)
            );
        }
        
        return $csv;
    }
}
