<?php

namespace App\DTOs;

use Illuminate\Foundation\Http\FormRequest;

readonly class CreateOrderDTO
{
    public function __construct(
        public array $items,    // [{product_id, variant_id?, quantity}]
        public string $phone,
        public string $city,
        public ?string $note = null,
    ) {}

    public static function fromRequest(FormRequest $request): self
    {
        return new self(
            items: $request->validated('items'),
            phone: $request->validated('phone'),
            city: $request->validated('city'),
            note: $request->validated('note'),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            items: $data['items'],
            phone: $data['phone'],
            city: $data['city'],
            note: $data['note'] ?? null,
        );
    }

    public function productIds(): array
    {
        return array_column($this->items, 'product_id');
    }
}
