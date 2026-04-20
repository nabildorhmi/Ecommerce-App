<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AddOrderNoteRequest;
use App\Http\Requests\Admin\TransitionOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\InvoiceService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly InvoiceService $invoiceService
    ) {
    }

    public function index(Request $request): ResourceCollection
    {
        $orders = QueryBuilder::for(
            Order::query()->with(['user', 'items.product', 'items.variant.attributeValues.attribute', 'deliveryZone'])
        )
            ->allowedFilters([
                AllowedFilter::exact('status'),
                AllowedFilter::exact('delivery_zone_id'),
                AllowedFilter::callback('city', fn ($q, $v) =>
                    $q->where('city', 'like', '%' . $v . '%')
                ),
                AllowedFilter::callback('client', fn ($q, $v) =>
                    $q->where(function ($subQ) use ($v) {
                        $subQ->where('phone', 'like', '%' . $v . '%')
                            ->orWhereHas('user', function ($userQ) use ($v) {
                                $userQ->where('name', 'like', '%' . $v . '%')
                                    ->orWhere('email', 'like', '%' . $v . '%');
                            });
                    })
                ),
                AllowedFilter::callback('date_from', fn ($q, $v) => $q->whereDate('created_at', '>=', $v)),
                AllowedFilter::callback('date_to', fn ($q, $v) => $q->whereDate('created_at', '<=', $v)),
            ])
            ->defaultSort('-created_at')
            ->allowedSorts(['created_at', 'total', 'status'])
            ->paginate(min($request->integer('per_page', 20), 100))
            ->appends($request->query());

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        $order->load(['items.product', 'items.variant.attributeValues.attribute', 'deliveryZone', 'statusLogs', 'user']);

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

    public function invoice(Order $order)
    {
        $pdf = $this->invoiceService->generatePdf($order);
        return $pdf->download("facture-{$order->order_number}.pdf");
    }
}
