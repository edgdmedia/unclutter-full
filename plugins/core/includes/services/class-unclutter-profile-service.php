<?php
/**
 * Unclutter Profile Service
 * Handles business logic for user profile management.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Profile_Service {
    /**
     * Fetch profile by ID
     */
    public static function get_profile($profile_id) {
        return Unclutter_Profile_Model::get_profile($profile_id);
    }

    /**
     * Update profile fields
     */
    public static function update_profile($profile_id, $data) {
        $fields = [];
        if (isset($data['display_name'])) {
            $fields['display_name'] = sanitize_text_field($data['display_name']);
        }
        if (isset($data['bio'])) {
            $fields['bio'] = sanitize_textarea_field($data['bio']);
        }
        // Add more fields as needed
        if (empty($fields)) return false;
        return Unclutter_Profile_Model::update_profile($profile_id, $fields);
    }

    /**
     * Update preferences JSON
     */
    public static function set_preferences($profile_id, $preferences) {
        return Unclutter_Profile_Model::set_preferences($profile_id, $preferences);
    }

    /**
     * Get preferences JSON
     */
    public static function get_preferences($profile_id) {
        return Unclutter_Profile_Model::get_preferences($profile_id);
    }

}

