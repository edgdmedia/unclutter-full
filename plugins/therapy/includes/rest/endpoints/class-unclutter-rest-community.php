<?php
/**
 * Unclutter REST Community Endpoints
 * Handles community notes, comments, and reactions API endpoints.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Community {
    public static function register() {
        register_rest_route('api/v1/therapy/community', '/', [
            'methods' => 'GET',
            'callback' => [self::class, 'list_entries'],
            'permission_callback' => '__return_true',
        ]);
        // Add more community endpoints as needed
    }
    public static function list_entries($request) {
        // TODO: List community entries
        return new WP_REST_Response(['message' => 'List community entries (to be implemented)'], 200);
    }
}
