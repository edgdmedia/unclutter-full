<?php
/**
 * Unclutter Logging Service
 * Handles error and audit logging.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Logging_Service {
    /**
     * Log error to unclutter_error_logs table
     */
    public static function log_error($profile_id, $endpoint, $error_message, $error_code = null) {
        return Unclutter_Logging_Model::log_error($profile_id, $endpoint, $error_message, $error_code);
    }

    /**
     * Log action to unclutter_audit_logs table
     */
    public static function log_audit($profile_id, $action, $details = []) {
        return Unclutter_Logging_Model::log_audit($profile_id, $action, $details);
    }
}
