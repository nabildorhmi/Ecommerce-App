<x-mail::message>
# Confirmation de commande

Bonjour {{ $order->user->name }},

Nous avons bien reçu votre commande **{{ $order->order_number }}**. Votre commande est actuellement en attente de confirmation.

## Détails de la commande

**Statut:** En attente
**Téléphone:** {{ $order->phone }}
**Ville:** {{ $order->city }}

<x-mail::table>
| Produit | Quantité | Prix unitaire | Sous-total |
|:--------|:--------:|:-------------:|-----------:|
@foreach($order->items as $item)
| {{ $item->product->name ?? $item->product_sku }} | {{ $item->quantity }} | {{ number_format($item->unit_price / 100, 2) }} MAD | {{ number_format($item->subtotal / 100, 2) }} MAD |
@endforeach
</x-mail::table>

**Sous-total:** {{ number_format($order->subtotal / 100, 2) }} MAD
**Frais de livraison:** {{ number_format($order->delivery_fee / 100, 2) }} MAD
**Total:** {{ number_format($order->total / 100, 2) }} MAD

@if($order->note)
**Note:** {{ $order->note }}
@endif

Nous vous contacterons bientôt pour confirmer votre commande.

Merci pour votre confiance,<br>
{{ config('app.name') }}
</x-mail::message>
