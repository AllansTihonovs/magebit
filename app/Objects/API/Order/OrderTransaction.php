<?php

namespace App\Objects\API\Order;

class OrderTransaction
{
    public const PAYMENT_TYPE__INVOICE = 'invoice';
    public const PAYMENT_TYPE__EVERYPAY = 'everypay';
    public const PAYMENT_TYPE__SHOPIFY = 'shopify';

    public const PAYMENT_METHOD__TRANSFER = 'transfer';
    public const PAYMENT_METHOD__CARD = 'card';
    public const PAYMENT_METHOD__IMPORT = 'import';

    public const RECOGNITION__MANUAL = 'manual';
    public const RECOGNITION__AUTO = 'auto';

    public const STATUS__PROCESSING = 'processing';
    public const STATUS__SUCCESS = 'success';
    public const STATUS__FAILED = 'failed';

    // Shopify
    public const SHOPIFY_GATEWAY__MANUAL = 'manual';

    public const SHOPIFY_STATUS__PENDING = 'pending';
    public const SHOPIFY_STATUS__SUCCESS = 'success';

    /**
     * @var string
     */
    public string $external_id;

    /**
     * @var string
     */
    public string $transaction_nr;

    /**
     * @var string
     */
    public string $payment_type = self::PAYMENT_TYPE__INVOICE;

    /**
     * @var string
     */
    public string $payment_method = self::PAYMENT_METHOD__TRANSFER;

    /**
     * @var string
     */
    public string $recognition = self::RECOGNITION__MANUAL;

    /**
     * @var \DateTime|null
     */
    public ?\DateTime $recognized_at;

    /**
     * @var float
     */
    public float $amount;

    /**
     * @var string
     */
    public string $status = self::STATUS__PROCESSING;

    /**
     * @param string $status
     * @return void
     */
    public function setStatusFromShopify(string $status): void
    {
        $this->status = match (true) {
            $status === self::SHOPIFY_STATUS__PENDING => self::STATUS__PROCESSING,
            $status === self::SHOPIFY_STATUS__SUCCESS => self::STATUS__SUCCESS,
            default => self::STATUS__FAILED,
        };
    }
}
