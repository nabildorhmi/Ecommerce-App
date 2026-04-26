<x-mail::message>
# Votre commande a été confirmée

Bonjour {{ $order->user->name }},

Bonne nouvelle ! Votre commande **{{ $order->order_number }}** a été confirmée et sera bientôt expédiée.

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

Nous vous contacterons une fois que votre commande sera expédiée.

Merci pour votre confiance,<br>
{{ config('app.name') }}
</x-mail::message>
