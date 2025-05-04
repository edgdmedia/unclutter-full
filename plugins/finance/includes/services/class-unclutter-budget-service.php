<?php
/**
 * Class Unclutter_Budget_Service
 * Business logic for budgets
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Budget_Service {
    /**
     * Get all budgets
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_budgets($data) {
        return Unclutter_Budget_Model::get_budgets($data);
    }
    /**
     * Get a single budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function get_budget($data) {
        return Unclutter_Budget_Model::get_budget($data);
    }

    /**
     * Get a single budget by category and period
     *
     * @param array $data
     * @return WP_REST_Response
     */
    public static function get_budget_by_category_and_period($data) {
        return Unclutter_Budget_Model::get_budget_by_category_and_period($data);
    }
    /**
     * Create a new budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function create_budget($data) {
        // Validate required fields
        if (empty($data['category_id']) || !isset($data['amount']) || empty($data['month']) || empty($data['year'])) {
            return new WP_Error('missing_fields', __('Required fields missing.'), array('status' => 400));
        }
        // Check if budget already exists for this category and month/year
        $existing = Unclutter_Budget_Model::where([
            'profile_id' => $data['profile_id'],
            'category_id' => $data['category_id'],
            'month' => $data['month'],
            'year' => $data['year']
        ]);
        if (!empty($existing) && isset($existing[0]['id'])) {
            // Update existing budget
            $id = $existing[0]['id'];
            Unclutter_Budget_Model::update($id, $data);
            return $id;
        }
        // Insert new budget
        $result = Unclutter_Budget_Model::insert($data);
        if ($result) {
            return Unclutter_Budget_Model::get($result);
        }
        return new WP_Error('insert_failed', __('Failed to insert budget.'), array('status' => 500));
    }
    /**
     * Update a budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function update_budget($data) {
        // Validate required fields
        if (empty($data['category_id']) || !isset($data['amount']) || empty($data['month']) || empty($data['year'])) {
            return new WP_Error('missing_fields', __('Required fields missing.'), array('status' => 400));
        }
        return Unclutter_Budget_Model::update_budget($data['id'], $data);
    }
    /**
     * Delete a budget
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public static function delete_budget($profile_id, $id) {
        return Unclutter_Budget_Model::delete_budget($profile_id, $id);
    }
}
