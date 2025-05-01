<?php
/**
 * Unclutter I18n Service
 * Handles internationalization and translations.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_I18n_Service {
    public static function translate($key, $locale = null) {
        // Call the model method for DB access
        return Unclutter_I18n_Model::get_translation($key, $locale);
    }
}
