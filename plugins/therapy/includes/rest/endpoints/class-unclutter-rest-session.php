<?php
/**
 * Unclutter REST Session Endpoints
 * Handles therapy session API endpoints.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Session {
    public static function register() {
        register_rest_route('api/v1/therapy/sessions', '/', [
            'methods' => 'GET',
            'callback' => [self::class, 'list_sessions'],
            'permission_callback' => '__return_true',
        ]);
        // Add more session endpoints as needed
    }
    public static function list_sessions($request) {
        // TODO: List sessions
        return new WP_REST_Response(['message' => 'List sessions (to be implemented)'], 200);
    }
}
