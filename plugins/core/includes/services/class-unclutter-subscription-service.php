<?php
/**
 * Unclutter Subscription Service
 * Handles subscription logic and feature entitlements.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Subscription_Service {
    /**
     * Fetch subscription for profile
     */
    public static function get_subscription($profile_id) {
        return Unclutter_Subscription_Model::get_subscription($profile_id);
    }

    /**
     * Update subscription details
     */
    public static function update_subscription($profile_id, $data) {
        // Only allow certain fields to be updated
        $fields = [];
        if (isset($data['status'])) {
            $fields['status'] = sanitize_text_field($data['status']);
        }
        if (isset($data['expires_at'])) {
            $fields['expires_at'] = sanitize_text_field($data['expires_at']);
        }
        if (empty($fields)) return false;
        return Unclutter_Subscription_Model::update_subscription($profile_id, $fields);
    }

    /**
     * Check if profile has access to a feature (entitlement)
     */
    public static function check_entitlement($profile_id, $feature) {
        global $wpdb;
        // For demo: assume entitlements are stored as JSON in subscription row
        $subscription = self::get_subscription($profile_id);
        if (!$subscription) return false;
        $entitlements = isset($subscription->entitlements) ? json_decode($subscription->entitlements, true) : [];
        return in_array($feature, $entitlements);
    }
}

