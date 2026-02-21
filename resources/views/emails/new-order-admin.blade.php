<x-mail::message>
# Nouvelle commande reçue

Une nouvelle commande a été passée et nécessite votre attention.

## Informations de la commande

**Numéro:** {{ $order->order_number }}
**Statut:** {{ $order->status->label('fr') }}
**Client:** {{ $order->user->name }} ({{ $order->user->email }})
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
**Note du client:** {{ $order->note }}
@endif

Veuillez traiter cette commande dès que possible.

Cordialement,<br>
Système {{ config('app.name') }}
</x-mail::message>
