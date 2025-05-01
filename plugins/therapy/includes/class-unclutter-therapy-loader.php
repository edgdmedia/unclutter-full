<?php
/**
 * Unclutter Therapy Loader
 * Handles plugin initialization, activation, and loading of modules for therapy features.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Therapy_Loader {
    /**
     * Initialize the therapy plugin
     */
    public static function init() {
        self::load_dependencies();
        self::register_hooks();
    }

    /**
     * Load all required files
     */
    private static function load_dependencies() {
        $base = plugin_dir_path(__FILE__);
        require_once $base . 'install/class-unclutter-therapy-db-installer.php';
        require_once $base . 'rest/class-unclutter-therapy-rest-router.php';
        require_once $base . 'services/class-unclutter-therapy-service.php';
        require_once $base . 'services/class-unclutter-therapist-service.php';
        require_once $base . 'services/class-unclutter-session-service.php';
        require_once $base . 'services/class-unclutter-booking-service.php';
        require_once $base . 'services/class-unclutter-form-service.php';
        require_once $base . 'services/class-unclutter-package-service.php';
        require_once $base . 'services/class-unclutter-coupon-service.php';
        require_once $base . 'services/class-unclutter-resource-service.php';
        require_once $base . 'services/class-unclutter-community-service.php';
        require_once $base . 'utils/class-unclutter-therapy-utils.php';
    }

    /**
     * Register plugin activation and REST API hooks
     */
    private static function register_hooks() {
        // Activation: create custom tables
        register_activation_hook(
            plugin_dir_path(dirname(__FILE__)) . 'unclutter-therapy.php',
            ['Unclutter_Therapy_DB_Installer', 'install']
        );

        // Register REST routes
        add_action('rest_api_init', ['Unclutter_Therapy_REST_Router', 'register_routes']);
    }
}
