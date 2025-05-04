<?php
/**
 * Class Unclutter_Goal_Controller
 * Handles REST API endpoints for managing savings goals
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Goal_Controller {
    public static function register_routes() {
        // Get all goals
        register_rest_route('api/v1/finance', '/goals', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_goals'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        // Create goal
        register_rest_route('api/v1/finance', '/goals', [
            'methods' => 'POST',
            'callback' => [self::class, 'create_goal'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        // Get single goal
        register_rest_route('api/v1/finance', '/goals/(?P<id>\\d+)', [
            'methods' => 'GET',
            'callback' => [self::class, 'get_goal'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        // Update goal
        register_rest_route('api/v1/finance', '/goals/(?P<id>\\d+)', [
            'methods' => 'PUT',
            'callback' => [self::class, 'update_goal'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
        // Delete goal
        register_rest_route('api/v1/finance', '/goals/(?P<id>\\d+)', [
            'methods' => 'DELETE',
            'callback' => [self::class, 'delete_goal'],
            'permission_callback' => [Unclutter_Auth_Service::class, 'auth_required'],
        ]);
    }

    public static function get_goals($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $params = $request->get_params();
        $params['profile_id'] = $profile_id;
        $result = Unclutter_Goal_Service::get_goals($params);
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
    public static function get_goal($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $result = Unclutter_Goal_Service::get_goal($id);
        if (!$result) {
            return new WP_Error('not_found', __('Goal not found.'), array('status' => 404));
        }
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
    public static function create_goal($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $data = $request->get_json_params();
        $data['profile_id'] = $profile_id;
        $result = Unclutter_Goal_Service::create_goal($data);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
    public function update_goal($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $data = $request->get_json_params();
        $result = Unclutter_Goal_Service::update_goal($id, $data);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['success' => true, 'data' => $result], 200);
    }
    public static function delete_goal($request) {
        $profile_id = Unclutter_Auth_Service::get_profile_id_from_token($request);
        $id = (int) $request['id'];
        $result = Unclutter_Goal_Service::delete_goal($id);
        if (is_wp_error($result)) {
            return $result;
        }
        return new WP_REST_Response(['deleted' => true], 200);
    }
}
