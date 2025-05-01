<?php
/**
 * Unclutter REST Router
 * Registers all core REST API routes.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_REST_Router {
    public static function register_routes() {
        // Auth endpoints
        require_once __DIR__ . '/../rest/endpoints/class-unclutter-rest-auth.php';
        Unclutter_REST_Auth::register();

        // Profile endpoints
        require_once __DIR__ . '/../rest/endpoints/class-unclutter-rest-profile.php';
        Unclutter_REST_Profile::register();

        // Role endpoints
        require_once __DIR__ . '/../rest/endpoints/class-unclutter-rest-role.php';
        Unclutter_REST_Role::register();

        // Subscription endpoints
        require_once __DIR__ . '/../rest/endpoints/class-unclutter-rest-subscription.php';
        Unclutter_REST_Subscription::register();

        // Notification endpoints
        require_once __DIR__ . '/../rest/endpoints/class-unclutter-rest-notification.php';
        Unclutter_REST_Notification::register();

        // Preferences endpoints
        require_once __DIR__ . '/../rest/endpoints/class-unclutter-rest-preferences.php';
        Unclutter_REST_Preferences::register();

        // Logging endpoints
        require_once __DIR__ . '/../rest/endpoints/class-unclutter-rest-logging.php';
        Unclutter_REST_Logging::register();

        // I18n endpoints
        require_once __DIR__ . '/../rest/endpoints/class-unclutter-rest-i18n.php';
        Unclutter_REST_I18n::register();
    }
}
