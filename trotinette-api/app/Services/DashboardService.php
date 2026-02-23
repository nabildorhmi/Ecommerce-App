<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private function applyFilters($query, array $filters)
    {
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['month'])) {
            $query->whereMonth('created_at', $filters['month']);
        }

        if (!empty($filters['year'])) {
            $query->whereYear('created_at', $filters['year']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query;
    }

    public function getKpis(array $filters): array
    {
        // Total orders
        $ordersQuery = Order::query();
        $this->applyFilters($ordersQuery, $filters);
        $totalOrders = $ordersQuery->count();

        // Orders by status
        $statusQuery = Order::query();
        $statusFiltersWithoutStatus = array_diff_key($filters, ['status' => '']);
        $this->applyFilters($statusQuery, $statusFiltersWithoutStatus);

        $ordersByStatus = $statusQuery
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                $status = OrderStatus::from($item->status);
                return [
                    'status' => $item->status,
                    'label' => $status->label(),
                    'count' => $item->count,
                ];
            })
            ->toArray();

        // Total revenue (only delivered orders)
        $revenueQuery = Order::query()->where('status', OrderStatus::DELIVERED->value);
        $revenueFiltersWithoutStatus = array_diff_key($filters, ['status' => '']);
        $this->applyFilters($revenueQuery, $revenueFiltersWithoutStatus);
        $totalRevenue = $revenueQuery->sum('total');

        // Average order value (delivered only)
        $deliveredCount = Order::query()
            ->where('status', OrderStatus::DELIVERED->value);
        $this->applyFilters($deliveredCount, $revenueFiltersWithoutStatus);
        $deliveredCount = $deliveredCount->count();

        $averageOrderValue = $deliveredCount > 0 ? (int) ($totalRevenue / $deliveredCount) : 0;

        // Best selling products
        $productQuery = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id');
        $this->applyFilters($productQuery, $revenueFiltersWithoutStatus);

        $bestSellingProducts = $productQuery
            ->select('order_items.product_id', 'order_items.product_name', DB::raw('SUM(order_items.quantity) as total_quantity'))
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'total_quantity' => (int) $item->total_quantity,
            ])
            ->toArray();

        // Best selling categories by revenue
        $categoryQuery = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.status', OrderStatus::DELIVERED->value);
        $this->applyFilters($categoryQuery, $revenueFiltersWithoutStatus);

        $bestSellingCategories = $categoryQuery
            ->select(
                'categories.id as category_id',
                'categories.name as category_name',
                DB::raw('SUM(order_items.unit_price * order_items.quantity) as total_revenue')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'category_id' => $item->category_id,
                'category_name' => $item->category_name,
                'total_revenue' => (int) $item->total_revenue,
            ])
            ->toArray();

        // New customers
        $customerQuery = User::query();
        if (!empty($filters['date_from'])) {
            $customerQuery->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $customerQuery->whereDate('created_at', '<=', $filters['date_to']);
        }
        if (!empty($filters['month'])) {
            $customerQuery->whereMonth('created_at', $filters['month']);
        }
        if (!empty($filters['year'])) {
            $customerQuery->whereYear('created_at', $filters['year']);
        }
        $newCustomers = $customerQuery->count();

        return [
            'total_orders' => $totalOrders,
            'orders_by_status' => $ordersByStatus,
            'total_revenue' => (int) $totalRevenue,
            'average_order_value' => $averageOrderValue,
            'best_selling_products' => $bestSellingProducts,
            'best_selling_categories' => $bestSellingCategories,
            'new_customers' => $newCustomers,
        ];
    }

    public function getMonthlyStats(array $filters): array
    {
        $query = Order::query();

        // Apply year filter if present
        if (!empty($filters['year'])) {
            $query->whereYear('created_at', $filters['year']);
        } else {
            // Last 12 months by default
            $query->where('created_at', '>=', now()->subMonths(12));
        }

        $stats = $query
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(CASE WHEN status = "' . OrderStatus::DELIVERED->value . '" THEN total ELSE 0 END) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'month' => $item->month,
                'revenue' => (int) $item->revenue,
                'order_count' => (int) $item->order_count,
            ])
            ->toArray();

        return $stats;
    }

    public function getYearlyStats(): array
    {
        $stats = Order::query()
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(CASE WHEN status = "' . OrderStatus::DELIVERED->value . '" THEN total ELSE 0 END) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('year')
            ->orderBy('year')
            ->get()
            ->map(fn($item) => [
                'year' => (int) $item->year,
                'revenue' => (int) $item->revenue,
                'order_count' => (int) $item->order_count,
            ])
            ->toArray();

        return $stats;
    }
}
