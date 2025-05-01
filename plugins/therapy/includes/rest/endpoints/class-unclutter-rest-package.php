<?php
/**
 * Unclutter REST Package Endpoints
 * Handles session package API endpoints.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Package {
    public static function register() {
        register_rest_route('api/v1/therapy/packages', '/', [
            'methods' => 'GET',
            'callback' => [self::class, 'list_packages'],
            'permission_callback' => '__return_true',
        ]);
        // Add more package endpoints as needed
    }
    public static function list_packages($request) {
        // TODO: List packages
        return new WP_REST_Response(['message' => 'List packages (to be implemented)'], 200);
    }
}
