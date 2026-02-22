<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AddOrderNoteRequest;
use App\Http\Requests\Admin\TransitionOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function index(Request $request): ResourceCollection
    {
        $orders = QueryBuilder::for(
            Order::query()->with(['user', 'items', 'deliveryZone'])
        )
            ->allowedFilters([
                AllowedFilter::exact('status'),
                AllowedFilter::exact('delivery_zone_id'),
                AllowedFilter::callback('date_from', fn ($q, $v) => $q->whereDate('created_at', '>=', $v)),
                AllowedFilter::callback('date_to', fn ($q, $v) => $q->whereDate('created_at', '<=', $v)),
            ])
            ->defaultSort('-created_at')
            ->allowedSorts(['created_at', 'total', 'status'])
            ->paginate(20)
            ->appends($request->query());

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        $order->load(['items.product', 'deliveryZone', 'statusLogs', 'user']);

        return new OrderResource($order);
    }

    public function transition(TransitionOrderRequest $request, Order $order): OrderResource
    {
        $order = $this->orderService->transitionStatus(
            $order,
            OrderStatus::from($request->status),
            $request->user()->id,
            'admin',
            $request->note
        );

        return new OrderResource($order);
    }

    public function addNote(AddOrderNoteRequest $request, Order $order): OrderResource
    {
        $order = $this->orderService->addNote($order, $request->note, $request->user()->id);

        return new OrderResource($order);
    }
}
