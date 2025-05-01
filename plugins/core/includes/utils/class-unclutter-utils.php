<?php
/**
 * Unclutter Utils
 * Helper functions for the core plugin.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Utils {
    public static function sanitize($data) {
        // TODO: Implement sanitization logic
        return $data;
    }
    public static function validate_email($email) {
        // TODO: Implement email validation
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    // Add more helpers as needed
}
