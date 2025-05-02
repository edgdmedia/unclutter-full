<?php
/**
 * Class Unclutter_Budget_Service
 * Business logic for budgets
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Budget_Service {
    public static function get_budgets($request) {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($request);
        $params = $request->get_params();
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $params['profile_id'] = $profile_id;
        return Unclutter_Budget_Model::get_budgets($params);
    }
    public static function get_budget($id) {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($id);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        return Unclutter_Budget_Model::get_budget($id);
    }
    public static function create_budget($data) {
        return Unclutter_Budget_Model::insert_budget($data);
    }
    public static function update_budget($id, $data) {
        return Unclutter_Budget_Model::update_budget($id, $data);
    }
    public static function delete_budget($id) {
        return Unclutter_Budget_Model::delete_budget($id);
    }
}
