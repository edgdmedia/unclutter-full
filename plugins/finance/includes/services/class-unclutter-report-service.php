<?php

/**
 * Class Unclutter_Report_Service
 * Business logic for financial reports
 */
if (! defined('ABSPATH')) {
    exit;
}
class Unclutter_Report_Service
{
    /**
     * Helper: Resolve date range from params (supports period presets)
     */
    private static function resolve_period($params)
    {
        $today = date('Y-m-d');
        $year = date('Y');
        $period = isset($params['period']) ? $params['period'] : null;
        switch ($period) {
            case 'today':
                return [$today, $today];
            case 'this_week':
                $start = date('Y-m-d', strtotime('monday this week'));
                return [$start, $today];
            case 'this_month':
                $start = date('Y-m-01');
                return [$start, $today];
            case 'last_month':
                $start = date('Y-m-01', strtotime('first day of last month'));
                $end = date('Y-m-t', strtotime('last month'));
                return [$start, $end];
            case 'this_year':
                $start = "$year-01-01";
                return [$start, $today];
            case 'custom':
                $start = isset($params['start_date']) ? $params['start_date'] : "$year-01-01";
                $end = isset($params['end_date']) ? $params['end_date'] : $today;
                return [$start, $end];
            default:
                // fallback: use custom or YTD
                $start = isset($params['start_date']) ? $params['start_date'] : "$year-01-01";
                $end = isset($params['end_date']) ? $params['end_date'] : $today;
                return [$start, $end];
        }
    }

    /**
     * Helper: breakdown by period (month/week/day)
     */
    private static function breakdown($data, $breakdown = 'month', $date_key = 'date')
    {
        $result = [];
        foreach ($data as $row) {
            $date = isset($row[$date_key]) ? $row[$date_key] : null;
            if (!$date) continue;
            $key = '';
            switch ($breakdown) {
                case 'day':
                    $key = date('Y-m-d', strtotime($date));
                    break;
                case 'week':
                    $key = date('o-W', strtotime($date));
                    break;
                case 'month':
                default:
                    $key = date('Y-m', strtotime($date));
                    break;
            }
            if (!isset($result[$key])) $result[$key] = [];
            $result[$key][] = $row;
        }
        return $result;
    }

    public static function get_summary($params = [])
    {
        // Require profile_id
        if (empty($params['profile_id'])) {
            return new WP_Error('invalid_profile', 'Profile ID is required.');
        }
        $profile_id = (int)$params['profile_id'];
        list($start_date, $end_date) = self::resolve_period($params);
        $filters = [
            'category_id' => isset($params['category_id']) ? $params['category_id'] : null,
            'account_id' => isset($params['account_id']) ? $params['account_id'] : null,
            'min_amount' => isset($params['min_amount']) ? $params['min_amount'] : null,
            'max_amount' => isset($params['max_amount']) ? $params['max_amount'] : null,
            'status' => isset($params['status']) ? $params['status'] : null,
        ];
        $income = 0.0;
        $expenses = 0.0;
        $breakdown = isset($params['breakdown']) ? $params['breakdown'] : null;
        if (class_exists('Unclutter_Transaction_Model')) {
            $income = (float)Unclutter_Transaction_Model::get_total_income($profile_id, $start_date, $end_date);
            $expenses = (float)Unclutter_Transaction_Model::get_total_expenses($profile_id, $start_date, $end_date);
        }
        $net = $income - $expenses;
        $result = [
            'income' => $income,
            'expenses' => $expenses,
            'net' => $net,
            'period' => [$start_date, $end_date],
            'filters' => $filters
        ];
        // Optional breakdown
        if ($breakdown && class_exists('Unclutter_Transaction_Model') && method_exists('Unclutter_Transaction_Model', 'get_transactions_by_profile')) {
            // Use default limit/offset unless specified in params
            $limit = isset($params['limit']) ? (int)$params['limit'] : 100;
            $offset = isset($params['offset']) ? (int)$params['offset'] : 0;
            $txs = Unclutter_Transaction_Model::get_transactions_by_profile(
                $profile_id,
                array_merge($filters, [
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ]),
                $limit,
                $offset
            );
            $result['breakdown'] = self::breakdown($txs, $breakdown); // Transactions limited by default to 100 unless overridden
        }
        return $result;
    }

