<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Notification_Model {
    public static function send_notification($profile_id, $type, $content) {
        global $wpdb;
        return $wpdb->insert(
            $wpdb->prefix . 'unclutter_notifications',
            [
                'profile_id' => $profile_id,
                'type' => sanitize_text_field($type),
                'content' => wp_json_encode($content),
                'created_at' => current_time('mysql')
            ]
        );
    }
    public static function get_notifications($profile_id) {
        global $wpdb;
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}unclutter_notifications WHERE profile_id = %d ORDER BY created_at DESC",
            $profile_id
        ));
    }
}
