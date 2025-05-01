<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Subscription_Model {
    public static function get_subscription($profile_id) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}unclutter_subscriptions WHERE profile_id = %d AND status = 'active' ORDER BY created_at DESC LIMIT 1",
            $profile_id
        ));
    }
    public static function update_subscription($profile_id, $fields) {
        global $wpdb;
        return $wpdb->update(
            $wpdb->prefix . 'unclutter_subscriptions',
            $fields,
            ['profile_id' => $profile_id]
        );
    }
}
