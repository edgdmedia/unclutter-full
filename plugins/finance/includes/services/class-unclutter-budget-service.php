<?php
/**
 * Class Unclutter_Budget_Service
 * Business logic for budgets
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Budget_Service {
    private $model;
    public function __construct() {
        $this->model = new Unclutter_Budget_Model();
    }
    public function get_budgets($params = []) {
        return $this->model->get_budgets($params);
    }
    public function get_budget($id) {
        return $this->model->get_budget($id);
    }
    public function create_budget($data) {
        return $this->model->insert_budget($data);
    }
    public function update_budget($id, $data) {
        return $this->model->update_budget($id, $data);
    }
    public function delete_budget($id) {
        return $this->model->delete_budget($id);
    }
}
