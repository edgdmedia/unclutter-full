<?php
/**
 * Class Unclutter_Goal_Service
 * Business logic for savings goals
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Goal_Service {
    public static function get_goals($params = []) {
        if (empty($params['profile_id'])) {
            return new WP_Error('invalid_profile', 'Profile ID is required.');
        }
        // Only fetch goals for this profile
        $params['profile_id'] = (int)$params['profile_id'];
        return Unclutter_Goal_Model::get_goals($params);
    }
    public static function get_goal($id, $profile_id = null) {
        if (empty($profile_id)) {
            return new WP_Error('invalid_profile', 'Profile ID is required.');
        }
        $goal = Unclutter_Goal_Model::get_goal($id);
        if (!$goal || (isset($goal->profile_id) && (int)$goal->profile_id !== (int)$profile_id)) {
            return new WP_Error('not_found', 'Goal not found for this profile.');
        }
        return $goal;
    }
    public static function create_goal($data) {
        if (empty($data['profile_id']) || empty($data['name']) || empty($data['target_amount'])) {
            return new WP_Error('invalid_goal', 'Profile, name, and target amount are required.');
        }
        if (self::goal_exists($data['profile_id'], $data['name'])) {
            return new WP_Error('duplicate_goal', 'A goal with this name already exists for this profile.');
        }
        return Unclutter_Goal_Model::insert_goal($data);
    }
    public static function update_goal($id, $data) {
        if (empty($id) || empty($data['profile_id'])) {
            return new WP_Error('invalid_goal', 'Goal ID and profile ID are required.');
        }
        $goal = Unclutter_Goal_Model::get_goal($id);
        if (!$goal || (isset($goal->profile_id) && (int)$goal->profile_id !== (int)$data['profile_id'])) {
            return new WP_Error('not_found', 'Goal not found for this profile.');
        }
        if (!empty($data['name'])) {
            if ($goal->name !== $data['name'] && self::goal_exists($data['profile_id'], $data['name'])) {
                return new WP_Error('duplicate_goal', 'A goal with this name already exists for this profile.');
            }
        }
        return Unclutter_Goal_Model::update_goal($id, $data);
    }
    public static function delete_goal($id, $profile_id = null) {
        if (empty($id) || empty($profile_id)) {
            return new WP_Error('invalid_goal', 'Goal ID and profile ID are required.');
        }
        $goal = Unclutter_Goal_Model::get_goal($id);
        if (!$goal || (isset($goal->profile_id) && (int)$goal->profile_id !== (int)$profile_id)) {
            return new WP_Error('not_found', 'Goal not found for this profile.');
        }
        return Unclutter_Goal_Model::delete_goal($id);
    }
    public static function goal_exists($profile_id, $name) {
        $goals = Unclutter_Goal_Model::get_goals(['profile_id' => $profile_id, 'name' => $name]);
        return !empty($goals);
    }
}
