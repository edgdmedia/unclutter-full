<?php
if (!defined('ABSPATH')) exit;

class Unclutter_Profile_Model
{

    public static function insert_profile($data)
    {
        global $wpdb;
        $wpdb->insert($wpdb->prefix . 'unclutter_profiles', $data);
        return $wpdb->insert_id;
    }
    public static function get_profile($profile_id)
    {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}unclutter_profiles WHERE id = %d",
            $profile_id
        ));
    }

    // Get profile by email (searches usermeta for email)
    public static function get_profile_by_email($email)
    {
        global $wpdb;
        $meta = $wpdb->get_row($wpdb->prepare(
            "SELECT profile_id FROM {$wpdb->prefix}unclutter_usermeta WHERE meta_key = %s AND meta_value = %s",
            'email',
            $email
        ));
        if (!$meta) return null;
        return self::get_profile($meta->profile_id);
    }

    public static function update_profile($profile_id, $fields)
    {
        global $wpdb;
        if (empty($fields)) return false;
        return $wpdb->update(
            $wpdb->prefix . 'unclutter_profiles',
            $fields,
            ['id' => $profile_id]
        );
    }

    // Get a profile by meta key/value
    public static function get_profile_by_meta($key, $value)
    {
        global $wpdb;
        $meta = $wpdb->get_row($wpdb->prepare(
            "SELECT profile_id FROM {$wpdb->prefix}unclutter_usermeta WHERE meta_key = %s AND meta_value = %s",
            $key,
            $value
        ));
        if (!$meta) return null;
        return self::get_profile($meta->profile_id);
    }

    public static function get_profile_by_field($field, $value)
    {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}unclutter_profiles WHERE $field = %s",
            $value
        ));
    }

    // Set a meta value for a profile
    public static function set_meta($profile_id, $data)
    {
        global $wpdb;
        foreach ($data as $key => $value) {
            $wpdb->insert(
                $wpdb->prefix . 'unclutter_usermeta',
                [
                    'profile_id' => $profile_id,
                    'meta_key' => $key,
                    'meta_value' => maybe_serialize($value),
                    'created_at' => current_time('mysql'),
                    'updated_at' => current_time('mysql')
                ]
            );
        }
    }

    // Get a meta value for a profile
    public static function get_meta($profile_id, $key)
    {
        global $wpdb;
        $val = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_value FROM {$wpdb->prefix}unclutter_usermeta WHERE profile_id = %d AND meta_key = %s",
            $profile_id,
            $key
        ));
        return maybe_unserialize($val);
    }

    //Unset a meta value for a profile
    public static function unset_meta($profile_id, $key)
    {
        global $wpdb;
        $wpdb->delete(
            $wpdb->prefix . 'unclutter_usermeta',
            [
                'profile_id' => $profile_id,
                'meta_key' => $key
            ]
        );
    }

    //Update a meta value for a profile
    public static function update_meta($profile_id, $key, $value)
    {
        global $wpdb;
        $wpdb->update(
            $wpdb->prefix . 'unclutter_usermeta',
            [
                'meta_value' => maybe_serialize($value),
                'updated_at' => current_time('mysql')
            ],
            [
                'profile_id' => $profile_id,
                'meta_key' => $key
            ]
        );
    }

    public static function set_preferences($profile_id, $preferences)
    {
        global $wpdb;
        $json = wp_json_encode($preferences);
        return $wpdb->update(
            $wpdb->prefix . 'unclutter_profiles',
            ['preferences' => $json],
            ['id' => $profile_id]
        );
    }

    public static function get_preferences($profile_id)
    {
        global $wpdb;
        $prefs = $wpdb->get_var($wpdb->prepare(
            "SELECT preferences FROM {$wpdb->prefix}unclutter_profiles WHERE id = %d",
            $profile_id
        ));
        return $prefs ? json_decode($prefs, true) : [];
    }
}
