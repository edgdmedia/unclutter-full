<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Role_Model {
    public static function get_roles($profile_id) {
        global $wpdb;
        return $wpdb->get_results($wpdb->prepare(
            "SELECT r.* FROM {$wpdb->prefix}unclutter_roles r
            INNER JOIN {$wpdb->prefix}unclutter_profile_roles pr ON r.id = pr.role_id
            WHERE pr.profile_id = %d",
            $profile_id
        ));
    }
    public static function get_role_id($role_name) {
        global $wpdb;
        return $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}unclutter_roles WHERE name = %s",
            $role_name
        ));
    }
    public static function assign_role($profile_id, $role_id) {
        global $wpdb;
        return $wpdb->insert(
            $wpdb->prefix . 'unclutter_profile_roles',
            ['profile_id' => $profile_id, 'role_id' => $role_id]
        );
    }
    public static function remove_role($profile_id, $role_id) {
        global $wpdb;
        return $wpdb->delete(
            $wpdb->prefix . 'unclutter_profile_roles',
            ['profile_id' => $profile_id, 'role_id' => $role_id]
        );
    }
    public static function has_permission($profile_id, $permission) {
        global $wpdb;
        return $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}unclutter_roles r
            INNER JOIN {$wpdb->prefix}unclutter_profile_roles pr ON r.id = pr.role_id
            WHERE pr.profile_id = %d AND r.name = %s",
            $profile_id, $permission
        ));
    }
}
