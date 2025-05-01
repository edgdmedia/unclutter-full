<?php
/**
 * Unclutter REST Form Endpoints
 * Handles pre-session form API endpoints.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Form {
    public static function register() {
        register_rest_route('api/v1/therapy/forms', '/', [
            'methods' => 'GET',
            'callback' => [self::class, 'list_forms'],
            'permission_callback' => '__return_true',
        ]);
        // Add more form endpoints as needed
    }
    public static function list_forms($request) {
        // TODO: List forms
        return new WP_REST_Response(['message' => 'List forms (to be implemented)'], 200);
    }
}
