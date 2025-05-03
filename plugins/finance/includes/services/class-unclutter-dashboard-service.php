<?php
/**
 * Class Unclutter_Dashboard_Service
 * Business logic for dashboard analytics
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
class Unclutter_Dashboard_Service {
    public static function get_summary($params = []) {
        // Aggregate summary: total income, expenses, balances, etc.
        $profile_id = isset($params['profile_id']) ? $params['profile_id'] : null;
        if (!$profile_id) {
            return [
                'total_income' => 0,
                'total_expenses' => 0,
                'net_balance' => 0,
                'accounts' => [],
            ];
        }
        // Date range (optional)
        $start_date = isset($params['start_date']) ? $params['start_date'] : null;
        $end_date = isset($params['end_date']) ? $params['end_date'] : null;
        if (!$start_date) $start_date = date('Y-01-01');
        if (!$end_date) $end_date = date('Y-m-d');
        // Total income
        $total_income = 0.0;
        $total_expenses = 0.0;
        if (class_exists('Unclutter_Transaction_Model')) {
            $total_income = (float)Unclutter_Transaction_Model::get_total_income($profile_id, $start_date, $end_date);
            $total_expenses = (float)Unclutter_Transaction_Model::get_total_expenses($profile_id, $start_date, $end_date);
        }
        $net_balance = $total_income - $total_expenses;
        // Accounts with balances
        $accounts = [];
        if (class_exists('Unclutter_Account_Model')) {
            $accounts = Unclutter_Account_Model::get_accounts_by_profile($profile_id);
        }
        return [
            'total_income' => $total_income,
            'total_expenses' => $total_expenses,
            'net_balance' => $net_balance,
            'accounts' => $accounts,
        ];
    }
    public static function get_trends($params = []) {
        // Return trends over time (e.g., monthly totals)
        $profile_id = isset($params['profile_id']) ? $params['profile_id'] : null;
        if (!$profile_id) {
            return [
                'labels' => [],
                'income' => [],
                'expenses' => [],
            ];
        }
        // How many months back?
        $months = isset($params['months']) ? (int)$params['months'] : 6;
        if ($months < 1) $months = 6;
        $labels = [];
        $income = [];
        $expenses = [];
        $now = new DateTime();
        // Gather month ranges
        for ($i = $months - 1; $i >= 0; $i--) {
            $month_date = (clone $now)->modify("-{$i} months");
            $label = $month_date->format('M Y');
            $labels[] = $label;
            $start_date = $month_date->format('Y-m-01');
            $end_date = $month_date->format('Y-m-t');
            $inc = 0.0;
            $exp = 0.0;
            if (class_exists('Unclutter_Transaction_Model')) {
                $inc = (float)Unclutter_Transaction_Model::get_total_income($profile_id, $start_date, $end_date);
                $exp = (float)Unclutter_Transaction_Model::get_total_expenses($profile_id, $start_date, $end_date);
            }
            $income[] = $inc;
            $expenses[] = $exp;
        }
        return [
            'labels' => $labels,
            'income' => $income,
            'expenses' => $expenses,
        ];
    }
}
