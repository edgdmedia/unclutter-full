<?php
/**
 * Unclutter Therapy REST Router
 * Registers all REST API endpoints for the therapy plugin.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Therapy_REST_Router {
    public static function register_routes() {
        require_once __DIR__ . '/endpoints/class-unclutter-rest-therapist.php';
        Unclutter_REST_Therapist::register();

        require_once __DIR__ . '/endpoints/class-unclutter-rest-session.php';
        Unclutter_REST_Session::register();

        require_once __DIR__ . '/endpoints/class-unclutter-rest-booking.php';
        Unclutter_REST_Booking::register();

        require_once __DIR__ . '/endpoints/class-unclutter-rest-form.php';
        Unclutter_REST_Form::register();

        require_once __DIR__ . '/endpoints/class-unclutter-rest-package.php';
        Unclutter_REST_Package::register();

        require_once __DIR__ . '/endpoints/class-unclutter-rest-coupon.php';
        Unclutter_REST_Coupon::register();

        require_once __DIR__ . '/endpoints/class-unclutter-rest-resource.php';
        Unclutter_REST_Resource::register();

        require_once __DIR__ . '/endpoints/class-unclutter-rest-community.php';
        Unclutter_REST_Community::register();
    }
}
