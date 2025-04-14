<?php

namespace App\Objects\API;

use App\Objects\API\Order\Customer;
use App\Objects\API\Order\OrderItem;
use App\Objects\API\Order\OrderTransaction;

class Order
{
    public const EXTERNAL_TYPE__EXTERNAL = 'external';
    public const EXTERNAL_TYPE__EBAY = 'ebay';
    public const EXTERNAL_TYPE__SHOPIFY = 'shopify';
    public const EXTERNAL_TYPE__AMAZON = 'amazon';

    public const STATUS__CANCELED = -2;
    public const STATUS__ON_HOLD = -1;
    public const STATUS__FRESH = 0;
    public const STATUS__AWAITING_INFO = 2;
    public const STATUS__AWAITING_PAYMENT = 4;
    public const STATUS__PAYED = 6;
    public const STATUS__READY_TO_PRINT = 8;
    public const STATUS__ANY_PRINTED = 10;
    public const STATUS__ALL_PRINTED = 12;
    public const STATUS__DELIVERED = 14;

    // Shopify
    public const SHOPIFY_FINANCIAL_STATUS__PAID = 'paid';
    public const SHOPIFY_FULFILLMENT_STATUS__FULFILLED = 'fulfilled';

    /**
     * @var string
     */
    public string $external_type;

    /**
     * @var string
     */
    public string $external_id;

    /**
     * @var int|null
     */
    public ?int $status;

    /**
     * @var Customer
     */
    public Customer $customer;

    /**
     * @var OrderItem[]
     */
    public array $order_items = [];

    /**
     * @var OrderTransaction[]
     */
    public array $order_transactions = [];

    /**
     * @param string $financial_status
     * @param string|null $fulfillment_status
     * @return void
     */
    public function setStatusFromShopify(string $financial_status, ?string $fulfillment_status): void
    {
        $this->status = match (true) {
            $financial_status === self::SHOPIFY_FINANCIAL_STATUS__PAID && $fulfillment_status === self::SHOPIFY_FULFILLMENT_STATUS__FULFILLED => self::STATUS__DELIVERED,
            $financial_status === self::SHOPIFY_FINANCIAL_STATUS__PAID => self::STATUS__PAYED,
            default => self::STATUS__AWAITING_PAYMENT,
        };
    }
}
