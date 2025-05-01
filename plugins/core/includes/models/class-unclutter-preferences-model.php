<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Preferences_Model {
    public static function get_preferences($profile_id) {
        global $wpdb;
        $prefs = $wpdb->get_var($wpdb->prepare(
            "SELECT preferences FROM {$wpdb->prefix}unclutter_profiles WHERE id = %d",
            $profile_id
        ));
        return $prefs ? json_decode($prefs, true) : [];
    }
    public static function set_preferences($profile_id, $preferences) {
        global $wpdb;
        $json = wp_json_encode($preferences);
        return $wpdb->update(
            $wpdb->prefix . 'unclutter_profiles',
            ['preferences' => $json],
            ['id' => $profile_id]
        );
    }
}
