<?php
if (!defined('ABSPATH')) exit;

/**
 * Utility class for shared finance plugin methods
 */
class Unclutter_Finance_Utils
{
    /**
     * Authentication check wrapper
     * @param WP_REST_Request $request
     * @return bool
     */
    public static function auth_required($request)
    {
        return Unclutter_Auth_Service::auth_required($request);
    }

    /**
     * Extract profile ID from JWT token in Authorization header
     * @param WP_REST_Request $request
     * @return int|null
     */
    public static function get_profile_id_from_token($request)
    {
        $auth = $request->get_header('authorization');
        if (!$auth || stripos($auth, 'Bearer ') !== 0) return null;
        $jwt = trim(substr($auth, 7));
        $result = Unclutter_Auth_Service::verify_token($jwt);
        return $result && !empty($result['success']) ? $result['profile_id'] : null;
    }

    // Add more shared utility methods as needed
}
