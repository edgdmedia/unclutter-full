<?php
if (!defined('ABSPATH')) exit;

class Unclutter_I18n_Model {
    public static function get_translation($key, $locale) {
        global $wpdb;
        return $wpdb->get_var($wpdb->prepare(
            "SELECT value FROM {$wpdb->prefix}unclutter_translations WHERE translation_key = %s AND locale = %s",
            $key, $locale
        ));
    }
    public static function set_translation($key, $locale, $value) {
        global $wpdb;
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$wpdb->prefix}unclutter_translations WHERE translation_key = %s AND locale = %s",
            $key, $locale
        ));
        if ($exists) {
            return $wpdb->update(
                $wpdb->prefix . 'unclutter_translations',
                ['value' => $value],
                ['translation_key' => $key, 'locale' => $locale]
            );
        } else {
            return $wpdb->insert(
                $wpdb->prefix . 'unclutter_translations',
                ['translation_key' => $key, 'locale' => $locale, 'value' => $value]
            );
        }
    }
}
