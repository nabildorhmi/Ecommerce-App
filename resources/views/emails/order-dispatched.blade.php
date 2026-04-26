<x-mail::message>
# Votre commande est en route

Bonjour {{ $order->user->name }},

Votre commande **{{ $order->order_number }}** a été expédiée et est en cours de livraison.

## Détails de la commande

**Statut:** En cours de livraison
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

Notre livreur prendra contact avec vous prochainement pour convenir de l'heure de livraison.

Merci pour votre confiance,<br>
{{ config('app.name') }}
</x-mail::message>
