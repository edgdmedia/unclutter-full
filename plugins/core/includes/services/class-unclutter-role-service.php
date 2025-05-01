<?php
/**
 * Unclutter Role Service
 * Handles user roles and permissions.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Role_Service {
    /**
     * Return roles for profile
     */
    public static function get_roles($profile_id) {
        return Unclutter_Role_Model::get_roles($profile_id);
    }

    /**
     * Assign role to profile
     */
    public static function assign_role($profile_id, $role_name) {
        global $wpdb;
        $role_id = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}unclutter_roles WHERE name = %s",
            $role_name
        ));
        if (!$role_id) return false;
        // Prevent duplicates
        $exists = Unclutter_Role_Model::check_role_exists($profile_id, $role_id);
        if ($exists) return true;
        return Unclutter_Role_Model::assign_role($profile_id, $role_id);
    }

    /**
     * Remove role from profile
     */
    public static function remove_role($profile_id, $role_name) {
        $role_id = Unclutter_Role_Model::get_role_id($role_name);
        if (!$role_id) return false;
        return Unclutter_Role_Model::remove_role($profile_id, $role_id);
    }

    /**
     * Check if profile has permission (role-based)
     */
    public static function check_permission($profile_id, $permission) {
        $has = Unclutter_Role_Model::has_permission($profile_id, $permission);
        return !!$has;
    }
}
