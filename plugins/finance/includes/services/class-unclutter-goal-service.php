<?php
/**
 * Class Unclutter_Goal_Service
 * Business logic for savings goals
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Goal_Service {
    private $model;
    public function __construct() {
        $this->model = new Unclutter_Goal_Model();
    }
    public function get_goals($params = []) {
        return $this->model->get_goals($params);
    }
    public function get_goal($id) {
        return $this->model->get_goal($id);
    }
    public function create_goal($data) {
        return $this->model->insert_goal($data);
    }
    public function update_goal($id, $data) {
        return $this->model->update_goal($id, $data);
    }
    public function delete_goal($id) {
        return $this->model->delete_goal($id);
    }
}
