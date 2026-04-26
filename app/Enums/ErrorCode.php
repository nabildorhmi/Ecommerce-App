<?php

namespace App\Enums;

enum ErrorCode: string
{
    // Auth
    case AUTH_INVALID_CREDENTIALS = 'AUTH_001';
    case AUTH_ACCOUNT_DEACTIVATED = 'AUTH_002';
    case AUTH_UNAUTHORIZED = 'AUTH_003';
    case AUTH_FORBIDDEN = 'AUTH_004';
    case AUTH_TOKEN_EXPIRED = 'AUTH_005';

    // Orders
    case ORD_DUPLICATE = 'ORD_001';
    case ORD_INVALID_TRANSITION = 'ORD_002';
    case ORD_INSUFFICIENT_STOCK = 'ORD_003';
    case ORD_PRODUCT_UNAVAILABLE = 'ORD_004';
    case ORD_NO_VARIANT = 'ORD_005';

    // Products
    case PROD_NOT_FOUND = 'PROD_001';
    case PROD_CATEGORY_HAS_PRODUCTS = 'PROD_002';

    // Validation
    case VAL_FAILED = 'VAL_001';

    // System
    case SYS_INTERNAL = 'SYS_001';
    case SYS_RATE_LIMITED = 'SYS_002';
    case SYS_NOT_FOUND = 'SYS_003';

    /**
     * Human-readable label for the error code.
     */
    public function label(): string
    {
        return match ($this) {
            self::AUTH_INVALID_CREDENTIALS => 'Invalid Credentials',
            self::AUTH_ACCOUNT_DEACTIVATED => 'Account Deactivated',
            self::AUTH_UNAUTHORIZED => 'Authentication Required',
            self::AUTH_FORBIDDEN => 'Access Forbidden',
            self::AUTH_TOKEN_EXPIRED => 'Token Expired',
            self::ORD_DUPLICATE => 'Duplicate Order',
            self::ORD_INVALID_TRANSITION => 'Invalid Status Transition',
            self::ORD_INSUFFICIENT_STOCK => 'Insufficient Stock',
            self::ORD_PRODUCT_UNAVAILABLE => 'Product Unavailable',
            self::ORD_NO_VARIANT => 'No Variant Found',
            self::PROD_NOT_FOUND => 'Product Not Found',
            self::PROD_CATEGORY_HAS_PRODUCTS => 'Category Has Products',
            self::VAL_FAILED => 'Validation Failed',
            self::SYS_INTERNAL => 'Internal Server Error',
            self::SYS_RATE_LIMITED => 'Too Many Requests',
            self::SYS_NOT_FOUND => 'Resource Not Found',
        };
    }
}
