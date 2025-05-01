<?php
/**
 * Unclutter Notification Service
 * Handles notifications and emails.
 */

if (!defined('ABSPATH')) exit;

class Unclutter_Notification_Service {
    /**
     * Send in-app notification to user
     */
    public static function send_notification($profile_id, $type, $content) {
        return Unclutter_Notification_Model::send_notification($profile_id, $type, $content);
    }

    /**
     * Send email to user (fetch email from profile)
     */
    public static function send_email($profile_id, $subject, $body) {
        $email = Unclutter_Notification_Model::get_email($profile_id);
        if (!$email) return false;
        return wp_mail($email, $subject, $body);
    }
}
