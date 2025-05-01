<?php
/**
 * Unclutter Core Loader
 * Handles plugin initialization, activation, and loading of modules.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Core_Loader {
    /**
     * Initialize the core plugin
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
        // Models
        require_once $base . 'models/class-unclutter-auth-model.php';
        require_once $base . 'models/class-unclutter-profile-model.php';
        require_once $base . 'models/class-unclutter-role-model.php';
        require_once $base . 'models/class-unclutter-subscription-model.php';
        require_once $base . 'models/class-unclutter-preferences-model.php';
        require_once $base . 'models/class-unclutter-notification-model.php';
        require_once $base . 'models/class-unclutter-logging-model.php';
        require_once $base . 'models/class-unclutter-i18n-model.php';
        // Services
        require_once $base . 'services/class-unclutter-auth-service.php';
        require_once $base . 'services/class-unclutter-profile-service.php';
        require_once $base . 'services/class-unclutter-role-service.php';
        require_once $base . 'services/class-unclutter-subscription-service.php';
        require_once $base . 'services/class-unclutter-preferences-service.php';
        require_once $base . 'services/class-unclutter-notification-service.php';
        require_once $base . 'services/class-unclutter-logging-service.php';
        require_once $base . 'services/class-unclutter-i18n-service.php';
        // Controllers
        require_once $base . 'controllers/class-unclutter-auth-controller.php';
        require_once $base . 'controllers/class-unclutter-profile-controller.php';
        require_once $base . 'controllers/class-unclutter-role-controller.php';
        require_once $base . 'controllers/class-unclutter-subscription-controller.php';
        require_once $base . 'controllers/class-unclutter-preferences-controller.php';
        require_once $base . 'controllers/class-unclutter-notification-controller.php';
        require_once $base . 'controllers/class-unclutter-logging-controller.php';
        require_once $base . 'controllers/class-unclutter-i18n-controller.php';
        require_once $base . 'install/class-unclutter-db-installer.php';
        require_once $base . 'utils/class-unclutter-utils.php';
    }

    /**
     * Register plugin activation and REST API hooks
     */
    private static function register_hooks() {
        // Register REST routes from controllers
        add_action('rest_api_init', function() {
            Unclutter_Auth_Controller::register_routes();
            Unclutter_Profile_Controller::register_routes();
            Unclutter_Role_Controller::register_routes();
            Unclutter_Subscription_Controller::register_routes();
            Unclutter_Preferences_Controller::register_routes();
            Unclutter_Notification_Controller::register_routes();
            Unclutter_Logging_Controller::register_routes();
            Unclutter_I18n_Controller::register_routes();
        });
    }
}
