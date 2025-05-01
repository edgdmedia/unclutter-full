<?php
/**
 * Unclutter Preferences Service
 * Handles user preferences logic.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Preferences_Service {
    /**
     * Get preferences for profile
     */
    public static function get($profile_id) {
        return Unclutter_Preferences_Model::get_preferences($profile_id);
    }

    /**
     * Set preferences for profile
     */
    public static function set($profile_id, $preferences) {
        return Unclutter_Preferences_Model::set_preferences($profile_id, $preferences);
    }
}