    public static function get_by_category($params = [])
    {
        // Require profile_id
        if (empty($params['profile_id'])) {
            return new WP_Error('invalid_profile', 'Profile ID is required.');
        }
        $profile_id = (int)$params['profile_id'];
        list($start_date, $end_date) = self::resolve_period($params);
        $filters = [
            'account_id' => isset($params['account_id']) ? $params['account_id'] : null,
            'min_amount' => isset($params['min_amount']) ? $params['min_amount'] : null,
            'max_amount' => isset($params['max_amount']) ? $params['max_amount'] : null,
            'status' => isset($params['status']) ? $params['status'] : null,
        ];
        $type = isset($params['type']) ? $params['type'] : null; // income/expense/both
        $breakdown = isset($params['breakdown']) ? $params['breakdown'] : null;
        $categories = [];
        if (class_exists('Unclutter_Transaction_Model')) {
            if ($type === 'income' || $type === 'expense') {
                $categories = Unclutter_Transaction_Model::get_totals_by_category($profile_id, $type, $start_date, $end_date);
            } else {
                // Both: get both income and expense per category
                $income = Unclutter_Transaction_Model::get_totals_by_category($profile_id, 'income', $start_date, $end_date);
                $expense = Unclutter_Transaction_Model::get_totals_by_category($profile_id, 'expense', $start_date, $end_date);
                $categories = [
                    'income' => $income,
                    'expense' => $expense
                ];
            }
        }
        $result = [
            'categories' => $categories,
            'period' => [$start_date, $end_date],
            'filters' => $filters
        ];
        // Optional breakdown
        if ($breakdown && class_exists('Unclutter_Transaction_Model') && method_exists('Unclutter_Transaction_Model', 'get_transactions_by_profile')) {
            // Use default limit/offset unless specified in params
            $limit = isset($params['limit']) ? (int)$params['limit'] : 100;
            $offset = isset($params['offset']) ? (int)$params['offset'] : 0;
            $txs = Unclutter_Transaction_Model::get_transactions_by_profile(
                $profile_id,
                array_merge($filters, [
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ]),
                $limit,
                $offset
            );
            $result['breakdown'] = self::breakdown($txs, $breakdown, 'date');
        }
        return $result;
    }

    public static function get_by_account($params = [])
    {
        // Require profile_id
        if (empty($params['profile_id'])) {
            return new WP_Error('invalid_profile', 'Profile ID is required.');
        }
        $profile_id = (int)$params['profile_id'];
        list($start_date, $end_date) = self::resolve_period($params);
        $filters = [
            'category_id' => isset($params['category_id']) ? $params['category_id'] : null,
            'min_amount' => isset($params['min_amount']) ? $params['min_amount'] : null,
            'max_amount' => isset($params['max_amount']) ? $params['max_amount'] : null,
            'status' => isset($params['status']) ? $params['status'] : null,
        ];
        $type = isset($params['type']) ? $params['type'] : null; // income/expense/both
        $breakdown = isset($params['breakdown']) ? $params['breakdown'] : null;
        $accounts = [];
        if (class_exists('Unclutter_Transaction_Model')) {
            if (method_exists('Unclutter_Transaction_Model', 'get_totals_by_account')) {
                if ($type === 'income' || $type === 'expense') {
                    $accounts = Unclutter_Transaction_Model::get_totals_by_account($profile_id, $type, $start_date, $end_date);
                } else {
                    $income = Unclutter_Transaction_Model::get_totals_by_account($profile_id, 'income', $start_date, $end_date);
                    $expense = Unclutter_Transaction_Model::get_totals_by_account($profile_id, 'expense', $start_date, $end_date);
                    $accounts = [
                        'income' => $income,
                        'expense' => $expense
                    ];
                }
            }
        }
        $result = [
            'accounts' => $accounts,
            'period' => [$start_date, $end_date],
            'filters' => $filters
        ];
        // Optional breakdown
        if ($breakdown && class_exists('Unclutter_Transaction_Model') && method_exists('Unclutter_Transaction_Model', 'get_transactions_by_profile')) {
            // Use default limit/offset unless specified in params
            $limit = isset($params['limit']) ? (int)$params['limit'] : 100;
            $offset = isset($params['offset']) ? (int)$params['offset'] : 0;
            $txs = Unclutter_Transaction_Model::get_transactions_by_profile(
                $profile_id,
                array_merge($filters, [
                    'start_date' => $start_date,
                    'end_date' => $end_date
                ]),
                $limit,
                $offset
            );
            $result['breakdown'] = self::breakdown($txs, $breakdown, 'date');
        }
        return $result;
    }
}
