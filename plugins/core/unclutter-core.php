<?php
/**
 * Plugin Name: Unclutter Core
 * Description: Core plugin for user management, authentication, subscriptions, preferences, notifications, logging, and i18n for the Unclutter platform.
 * Version: 0.1.0
 * Author: Unclutter Team
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// add cors headers Access to fetch at 'https://dash.unclutter.com.ng/wp-json/api/v1/auth/login' from origin 'http://192.168.100.149:8081' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.

// Handle CORS for all requests including preflight OPTIONS requests
add_action('init', function () {
    $allowed_origins = [
        'http://localhost:8081',
        'http://localhost:8080',
        'http://192.168.100.155:8080',
        'http://192.168.100.155:8081',
        'https://dash.unclutter.com.ng',
        'https://finance.unclutter.com.ng',
        'https://unclutter.com.ng'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours
    }
    
    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});

// Add CORS headers to REST API responses
add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
    $allowed_origins = [
        'http://localhost:8081',
        'http://localhost:8080',
        'http://192.168.100.149:8080',
        'http://192.168.100.149:8081',
        'https://dash.unclutter.com.ng',
        'https://finance.unclutter.com.ng',
        'https://unclutter.com.ng'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours
    }
    
    return $served;
}, 10, 4);

// Autoload DB installer early for activation hook
require_once plugin_dir_path(__FILE__) . 'includes/install/class-unclutter-db-installer.php';
// Autoload core classes
require_once plugin_dir_path(__FILE__) . 'includes/class-unclutter-core-loader.php';

// Register activation hook for DB installer
register_activation_hook(__FILE__, ['Unclutter_DB_Installer', 'install']);

// Initialize the plugin
add_action('plugins_loaded', ['Unclutter_Core_Loader', 'init']);
