<?php

namespace App\Objects\API\Order;

class Customer
{
    public const EXTERNAL_TYPE__EXTERNAL = 'external';
    public const EXTERNAL_TYPE__EBAY = 'ebay';
    public const EXTERNAL_TYPE__SHOPIFY = 'shopify';
    public const EXTERNAL_TYPE__AMAZON = 'amazon';

    /**
     * @var string
     */
    public string $external_type;

    /**
     * @var string
     */
    public string $external_id;

    /**
     * @var string
     */
    public string $name;

    /**
     * @var string
     */
    public string $surname;

    /**
     * @var string
     */
    public string $email;

    /**
     * @var string|null
     */
    public ?string $phone;

    /**
     * @var string|null
     */
    public ?string $address_line1;

    /**
     * @var string|null
     */
    public ?string $address_line2;

    /**
     * @var string|null
     */
    public ?string $city;

    /**
     * @var string|null
     */
    public ?string $state;

    /**
     * @var string|null
     */
    public ?string $zip;

    /**
     * @var string|null
     */
    public ?string $country_iso_2;
}
