<?php
/**
 * Unclutter REST Coupon Endpoints
 * Handles coupon API endpoints.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Coupon {
    public static function register() {
        register_rest_route('api/v1/therapy/coupons', '/', [
            'methods' => 'GET',
            'callback' => [self::class, 'list_coupons'],
            'permission_callback' => '__return_true',
        ]);
        // Add more coupon endpoints as needed
    }
    public static function list_coupons($request) {
        // TODO: List coupons
        return new WP_REST_Response(['message' => 'List coupons (to be implemented)'], 200);
    }
}
