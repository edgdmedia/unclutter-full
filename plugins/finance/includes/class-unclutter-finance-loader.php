<?php
if (!defined('ABSPATH')) exit;

/**
 * Main loader class for the Unclutter Finance plugin
 * 
 * Initializes all controllers, models, and services
 */
class Unclutter_Finance_Loader {
    /**
     * Initialize the plugin
     */
    public static function init() {
        self::load_dependencies();
        self::register_hooks();
    }
    
    /**
     * Load all required dependencies
     */
    private static function load_dependencies() {
        // Load utils
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/utils/class-unclutter-finance-utils.php';
        // Load models
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/models/class-unclutter-account-model.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/models/class-unclutter-transaction-model.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/models/class-unclutter-category-model.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/models/class-unclutter-budget-model.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/models/class-unclutter-goal-model.php';
        
        // Load services
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/services/class-unclutter-account-service.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/services/class-unclutter-transaction-service.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/services/class-unclutter-category-service.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/services/class-unclutter-budget-service.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/services/class-unclutter-goal-service.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/services/class-unclutter-dashboard-service.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/services/class-unclutter-report-service.php';
        
        // Load controllers
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/controllers/class-unclutter-account-controller.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/controllers/class-unclutter-transaction-controller.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/controllers/class-unclutter-category-controller.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/controllers/class-unclutter-budget-controller.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/controllers/class-unclutter-goal-controller.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/controllers/class-unclutter-dashboard-controller.php';
        require_once UNCLUTTER_FINANCE_PLUGIN_DIR . 'includes/controllers/class-unclutter-report-controller.php';
    }
    
    /**
     * Register all hooks and filters
     */
    private static function register_hooks() {
        // Register REST API routes
        add_action('rest_api_init', [self::class, 'register_routes']);
        
        // Register admin menu
        add_action('admin_menu', [self::class, 'register_admin_menu']);
        
        // Register assets
        add_action('wp_enqueue_scripts', [self::class, 'register_assets']);
        add_action('admin_enqueue_scripts', [self::class, 'register_admin_assets']);
    }
    
    /**
     * Register all REST API routes
     */
    public static function register_routes() {
        // Initialize all controllers which will register their routes
        Unclutter_Account_Controller::register_routes();
        Unclutter_Transaction_Controller::register_routes();
        Unclutter_Category_Controller::register_routes();
        Unclutter_Budget_Controller::register_routes();
        Unclutter_Goal_Controller::register_routes();
        Unclutter_Dashboard_Controller::register_routes();
        Unclutter_Report_Controller::register_routes();
    }
    
