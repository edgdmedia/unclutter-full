<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Logging_Model {
    public static function log_error($profile_id, $endpoint, $error_message, $error_code = null) {
        global $wpdb;
        return $wpdb->insert(
            $wpdb->prefix . 'unclutter_error_logs',
            [
                'profile_id' => $profile_id,
                'endpoint' => sanitize_text_field($endpoint),
                'error_message' => sanitize_textarea_field($error_message),
                'error_code' => $error_code,
                'created_at' => current_time('mysql')
            ]
        );
    }
    public static function log_audit($profile_id, $action, $details = []) {
        global $wpdb;
        return $wpdb->insert(
            $wpdb->prefix . 'unclutter_audit_logs',
            [
                'profile_id' => $profile_id,
                'action' => sanitize_text_field($action),
                'details' => wp_json_encode($details),
                'created_at' => current_time('mysql')
            ]
        );
    }
}
