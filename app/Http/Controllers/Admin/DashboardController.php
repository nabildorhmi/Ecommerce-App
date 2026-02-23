<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year' => ['nullable', 'integer'],
            'status' => ['nullable', 'string'],
        ]);

        $filters = array_filter($validated);

        return response()->json([
            'kpis' => $this->dashboardService->getKpis($filters),
            'monthly_stats' => $this->dashboardService->getMonthlyStats($filters),
            'yearly_stats' => $this->dashboardService->getYearlyStats(),
        ]);
    }
}