    /**
     * Register admin menu
     */
    public static function register_admin_menu() {
        add_menu_page(
            __('Unclutter Finance', 'unclutter-finance'),
            __('Finance', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance',
            [self::class, 'render_admin_page'],
            'dashicons-money-alt',
            30
        );
        
        // Add submenu pages
        add_submenu_page(
            'unclutter-finance',
            __('Dashboard', 'unclutter-finance'),
            __('Dashboard', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance',
            [self::class, 'render_admin_page']
        );
        
        add_submenu_page(
            'unclutter-finance',
            __('Accounts', 'unclutter-finance'),
            __('Accounts', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance-accounts',
            [self::class, 'render_accounts_page']
        );
        
        add_submenu_page(
            'unclutter-finance',
            __('Transactions', 'unclutter-finance'),
            __('Transactions', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance-transactions',
            [self::class, 'render_transactions_page']
        );
        
        add_submenu_page(
            'unclutter-finance',
            __('Categories', 'unclutter-finance'),
            __('Categories', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance-categories',
            [self::class, 'render_categories_page']
        );
        
        add_submenu_page(
            'unclutter-finance',
            __('Budgets', 'unclutter-finance'),
            __('Budgets', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance-budgets',
            [self::class, 'render_budgets_page']
        );
        
        add_submenu_page(
            'unclutter-finance',
            __('Goals', 'unclutter-finance'),
            __('Goals', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance-goals',
            [self::class, 'render_goals_page']
        );
        
        add_submenu_page(
            'unclutter-finance',
            __('Reports', 'unclutter-finance'),
            __('Reports', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance-reports',
            [self::class, 'render_reports_page']
        );
        
        add_submenu_page(
            'unclutter-finance',
            __('Settings', 'unclutter-finance'),
            __('Settings', 'unclutter-finance'),
            'manage_options',
            'unclutter-finance-settings',
            [self::class, 'render_settings_page']
        );
    }
    
    /**
     * Register frontend assets
     */
    public static function register_assets() {
        // Register and enqueue frontend styles
        wp_register_style(
            'unclutter-finance-styles',
            UNCLUTTER_FINANCE_PLUGIN_URL . 'assets/css/unclutter-finance.css',
            [],
            UNCLUTTER_FINANCE_VERSION
        );
        
        // Register and enqueue frontend scripts
        wp_register_script(
            'unclutter-finance-scripts',
            UNCLUTTER_FINANCE_PLUGIN_URL . 'assets/js/unclutter-finance.js',
            ['jquery'],
            UNCLUTTER_FINANCE_VERSION,
            true
        );
        
        // Localize script with data
        wp_localize_script('unclutter-finance-scripts', 'unclutterFinance', [
            'apiUrl' => rest_url('api/v1/finance/'),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }
    
    /**
     * Register admin assets
     */
    public static function register_admin_assets($hook) {
        // Only load on plugin pages
        if (strpos($hook, 'unclutter-finance') === false) {
            return;
        }
        
        // Register and enqueue admin styles
        wp_enqueue_style(
            'unclutter-finance-admin-styles',
            UNCLUTTER_FINANCE_PLUGIN_URL . 'assets/css/unclutter-finance-admin.css',
            [],
            UNCLUTTER_FINANCE_VERSION
        );
        
        // Register and enqueue admin scripts
        wp_enqueue_script(
            'unclutter-finance-admin-scripts',
            UNCLUTTER_FINANCE_PLUGIN_URL . 'assets/js/unclutter-finance-admin.js',
            ['jquery'],
            UNCLUTTER_FINANCE_VERSION,
            true
        );
        
        // Localize script with data
        wp_localize_script('unclutter-finance-admin-scripts', 'unclutterFinanceAdmin', [
            'apiUrl' => rest_url('api/v1/finance/'),
            'nonce' => wp_create_nonce('wp_rest'),
        ]);
    }
    
    /**
     * Render admin dashboard page
     */
    public static function render_admin_page() {
        echo '<div class="wrap">';
        echo '<h1>' . __('Unclutter Finance Dashboard', 'unclutter-finance') . '</h1>';
        echo '<div id="unclutter-finance-admin-app"></div>';
        echo '</div>';
    }
    
    /**
     * Render accounts page
     */
    public static function render_accounts_page() {
        echo '<div class="wrap">';
        echo '<h1>' . __('Accounts', 'unclutter-finance') . '</h1>';
        echo '<div id="unclutter-finance-accounts-app"></div>';
        echo '</div>';
    }
    
    /**
     * Render transactions page
     */
    public static function render_transactions_page() {
        echo '<div class="wrap">';
        echo '<h1>' . __('Transactions', 'unclutter-finance') . '</h1>';
        echo '<div id="unclutter-finance-transactions-app"></div>';
        echo '</div>';
    }
    
    /**
     * Render categories page
     */
    public static function render_categories_page() {
        echo '<div class="wrap">';
        echo '<h1>' . __('Categories', 'unclutter-finance') . '</h1>';
        echo '<div id="unclutter-finance-categories-app"></div>';
        echo '</div>';
    }
    
    /**
     * Render budgets page
     */
    public static function render_budgets_page() {
        echo '<div class="wrap">';
        echo '<h1>' . __('Budgets', 'unclutter-finance') . '</h1>';
        echo '<div id="unclutter-finance-budgets-app"></div>';
        echo '</div>';
    }
    
    /**
     * Render goals page
     */
    public static function render_goals_page() {
        echo '<div class="wrap">';
        echo '<h1>' . __('Savings Goals', 'unclutter-finance') . '</h1>';
        echo '<div id="unclutter-finance-goals-app"></div>';
        echo '</div>';
    }
    
    /**
     * Render reports page
     */
    public static function render_reports_page() {
        echo '<div class="wrap">';
        echo '<h1>' . __('Reports', 'unclutter-finance') . '</h1>';
        echo '<div id="unclutter-finance-reports-app"></div>';
        echo '</div>';
    }
    
    /**
     * Render settings page
     */
    public static function render_settings_page() {
        echo '<div class="wrap">';
        echo '<h1>' . __('Finance Settings', 'unclutter-finance') . '</h1>';
        echo '<div id="unclutter-finance-settings-app"></div>';
        echo '</div>';
    }
}
