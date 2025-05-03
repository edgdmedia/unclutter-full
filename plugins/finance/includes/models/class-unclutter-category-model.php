<?php
if (!defined('ABSPATH')) exit;

/**
 * Category Model for Unclutter Finance
 * 
 * Handles all database interactions for the unified categories table
 * This includes account types, income categories, expense categories, tags, etc.
 */
class Unclutter_Category_Model extends Unclutter_Base_Model {
    protected static $fillable = [
        'profile_id', 'name', 'type', 'parent_id', 'is_active', 'created_at', 'updated_at'
    ];
    /**
     * Get table name
     */
    protected static function get_table_name() {
        global $wpdb;
        return $wpdb->prefix . 'unclutter_finance_categories';
    }
    
    /**
     * Insert a new category
     * 
     * @param array $data Category data
     * @return int|false The category ID on success, false on failure
     */
    public static function insert_category($data) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Ensure required fields
        if (empty($data['profile_id']) || empty($data['name']) || empty($data['type'])) {
            return false;
        }
        
        // Set created_at and updated_at
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        
        // Insert category
        $result = $wpdb->insert($table, $data);
        
        return $result ? $wpdb->insert_id : false;
    }
    
    /**
     * Update a category
     * 
     * @param int $id Category ID
     * @param array $data Category data
     * @return bool True on success, false on failure
     */
    public static function update_category($id, $data) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Set updated_at
        $data['updated_at'] = current_time('mysql');
        
        // Update category
        $result = $wpdb->update(
            $table,
            $data,
            ['id' => $id]
        );
        
        return $result !== false;
    }
    
    /**
     * Delete a category
     * 
     * @param int $id Category ID
     * @return bool True on success, false on failure
     */
    public static function delete_category($id) {
        global $wpdb;
        $table = self::get_table_name();
        
        // Delete category
        $result = $wpdb->delete(
            $table,
            ['id' => $id]
        );
        
        return $result !== false;
    }
    
    /**
     * Get a category by ID
     * 
     * @param int $id Category ID
     * @return object|null Category object or null if not found
     */
    public static function get_category($id) {
        global $wpdb;
        $table = self::get_table_name();
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $id
        ));
    }
    
    /**
     * Get categories by profile ID and type
     * 
     * @param int $profile_id Profile ID
     * @param string $type Category type (account_type, income, expense, tag, etc.)
     * @param array $args Additional arguments (parent_id, is_active, etc.)
     * @return array Array of category objects
     */
    public static function get_categories_by_profile_and_type($profile_id, $type, $args = []) {
        global $wpdb;
        $table = self::get_table_name();
        
        $query = "SELECT * FROM $table WHERE (profile_id = %d OR profile_id = 0) AND type = %s";
        $params = [$profile_id, $type];
        
        // Add parent_id filter if provided
        if (isset($args['parent_id'])) {
            if ($args['parent_id'] === null) {
                $query .= " AND parent_id IS NULL";
            } else {
                $query .= " AND parent_id = %d";
                $params[] = $args['parent_id'];
            }
        }
        
        // Add is_active filter if provided
        if (isset($args['is_active'])) {
            $query .= " AND is_active = %d";
            $params[] = $args['is_active'];
        }
        
        // Add order by
        $query .= " ORDER BY name ASC";
        
        return $wpdb->get_results($wpdb->prepare($query, $params));
    }
    
    /**
     * Get all account types (system + user defined)
     * 
     * @param int $profile_id Profile ID
     * @param bool $active_only Only return active account types
     * @return array Array of account type objects
     */
    public static function get_account_types($profile_id, $active_only = true) {
        $args = [];
        if ($active_only) {
            $args['is_active'] = 1;
        }
        
        return self::get_categories_by_profile_and_type($profile_id, 'account', $args);
    }
    
    /**
     * Get all income categories (system + user defined)
     * 
     * @param int $profile_id Profile ID
     * @param bool $active_only Only return active categories
     * @return array Array of income category objects
     */
    public static function get_income_categories($profile_id, $active_only = true) {
        $args = [];
        if ($active_only) {
            $args['is_active'] = 1;
        }
        
        return self::get_categories_by_profile_and_type($profile_id, 'income', $args);
    }
    
    /**
     * Get all expense categories (system + user defined)
     * 
     * @param int $profile_id Profile ID
     * @param bool $active_only Only return active categories
     * @return array Array of expense category objects
     */
    public static function get_expense_categories($profile_id, $active_only = true) {
        $args = [];
        if ($active_only) {
            $args['is_active'] = 1;
        }
        
        return self::get_categories_by_profile_and_type($profile_id, 'expense', $args);
    }
    
    /**
     * Get all tags (user defined)
     * 
     * @param int $profile_id Profile ID
     * @param bool $active_only Only return active tags
     * @return array Array of tag objects
     */
    public static function get_tags($profile_id, $active_only = true) {
        $args = [];
        if ($active_only) {
            $args['is_active'] = 1;
        }
        
        return self::get_categories_by_profile_and_type($profile_id, 'tag', $args);
    }
    
    /**
     * Get child categories
     * 
     * @param int $parent_id Parent category ID
     * @param bool $active_only Only return active categories
     * @return array Array of child category objects
     */
    public static function get_child_categories($parent_id, $active_only = true) {
        global $wpdb;
        $table = self::get_table_name();
        
        $query = "SELECT * FROM $table WHERE parent_id = %d";
        $params = [$parent_id];
        
        if ($active_only) {
            $query .= " AND is_active = 1";
        }
        
        $query .= " ORDER BY name ASC";
        
        return $wpdb->get_results($wpdb->prepare($query, $params));
    }
    
    /**
     * Get category hierarchy
     * 
     * @param int $profile_id Profile ID
     * @param string $type Category type
     * @param bool $active_only Only return active categories
     * @return array Array of category objects with children
     */
    public static function get_category_hierarchy($profile_id, $type, $active_only = true) {
        // Get all root categories (no parent)
        $args = ['parent_id' => null];
        if ($active_only) {
            $args['is_active'] = 1;
        }
        
        $root_categories = self::get_categories_by_profile_and_type($profile_id, $type, $args);
        
        // Add children to each root category
        foreach ($root_categories as &$category) {
            $category->children = self::get_child_categories($category->id, $active_only);
            
            // Add grandchildren recursively
            foreach ($category->children as &$child) {
                $child->children = self::get_child_categories($child->id, $active_only);
            }
        }
        
        return $root_categories;
    }
    
    /**
     * Search categories
     * 
     * @param int $profile_id Profile ID
     * @param string $search Search term
     * @param string $type Optional category type filter
     * @return array Array of matching category objects
     */
    public static function search_categories($profile_id, $search, $type = null) {
        global $wpdb;
        $table = self::get_table_name();
        
        $query = "SELECT * FROM $table WHERE (profile_id = %d OR profile_id = 0) AND name LIKE %s";
        $params = [$profile_id, '%' . $wpdb->esc_like($search) . '%'];
        
        if ($type) {
            $query .= " AND type = %s";
            $params[] = $type;
        }
        
        $query .= " ORDER BY name ASC LIMIT 20";
        
        return $wpdb->get_results($wpdb->prepare($query, $params));
    }
}
