<?php
/**
 * Unclutter REST Resource Endpoints
 * Handles resource sharing API endpoints.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Resource {
    public static function register() {
        register_rest_route('api/v1/therapy/resources', '/', [
            'methods' => 'GET',
            'callback' => [self::class, 'list_resources'],
            'permission_callback' => '__return_true',
        ]);
        // Add more resource endpoints as needed
    }
    public static function list_resources($request) {
        // TODO: List resources
        return new WP_REST_Response(['message' => 'List resources (to be implemented)'], 200);
    }
}
