<?php
/**
 * Base Model for Unclutter Finance
 * Provides generic CRUD operations for all models
 */
if (!defined('ABSPATH')) exit;

abstract class Unclutter_Base_Model {
    /**
     * Get table name (must be implemented by child)
     */
    abstract protected static function get_table_name();

    /**
     * Insert a new record
     */
    public static function insert($data) {
        global $wpdb;
        $table = static::get_table_name();
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        $result = $wpdb->insert($table, $data);
        return $result ? $wpdb->insert_id : false;
    }

    /**
     * Update a record by ID
     */
    public static function update($id, $data) {
        global $wpdb;
        $table = static::get_table_name();
        $data['updated_at'] = current_time('mysql');
        return $wpdb->update($table, $data, ['id' => $id]);
    }

    /**
     * Delete a record by ID
     */
    public static function delete($id) {
        global $wpdb;
        $table = static::get_table_name();
        return $wpdb->delete($table, ['id' => $id]);
    }

    /**
     * Get a record by ID
     */
    public static function get($id) {
        global $wpdb;
        $table = static::get_table_name();
        return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id), ARRAY_A);
    }

    /**
     * Get records by conditions (simple AND logic)
     */
    public static function where($conditions) {
        global $wpdb;
        $table = static::get_table_name();
        $where = [];
        $values = [];
        foreach ($conditions as $key => $value) {
            $where[] = "$key = %s";
            $values[] = $value;
        }
        $sql = "SELECT * FROM $table";
        if ($where) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        return $wpdb->get_results($wpdb->prepare($sql, ...$values), ARRAY_A);
    }
}
