<?php

namespace App\Http\Controllers\Customer;

use App\DTOs\CreateOrderDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\InvoiceService;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly InvoiceService $invoiceService
    ) {
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $dto = CreateOrderDTO::fromRequest($request);
        $order = $this->orderService->createOrder($dto, $request->user()->id);

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(201);
    }

    public function index(Request $request): ResourceCollection
    {
        $orders = Order::forUser($request->user()->id)
            ->with(['items.product', 'items.variant.attributeValues.attribute', 'deliveryZone'])
            ->latest()
            ->paginate(10);

        return OrderResource::collection($orders);
    }

    public function show(Request $request, Order $order): OrderResource
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'This order does not belong to you.');
        }

        $order->load(['items.product', 'items.variant.attributeValues.attribute', 'deliveryZone', 'statusLogs']);

        return new OrderResource($order);
    }

    public function invoice(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403, 'This order does not belong to you.');
        }

        $pdf = $this->invoiceService->generatePdf($order);
        return $pdf->download("facture-{$order->order_number}.pdf");
    }
}
