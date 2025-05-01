<?php
/**
 * Plugin Name: Unclutter Therapy
 * Description: Therapy feature plugin for Unclutter. Handles therapists, bookings, sessions, forms, packages, coupons, resources, and community notes.
 * Version: 0.1.0
 * Author: Unclutter Team
 */

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// Autoload therapy classes
require_once plugin_dir_path(__FILE__) . 'includes/class-unclutter-therapy-loader.php';

// Initialize the plugin
add_action('plugins_loaded', ['Unclutter_Therapy_Loader', 'init']);
