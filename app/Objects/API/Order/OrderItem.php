<?php

namespace App\Objects\API\Order;

use App\Objects\API\Order;

class OrderItem
{
    public const STATUS__ON_HOLD = -1;
    public const STATUS__NO_INFO = 0;
    public const STATUS__NO_IMAGE = 1;
    public const STATUS__NEED_PERSONALIZATION = 3;
    public const STATUS__INVALID_ADDRESS = 4;
    public const STATUS__BAD_FILE = 5;
    public const STATUS__AWAITS_PAYMENT = 9;
    public const STATUS__READY_TO_PRINT = 10;
    public const STATUS__PROCESSING = 11;
    public const STATUS__PROCESS = 16;
    public const STATUS__PRINTED = 20;

    /**
     * @var integer
     */
    public int $id;

    /**
     * @var string
     */
    public string $external_id;

    /**
     * @var string|null
     */
    public ?string $design_variant_uuid;

    /**
     * @var string
     */
    public string $product_variant_sku;

    /**
     * @var int
     */
    public int $quantity;

    /**
     * @var float
     */
    public float $total_price;

    /**
     * @var int|null
     */
    public ?int $status;

    /**
     * @param int $order_status
     * @return void
     */
    public function setStatusByOrderStatus(int $order_status): void
    {
        $this->status = match (true) {
            $order_status === Order::STATUS__DELIVERED => self::STATUS__PRINTED,
            $order_status === Order::STATUS__PAYED => self::STATUS__READY_TO_PRINT,
            default => self::STATUS__AWAITS_PAYMENT,
        };
    }
}
