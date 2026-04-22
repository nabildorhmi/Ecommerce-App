<?php

namespace App\Actions\Order;

use App\Models\Page;

class CalculateOrderTotalAction
{
    /**
     * Calculate subtotal and total from prepared items data.
     * Returns [subtotal, delivery_fee, total].
     */
    public function execute(array $itemsData): array
    {
        $subtotal = array_sum(array_column($itemsData, 'subtotal'));
        $settings = $this->resolveShippingSettings();
        $deliveryFee = $this->calculateDeliveryFee($subtotal, $settings);

        return [
            'subtotal'     => $subtotal,
            'delivery_fee' => $deliveryFee,
            'total'        => $subtotal + $deliveryFee,
        ];
    }

    /**
     * @return array{delivery_fee_default:int,free_shipping_threshold:int,shipping_pricing_mode:string,shipping_pricing_rules:array<int,array{min_subtotal:int,fee:int}>}
     */
    private function resolveShippingSettings(): array
    {
        $defaultSettings = [
            'delivery_fee_default' => 0,
            'free_shipping_threshold' => 0,
            'shipping_pricing_mode' => 'simple',
            'shipping_pricing_rules' => [],
        ];

        $content = Page::query()->where('slug', 'site-settings')->value('content');
        if (!is_string($content) || $content === '') {
            return $defaultSettings;
        }

        $decoded = json_decode($content, true);
        if (!is_array($decoded)) {
            return $defaultSettings;
        }

        $rules = $decoded['shipping_pricing_rules'] ?? [];
        $normalizedRules = [];

        if (is_array($rules)) {
            foreach ($rules as $rule) {
                if (!is_array($rule)) {
                    continue;
                }

                $minSubtotal = isset($rule['min_subtotal']) && is_numeric($rule['min_subtotal'])
                    ? max(0, (int) round((float) $rule['min_subtotal']))
                    : 0;

                $fee = isset($rule['fee']) && is_numeric($rule['fee'])
                    ? max(0, (int) round((float) $rule['fee']))
                    : 0;

                $normalizedRules[] = [
                    'min_subtotal' => $minSubtotal,
                    'fee' => $fee,
                ];
            }
        }

        usort($normalizedRules, fn (array $a, array $b) => $a['min_subtotal'] <=> $b['min_subtotal']);

        $rawMode = isset($decoded['shipping_pricing_mode']) && is_string($decoded['shipping_pricing_mode'])
            ? strtolower(trim($decoded['shipping_pricing_mode']))
            : null;

        $mode = in_array($rawMode, ['simple', 'tiered'], true)
            ? $rawMode
            : (count($normalizedRules) > 0 ? 'tiered' : 'simple');

        return [
            'delivery_fee_default' => isset($decoded['delivery_fee_default']) && is_numeric($decoded['delivery_fee_default'])
                ? max(0, (int) round((float) $decoded['delivery_fee_default']))
                : 0,
            'free_shipping_threshold' => isset($decoded['free_shipping_threshold']) && is_numeric($decoded['free_shipping_threshold'])
                ? max(0, (int) round((float) $decoded['free_shipping_threshold']))
                : 0,
            'shipping_pricing_mode' => $mode,
            'shipping_pricing_rules' => $normalizedRules,
        ];
    }

    /**
     * @param array{delivery_fee_default:int,free_shipping_threshold:int,shipping_pricing_mode:string,shipping_pricing_rules:array<int,array{min_subtotal:int,fee:int}>} $settings
     */
    private function calculateDeliveryFee(int $subtotal, array $settings): int
    {
        $fee = $settings['delivery_fee_default'];

        if ($settings['shipping_pricing_mode'] === 'tiered') {
            foreach ($settings['shipping_pricing_rules'] as $rule) {
                if ($subtotal >= $rule['min_subtotal']) {
                    $fee = $rule['fee'];
                }
            }
        }

        if ($settings['free_shipping_threshold'] > 0 && $subtotal >= $settings['free_shipping_threshold']) {
            return 0;
        }

        return $fee;
    }
}
