<?php if (isset($component)) { $__componentOriginalaa758e6a82983efcbf593f765e026bd9 = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginalaa758e6a82983efcbf593f765e026bd9 = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => $__env->getContainer()->make(Illuminate\View\Factory::class)->make('mail::message'),'data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('mail::message'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
# Confirmation de commande

Bonjour <?php echo new \Illuminate\Support\EncodedHtmlString($order->user->name); ?>,

Nous avons bien reçu votre commande **<?php echo new \Illuminate\Support\EncodedHtmlString($order->order_number); ?>**. Votre commande est actuellement en attente de confirmation.

## Détails de la commande

**Statut:** En attente
**Téléphone:** <?php echo new \Illuminate\Support\EncodedHtmlString($order->phone); ?>

**Ville:** <?php echo new \Illuminate\Support\EncodedHtmlString($order->city); ?>


<?php if (isset($component)) { $__componentOriginal85530901ee91af5decf39e8ed3495cde = $component; } ?>
<?php if (isset($attributes)) { $__attributesOriginal85530901ee91af5decf39e8ed3495cde = $attributes; } ?>
<?php $component = Illuminate\View\AnonymousComponent::resolve(['view' => $__env->getContainer()->make(Illuminate\View\Factory::class)->make('mail::table'),'data' => []] + (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag ? $attributes->all() : [])); ?>
<?php $component->withName('mail::table'); ?>
<?php if ($component->shouldRender()): ?>
<?php $__env->startComponent($component->resolveView(), $component->data()); ?>
<?php if (isset($attributes) && $attributes instanceof Illuminate\View\ComponentAttributeBag): ?>
<?php $attributes = $attributes->except(\Illuminate\View\AnonymousComponent::ignoredParameterNames()); ?>
<?php endif; ?>
<?php $component->withAttributes([]); ?>
| Produit | Quantité | Prix unitaire | Sous-total |
|:--------|:--------:|:-------------:|-----------:|
<?php $__currentLoopData = $order->items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
| <?php echo new \Illuminate\Support\EncodedHtmlString($item->product->name ?? $item->product_sku); ?> | <?php echo new \Illuminate\Support\EncodedHtmlString($item->quantity); ?> | <?php echo new \Illuminate\Support\EncodedHtmlString(number_format($item->unit_price / 100, 2)); ?> MAD | <?php echo new \Illuminate\Support\EncodedHtmlString(number_format($item->subtotal / 100, 2)); ?> MAD |
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginal85530901ee91af5decf39e8ed3495cde)): ?>
<?php $attributes = $__attributesOriginal85530901ee91af5decf39e8ed3495cde; ?>
<?php unset($__attributesOriginal85530901ee91af5decf39e8ed3495cde); ?>
<?php endif; ?>
<?php if (isset($__componentOriginal85530901ee91af5decf39e8ed3495cde)): ?>
<?php $component = $__componentOriginal85530901ee91af5decf39e8ed3495cde; ?>
<?php unset($__componentOriginal85530901ee91af5decf39e8ed3495cde); ?>
<?php endif; ?>

**Sous-total:** <?php echo new \Illuminate\Support\EncodedHtmlString(number_format($order->subtotal / 100, 2)); ?> MAD
**Frais de livraison:** <?php echo new \Illuminate\Support\EncodedHtmlString(number_format($order->delivery_fee / 100, 2)); ?> MAD
**Total:** <?php echo new \Illuminate\Support\EncodedHtmlString(number_format($order->total / 100, 2)); ?> MAD

<?php if($order->note): ?>
**Note:** <?php echo new \Illuminate\Support\EncodedHtmlString($order->note); ?>

<?php endif; ?>

Nous vous contacterons bientôt pour confirmer votre commande.

Merci pour votre confiance,<br>
<?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name')); ?>

 <?php echo $__env->renderComponent(); ?>
<?php endif; ?>
<?php if (isset($__attributesOriginalaa758e6a82983efcbf593f765e026bd9)): ?>
<?php $attributes = $__attributesOriginalaa758e6a82983efcbf593f765e026bd9; ?>
<?php unset($__attributesOriginalaa758e6a82983efcbf593f765e026bd9); ?>
<?php endif; ?>
<?php if (isset($__componentOriginalaa758e6a82983efcbf593f765e026bd9)): ?>
<?php $component = $__componentOriginalaa758e6a82983efcbf593f765e026bd9; ?>
<?php unset($__componentOriginalaa758e6a82983efcbf593f765e026bd9); ?>
<?php endif; ?>
<?php /**PATH C:\Users\User\Desktop\TrotinetteApp\trotinette-api\resources\views/emails/new-order-customer.blade.php ENDPATH**/ ?>