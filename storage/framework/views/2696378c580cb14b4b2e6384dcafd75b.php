<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture <?php echo e($order->order_number); ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            color: #333;
            line-height: 1.6;
            padding: 20px;
        }
        .header {
            display: table;
            width: 100%;
            margin-bottom: 20px;
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
            font-size: 22pt;
            font-weight: bold;
            color: #111827;
        }
        .invoice-meta {
            font-size: 10pt;
            color: #4b5563;
            margin-top: 4px;
        }
        .client-info {
            margin-bottom: 15px;
            padding: 10px 12px;
            border-top: 1px solid #d1d5db;
            border-bottom: 1px solid #d1d5db;
            font-size: 10pt;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .items-table thead {
            background-color: #374151;
            color: white;
        }
        .items-table th {
            padding: 8px;
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
            padding: 8px;
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
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
            padding: 10px;
        }
        .totals-row {
            display: table;
            width: 100%;
            padding: 6px 0;
        }
        .totals-row.total {
            font-weight: bold;
            font-size: 11pt;
            padding: 8px 0;
            margin-top: 5px;
            border-top: 1px solid #d1d5db;
            color: #111827;
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
            background-color: #f3f4f6;
            border-left: 4px solid #6b7280;
            padding: 10px;
            margin-bottom: 20px;
        }
        .note h4 {
            margin-bottom: 6px;
            color: #374151;
        }
        .footer {
            text-align: center;
            margin-top: 25px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <img src="<?php echo e(public_path('images/logo.png')); ?>" alt="Logo" class="logo">
        </div>
        <div class="header-right">
            <div class="invoice-title">FACTURE</div>
            <div class="invoice-meta">N&deg; <?php echo e($order->order_number); ?></div>
            <div class="invoice-meta">Date: <?php echo e($order->created_at->format('d/m/Y')); ?></div>
        </div>
    </div>

    <div class="client-info">
        <div><strong>Client:</strong> <?php echo e($order->user->name); ?> &nbsp;&nbsp; <strong>Telephone:</strong> <?php echo e($order->phone); ?> &nbsp;&nbsp; <strong>E-mail:</strong> <?php echo e($order->user->email); ?></div>
        <div style="margin-top: 4px;"><strong>Ville:</strong> <?php echo e($order->city); ?><?php if($order->user->address_street): ?> &nbsp;&nbsp; <strong>Adresse:</strong> <?php echo e($order->user->address_street); ?><?php endif; ?></div>
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
            <?php $__currentLoopData = $order->items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <tr>
                <td><?php echo e($item->product->name ?? $item->product_sku); ?></td>
                <td class="text-center"><?php echo e($item->quantity); ?></td>
                <td class="text-right"><?php echo e(number_format($item->unit_price / 100, 2, ',', ' ')); ?> MAD</td>
                <td class="text-right"><?php echo e(number_format($item->subtotal / 100, 2, ',', ' ')); ?> MAD</td>
            </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <div class="totals-label">Sous-total:</div>
            <div class="totals-value"><?php echo e(number_format($order->subtotal / 100, 2, ',', ' ')); ?> MAD</div>
        </div>
        <div class="totals-row">
            <div class="totals-label">Frais de livraison:</div>
            <div class="totals-value"><?php echo e(number_format($order->delivery_fee / 100, 2, ',', ' ')); ?> MAD</div>
        </div>
        <div class="totals-row total">
            <div class="totals-label">Total:</div>
            <div class="totals-value"><?php echo e(number_format($order->total / 100, 2, ',', ' ')); ?> MAD</div>
        </div>
    </div>

    <?php if($order->note): ?>
    <div class="note">
        <h4>Note:</h4>
        <p><?php echo e($order->note); ?></p>
    </div>
    <?php endif; ?>

    <div class="footer">
        <p>Merci pour votre confiance</p>
        <p><strong><?php echo e(config('app.name')); ?></strong></p>
    </div>
</body>
</html>
<?php /**PATH C:\Users\User\Desktop\TrotinetteApp\trotinette-api\resources\views/invoices/invoice.blade.php ENDPATH**/ ?>