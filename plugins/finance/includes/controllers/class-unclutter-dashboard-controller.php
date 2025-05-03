<?php
/**
 * Class Unclutter_Dashboard_Controller
 * Handles REST API endpoints for dashboard analytics
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Dashboard_Controller {
    public static function register_routes() {
        // Dashboard summary
        register_rest_route('api/v1/finance', '/dashboard/summary', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_summary'],
            'permission_callback' => [Unclutter_Finance_Utils::class, 'auth_required'],
        ]);
        // Dashboard trends
        register_rest_route('api/v1/finance', '/dashboard/trends', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_trends'],
            'permission_callback' => [Unclutter_Finance_Utils::class, 'auth_required'],
        ]);
    }


    public static function get_summary($request) {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $params = $request->get_params();
        $params['profile_id'] = $profile_id;
        $result = Unclutter_Dashboard_Service::get_summary($params);
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
    public static function get_trends($request) {
        $profile_id = Unclutter_Finance_Utils::get_profile_id_from_token($request);
        if (!$profile_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $params = $request->get_params();
        $params['profile_id'] = $profile_id;
        $result = Unclutter_Dashboard_Service::get_trends($params);
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
}
