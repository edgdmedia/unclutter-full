<?php
/**
 * Unclutter REST Therapist Endpoints
 * Handles therapist management API endpoints.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Therapist {
    public static function register() {
        register_rest_route('api/v1/therapy/therapists', '/', [
            'methods' => 'GET',
            'callback' => [self::class, 'list_therapists'],
            'permission_callback' => '__return_true',
        ]);
        // Add more therapist endpoints as needed
    }
    public static function list_therapists($request) {
        // TODO: List therapists
        return new WP_REST_Response(['message' => 'List therapists (to be implemented)'], 200);
    }
}
