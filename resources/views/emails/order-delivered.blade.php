<x-mail::message>
# Votre commande a été livrée

Bonjour {{ $order->user->name }},

Votre commande **{{ $order->order_number }}** a bien été livrée. Nous espérons que vous êtes satisfait(e) de votre achat !

## Récapitulatif de la commande

**Statut:** Livré
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

Si vous avez la moindre question ou un problème avec votre commande, n'hésitez pas à nous contacter.

Merci pour votre confiance,<br>
{{ config('app.name') }}
</x-mail::message>
