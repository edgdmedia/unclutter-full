<?php
if (!defined('ABSPATH')) exit;

class Unclutter_I18n_Controller {
    public static function register_routes() {
        register_rest_route('api/v1/i18n', '/get', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_translation'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route('api/v1/i18n', '/set', [
            'methods' => 'POST',
            'callback' => [self::class, 'set_translation'],
            'permission_callback' => '__return_true',
        ]);
    }
    public static function get_translation($request) {
        $key = $request['key'] ?? '';
        $locale = $request['locale'] ?? '';
        $value = Unclutter_I18n_Service::get_translation($key, $locale);
        return new WP_REST_Response(['success' => true, 'value' => $value], 200);
    }
    public static function set_translation($request) {
        $params = $request->get_json_params();
        $result = Unclutter_I18n_Service::set_translation($params['key'] ?? '', $params['locale'] ?? '', $params['value'] ?? '');
        return new WP_REST_Response(['success' => (bool)$result], $result ? 200 : 400);
    }
}
