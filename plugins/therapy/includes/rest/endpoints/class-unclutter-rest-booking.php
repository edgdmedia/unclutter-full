<?php
/**
 * Unclutter REST Booking Endpoints
 * Handles booking API endpoints.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Booking {
    public static function register() {
        register_rest_route('api/v1/therapy/bookings', '/', [
            'methods' => 'GET',
            'callback' => [self::class, 'list_bookings'],
            'permission_callback' => '__return_true',
        ]);
        // Add more booking endpoints as needed
    }
    public static function list_bookings($request) {
        // TODO: List bookings
        return new WP_REST_Response(['message' => 'List bookings (to be implemented)'], 200);
    }
}
