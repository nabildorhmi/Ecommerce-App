<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture {{ $order->order_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11pt;
            color: #333;
            line-height: 1.6;
            padding: 30px;
        }
        .header {
            display: table;
            width: 100%;
            margin-bottom: 40px;
        }
        .header-left {
            display: table-cell;
            width: 50%;
            vertical-align: middle;
        }
        .header-right {
            display: table-cell;
            width: 50%;
            text-align: right;
            vertical-align: middle;
        }
        .logo {
            height: 60px;
        }
        .invoice-title {
            font-size: 32pt;
            font-weight: bold;
            color: #2563eb;
        }
        .order-info {
            margin-bottom: 30px;
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 5px;
        }
        .order-info h3 {
            margin-bottom: 15px;
            color: #1f2937;
            font-size: 14pt;
        }
        .order-info-grid {
            display: table;
            width: 100%;
        }
        .order-info-row {
            display: table-row;
        }
        .order-info-label {
            display: table-cell;
            font-weight: bold;
            padding: 5px 0;
            width: 40%;
        }
        .order-info-value {
            display: table-cell;
            padding: 5px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table thead {
            background-color: #2563eb;
            color: white;
        }
        .items-table th {
            padding: 12px 10px;
            text-align: left;
            font-weight: bold;
        }
        .items-table th.text-center {
            text-align: center;
        }
        .items-table th.text-right {
            text-align: right;
        }
        .items-table tbody tr {
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .items-table td {
            padding: 10px;
        }
        .items-table td.text-center {
            text-align: center;
        }
        .items-table td.text-right {
            text-align: right;
        }
        .totals {
            margin-left: auto;
            width: 300px;
            margin-bottom: 30px;
        }
        .totals-row {
            display: table;
            width: 100%;
            padding: 8px 0;
        }
        .totals-row.total {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
            font-size: 13pt;
            padding: 12px 10px;
            margin-top: 5px;
        }
        .totals-label {
            display: table-cell;
            width: 60%;
        }
        .totals-value {
            display: table-cell;
            text-align: right;
            width: 40%;
        }
        .note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 30px;
        }
        .note h4 {
            margin-bottom: 8px;
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <img src="{{ public_path('images/logo.png') }}" alt="Logo" class="logo">
        </div>
        <div class="header-right">
            <div class="invoice-title">FACTURE</div>
        </div>
    </div>

    <div class="order-info">
        <h3>Informations de commande</h3>
        <div class="order-info-grid">
            <div class="order-info-row">
                <div class="order-info-label">Numéro de commande:</div>
                <div class="order-info-value">{{ $order->order_number }}</div>
            </div>
            <div class="order-info-row">
                <div class="order-info-label">Date:</div>
                <div class="order-info-value">{{ $order->created_at->format('d/m/Y') }}</div>
            </div>
            <div class="order-info-row">
                <div class="order-info-label">Client:</div>
                <div class="order-info-value">{{ $order->user->name }}</div>
            </div>
            <div class="order-info-row">
                <div class="order-info-label">Téléphone:</div>
                <div class="order-info-value">{{ $order->phone }}</div>
            </div>
            <div class="order-info-row">
                <div class="order-info-label">Ville:</div>
                <div class="order-info-value">{{ $order->city }}</div>
            </div>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Produit</th>
                <th class="text-center">Quantité</th>
                <th class="text-right">Prix unitaire</th>
                <th class="text-right">Sous-total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name ?? $item->product_sku }}</td>
                <td class="text-center">{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->unit_price / 100, 2, ',', ' ') }} MAD</td>
                <td class="text-right">{{ number_format($item->subtotal / 100, 2, ',', ' ') }} MAD</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <div class="totals-label">Sous-total:</div>
            <div class="totals-value">{{ number_format($order->subtotal / 100, 2, ',', ' ') }} MAD</div>
        </div>
        <div class="totals-row">
            <div class="totals-label">Frais de livraison:</div>
            <div class="totals-value">{{ number_format($order->delivery_fee / 100, 2, ',', ' ') }} MAD</div>
        </div>
        <div class="totals-row total">
            <div class="totals-label">Total:</div>
            <div class="totals-value">{{ number_format($order->total / 100, 2, ',', ' ') }} MAD</div>
        </div>
    </div>

    @if($order->note)
    <div class="note">
        <h4>Note:</h4>
        <p>{{ $order->note }}</p>
    </div>
    @endif

    <div class="footer">
        <p>Merci pour votre confiance</p>
        <p><strong>{{ config('app.name') }}</strong></p>
    </div>
</body>
</html>
