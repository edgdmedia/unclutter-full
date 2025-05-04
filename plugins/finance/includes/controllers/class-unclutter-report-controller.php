<?php

/**
 * Class Unclutter_Report_Controller
 * Handles REST API endpoints for reports
 */
if (! defined('ABSPATH')) {
    exit;
}
class Unclutter_Report_Controller
{
    public static function register_routes()
    {  
        // Summary report
        register_rest_route('api/v1/finance', '/reports/summary', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_summary'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        // By category
        register_rest_route('api/v1/finance', '/reports/by-category', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_by_category'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        // By account
        register_rest_route('api/v1/finance', '/reports/by-account', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_by_account'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
    }

    public static function get_summary($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_params();
        $params['profile_id'] = $profile_id;
        $result = Unclutter_Report_Service::get_summary($params);
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
    public static function get_by_category($request)
    {   
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_params();
        $params['profile_id'] = $profile_id;
        $result = Unclutter_Report_Service::get_by_category($params);
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
    public static function get_by_account($request)
    {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_params();
        $params['profile_id'] = $profile_id;
        $result = Unclutter_Report_Service::get_by_account($params);
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
}
