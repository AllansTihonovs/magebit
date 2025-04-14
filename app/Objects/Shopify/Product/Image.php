<?php

namespace App\Objects\Shopify\Product;

class Image
{
    /**
     * @var string
     */
    public $filename;

    /**
     * @var string
     */
    public $attachment;

    /**
     * @var array
     */
    public $variant_ids = [];
}
