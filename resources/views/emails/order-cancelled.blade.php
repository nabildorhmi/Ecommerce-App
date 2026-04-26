<x-mail::message>
# Commande annulée

Bonjour {{ $order->user->name }},

Nous sommes désolés de vous informer que votre commande **{{ $order->order_number }}** a été annulée.

@if($reason)
**Raison:** {{ $reason }}
@endif

## Détails de la commande

**Statut:** {{ $order->status->label('fr') }}
**Téléphone:** {{ $order->phone }}
**Ville:** {{ $order->city }}

<x-mail::table>
| Produit | Quantité | Prix unitaire | Sous-total |
|:--------|:--------:|:-------------:|-----------:|
@foreach($order->items as $item)
| {{ $item->product->name ?? $item->product_sku }} | {{ $item->quantity }} | {{ number_format($item->unit_price / 100, 2) }} MAD | {{ number_format($item->subtotal / 100, 2) }} MAD |
@endforeach
</x-mail::table>

**Total:** {{ number_format($order->total / 100, 2) }} MAD

Si vous avez des questions, n'hésitez pas à nous contacter.

Cordialement,<br>
{{ config('app.name') }}
</x-mail::message>
