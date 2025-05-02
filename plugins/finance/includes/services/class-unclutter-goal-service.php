<?php
/**
 * Class Unclutter_Goal_Service
 * Business logic for savings goals
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Goal_Service {
    private static $model;
    public function __construct() {
        self::$model = new Unclutter_Goal_Model();
    }
    public function get_goals($params = []) {
        return self::$model->get_goals($params);
    }
    public function get_goal($id) {
        return self::$model->get_goal($id);
    }
    public function create_goal($data) {
        return self::$model->insert_goal($data);
    }
    public function update_goal($id, $data) {
        return self::$model->update_goal($id, $data);
    }
    public function delete_goal($id) {
        return self::$model->delete_goal($id);
    }
}
