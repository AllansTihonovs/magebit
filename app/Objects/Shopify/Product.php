<?php

namespace App\Objects\Shopify;

use App\Objects\Shopify\Product\Image;
use App\Objects\Shopify\Product\Variant;

class Product
{
    public const STATUS__DRAFT = 'draft';
    public const STATUS__ACTIVE = 'active';
    public const STATUS__ARCHIVED = 'archived';

    /**
     * @var string
     */
    public $title;

    /**
     * @var string|null
     */
    public $body_html;

    /**
     * @var string|null
     */
    public $product_type;

    /**
     * @var array
     */
    public $options = [];

    /**
     * @var string
     */
    public $status;

    /**
     * @var Variant[]
     */
    public $variants = [];

    /**
     * @var Image[]
     */
    public $images = [];
}
