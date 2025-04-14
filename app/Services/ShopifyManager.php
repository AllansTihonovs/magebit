<?php

namespace App\Services;

use App\Models\Design;
use App\Models\DesignVariant;
use App\Models\FulfillmentOrder;
use App\Models\FulfillmentOrderItem;
use App\Models\Shop;
use App\Models\ShopifyDeliveryProfile;
use App\Models\ShopifyOrder;
use App\Objects\API\Order;
use App\Objects\API\Order\OrderTransaction;
use App\Objects\Shopify\Product as ShopifyProductObject;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use mysql_xdevapi\Exception;
use Rebing\GraphQL\Support\Facades\GraphQL;

class ShopifyManager
{
    public const VERSION = '2024-07';

    /**
     * @var Shop
     */
    private Shop $shop;

    /**
     * @var AdminApi
     */
    private AdminApi $adminApi;

    /**
     * @var int
     */
    private int $last_imported_shopify_order_shopify_id;

    /**
     * @var array
     */
    private array $response_data = [];

    /**
     * @param Shop $shop
     */
    public function __construct(Shop $shop)
    {
        $this->shop = $shop;
        $this->adminApi = new AdminApi();
    }

    /**
     * @param $ids
     * @return array
     */
    public function publishProducts($ids): array
    {
        if (!is_array($ids)) {
            $ids = [$ids];
        }

        $designs = Design::with('designVariants')->whereIn('id', $ids)->get();

        foreach ($designs as $design) {
            $shopifyProductObjectImages = [];

            $shopifyProductObject = new ShopifyProductObject();
            $shopifyProductObject->title = $design->title;
            $shopifyProductObject->body_html = $design->description;
            $shopifyProductObject->product_type = 'Phone Case';
            $shopifyProductObject->options = ['name' => 'Model'];
            $shopifyProductObject->status = ShopifyProductObject::STATUS__ACTIVE;

            foreach ($design->designVariants as $designVariant) {
                $image = File::get(storage_path('app/public/' . $designVariant->canvas_image_path));

                $shopifyProductObjectVariant = new ShopifyProductObject\Variant();
                $shopifyProductObjectVariant->option1 = $designVariant->title;
                $shopifyProductObjectVariant->price = $designVariant->retailPrice();
                $shopifyProductObjectVariant->sku = $designVariant->uuid;
                $shopifyProductObjectVariant->fulfillment_service = 'printff-fulfillment-service';

                $shopifyProductObjectImage = new ShopifyProductObject\Image();
                $shopifyProductObjectImage->filename = basename($designVariant->canvas_image_path);
                $shopifyProductObjectImage->attachment = base64_encode($image);

                $shopifyProductObject->variants[] = $shopifyProductObjectVariant;

                $shopifyProductObjectImages[$designVariant->uuid] = $shopifyProductObjectImage;
            }

            try {
                if ($design->shopify_id) {
                    $this->updateProduct($design, $shopifyProductObject, $shopifyProductObjectImages);
                } else {
                    $this->createProduct($design, $shopifyProductObject, $shopifyProductObjectImages);
                }

                if ($this->response_data[$design->id] = 'succeed') {

                    $deliveryProfile = $this->handleDeliveryProfile();

                    return [
                        'deliveryProfile' => $deliveryProfile,
                    ];
                }
            } catch (\Exception $exception) {
                $this->response_data[$design->id] = 'failed';

                Log::error('ShopifyManager publishProducts Shopify API product error: ' . $exception->getMessage(), $exception->getTrace());
            }
        }

        return $this->response_data;
    }

    /**
     * @param ShopifyOrder $shopifyOrder
     * @return array
     */
    public function fulfillShopifyOrder(ShopifyOrder $shopifyOrder): array
    {
        try {
            $this->createFulfillmentOrder($shopifyOrder);
        } catch (\Exception $exception) {
            $this->response_data[$shopifyOrder->shopify_id] = 'failed';

            Log::error('ShopifyManager fulfillShopifyOrder Shopify API order error: ' . $exception->getMessage(), $exception->getTrace());
        }

        return $this->response_data;
    }

    /**
     * @return void
     */
    public function updateDesignShopifyStatuses(): void
    {
        if ($this->shop->user) {
            foreach ($this->shop->user->designs as $design) {
                if ($design->shopify_id) {
                    $productResponse = $this->shop->api()->rest(
                        'GET',
                        '/admin/api/' . self::VERSION . "/products/{$design->shopify_id}.json",
                        ['fields' => 'status']
                    );

                    if ($productResponse['status'] === Response::HTTP_OK) {
                        $design->shopify_status = $productResponse['body']['product']['status'];
                        $design->save();
                    } else {
                        Log::error('ShopifyManager updateDesignShopifyStatuses Shopify API product response error', $productResponse);
                    }
                }
            }
        }
    }

    /**
     * @return void
     */
    public function importShopifyOrders(): void
    {
        $limit = 250;

        do {
            $shopify_orders = $this->getOrders(
                $limit,
                [
                    'fields' => 'id,updated_at',
                    'since_id' => $this->last_imported_shopify_order_shopify_id ?? $this->getLastImportedShopifyOrderShopifyId(),
                ]
            );

            if ($shopify_orders) {
                foreach ($shopify_orders as $shopify_order) {
                    $shopifyOrder = new ShopifyOrder();
                    $shopifyOrder->shopify_id = $shopify_order['id'];
                    $shopifyOrder->shopify_updated_at = Carbon::parse($shopify_order['updated_at']);
                    $shopifyOrder->shop()->associate($this->shop);
                    $shopifyOrder->save();
                }

                $last_shopify_order = end($shopify_orders);
                $this->last_imported_shopify_order_shopify_id = $last_shopify_order['id'];
            }
        } while ($limit === count($shopify_orders));
    }

    /**
     * @return void
     */
    public function updateShopifyOrders(): void
    {
        $limit = 250;

        $shopify_orders = [];
        foreach ($this->shop->shopifyOrders->chunk($limit) as $shopifyOrders) {
            $shopify_orders[] = $this->getOrders(
                $limit,
                [
                    'fields' => 'id,updated_at',
                    'ids' => implode(',', $shopifyOrders->pluck('shopify_id')->toArray()),
                ]
            );
        }

        $shopify_orders = array_merge(...$shopify_orders);

        foreach ($shopify_orders as $shopify_order) {
            $shopifyOrder = $this->shop->shopifyOrders->where('shopify_id', $shopify_order['id'])->first();
            $parsed_shopify_order_updated_at = Carbon::parse($shopify_order['updated_at']);

            if ($shopifyOrder->shopify_updated_at !== $parsed_shopify_order_updated_at->format('Y-m-d H:i:s')) {
                $shopifyOrder->shopify_updated_at = $parsed_shopify_order_updated_at;
                $shopifyOrder->is_synced = false;
                $shopifyOrder->save();
            }
        }
    }

    /**
     * @return void
     */
    public function syncShopifyOrdersToAdmin(): void
    {
        $limit = 250;
        $shopify_orders = [];

        foreach ($this->shop->shopifyOrders->where('is_synced', false)->chunk($limit) as $shopifyOrders) {
            $shopify_orders[] = $this->getOrders($limit, ['ids' => implode(',', $shopifyOrders->pluck('shopify_id')->toArray())]);
        }

        $shopify_orders = array_merge(...$shopify_orders);

        foreach ($shopify_orders as $shopify_order) {
            $order = new Order();
            $order->external_type = Order::EXTERNAL_TYPE__SHOPIFY;
            $order->external_id = $shopify_order['id'];
            $order->user_uuid = $this->shop->user->user_uuid;
            $order->setStatusFromShopify($shopify_order['financial_status'], $shopify_order['fulfillment_status']);

            if ($shopify_order_customer = $shopify_order['customer']) {
                $customer = new Order\Customer();
                $customer->external_type = Order\Customer::EXTERNAL_TYPE__SHOPIFY;
                $customer->external_id = $shopify_order_customer['id'];
                $customer->name = $shopify_order_customer['first_name'];
                $customer->surname = $shopify_order_customer['last_name'];
                $customer->email = $shopify_order_customer['email'];
                $customer->phone = $shopify_order_customer['phone'] ?? null;

                if ($customer_default_address = $shopify_order_customer['default_address']) {
                    $customer->address_line1 = $customer_default_address['address1'];
                    $customer->address_line2 = $customer_default_address['address2'];
                    $customer->city = $customer_default_address['city'];
                    $customer->state = $customer_default_address['province'];
                    $customer->zip = $customer_default_address['zip'];
                    $customer->country_iso_2 = $customer_default_address['country_code'];
                }
                $order->customer = $customer;
            }

            if ($shopify_order_line_items = $shopify_order['line_items']) {
                foreach ($shopify_order_line_items as $line_item) {
                    $orderItem = new Order\OrderItem();
                    $orderItem->external_id = $line_item['id'];
                    $orderItem->quantity = $line_item['quantity'];
                    $orderItem->total_price = $line_item['price'];
                    $orderItem->product_variant_sku = $line_item['variant_title'];
                    $orderItem->setStatusByOrderStatus($order->status);

                    if ($line_item['sku']) {
                        $orderItem->design_variant_uuid = $line_item['sku'];
                        $orderItem->product_variant_uuid = DesignVariant::select('product_variant_uuid')->where('uuid', $line_item['sku'])->first()->product_variant_uuid;
                    }
                    $order->order_items[] = $orderItem;
                }
            }

            // Process transactions only when they are also in shopify order
            if ($shopify_order_transactions = $this->getOrderTransactions($shopify_order['id'])) {
                foreach ($shopify_order_transactions as $transaction) {
                    $orderTransaction = new OrderTransaction();
                    $orderTransaction->external_id = $transaction['id'];
                    $orderTransaction->transaction_nr = strtoupper(uniqid('T-'));
                    $orderTransaction->payment_type = OrderTransaction::PAYMENT_TYPE__SHOPIFY;
                    $orderTransaction->payment_method = OrderTransaction::PAYMENT_METHOD__IMPORT;
                    $orderTransaction->recognition = $transaction['gateway'] === OrderTransaction::SHOPIFY_GATEWAY__MANUAL ? OrderTransaction::RECOGNITION__MANUAL : OrderTransaction::RECOGNITION__AUTO;
                    $orderTransaction->recognized_at = $transaction['processed_at'] ? Carbon::parse($transaction['processed_at']) : null;
                    $orderTransaction->amount = $transaction['amount'];
                    $orderTransaction->setStatusFromShopify($transaction['status']);

                    $order->order_transactions[] = $orderTransaction;
                }
            }

            $admin_order_response = $this->adminApi->syncOrder($order);

            if ($admin_order_response['status'] === 'success') {
                $shopifyOrder = $this->shop->shopifyOrders->where('shopify_id', $shopify_order['id'])->first();
                $shopifyOrder->is_synced = true;
                $shopifyOrder->save();
            }
        }
    }

    /**
     * @param Design $design
     * @param ShopifyProductObject $shopifyProductObject
     * @param ShopifyProductObject\Image[] $shopifyProductObjectImages
     * @return void
     */
    private function createProduct(Design $design, ShopifyProductObject $shopifyProductObject, array $shopifyProductObjectImages): void
    {
        $productResponse = $this->shop->api()->rest(
            'POST',
            '/admin/api/' . self::VERSION . '/products.json',
            ['product' => $shopifyProductObject]
        );

        if ($productResponse['status'] === Response::HTTP_CREATED) {
            $product = $productResponse['body']['product'];

            $this->createProductImages($product, $shopifyProductObjectImages);

            $design->shopify_id = $product['id'];
            $design->shopify_status = Design::SHOPIFY_STATUS__ACTIVE;

            $this->saveProductVariantsGID($product['variants']);
            $design->save();

            $this->response_data[$design->id] = 'succeed';
        } else {
            $this->response_data[$design->id] = 'failed';

            Log::error('ShopifyManager createProduct Shopify API product response error', $productResponse);
        }
    }

    /**
     * @param Design $design
     * @param ShopifyProductObject $shopifyProductObject
     * @param ShopifyProductObject\Image[] $shopifyProductObjectImages
     * @return void
     */

    private function updateProduct(Design $design, ShopifyProductObject $shopifyProductObject, array $shopifyProductObjectImages): void
    {
        $productResponse = $this->shop->api()->rest(
            'PUT',
            '/admin/api/' . self::VERSION . "/products/{$design->shopify_id}.json",
            ['product' => $shopifyProductObject]
        );

        if ($productResponse['status'] === Response::HTTP_OK) {
            $this->createProductImages($productResponse['body']['product'], $shopifyProductObjectImages);

            $design->shopify_status = Design::SHOPIFY_STATUS__ACTIVE;
            $design->save();

            $this->response_data[$design->id] = 'succeed';
        } else {
            $this->response_data[$design->id] = 'failed';

            Log::error('ShopifyManager updateProduct Shopify API product response error', $productResponse);
        }
    }

    private function saveProductVariantsGID($variants) {
        foreach ($variants as $variant) {
            $designVariant = DesignVariant::where('uuid', $variant['sku'])->first();
            $designVariant->shopify_gid = $variant['admin_graphql_api_id'];
            $designVariant->save();
        }
    }

    /**
     * @param $product
     * @param ShopifyProductObject\Image[] $shopifyProductObjectImages
     * @return void
     */
    private function createProductImages($product, array $shopifyProductObjectImages): void
    {
        foreach ($product['variants'] as $variant) {
            if (isset($shopifyProductObjectImages[$variant['sku']])) {
                $shopifyProductObjectImage = $shopifyProductObjectImages[$variant['sku']];
                $shopifyProductObjectImage->variant_ids[] = $variant['id'];

                try {
                    $productImageResponse = $this->shop->api()->rest(
                        'POST',
                        '/admin/api/' . self::VERSION . "/products/{$variant['product_id']}/images.json",
                        ['image' => $shopifyProductObjectImage]
                    );

                    if ($productImageResponse['status'] !== Response::HTTP_OK) {
                        Log::error('ShopifyManager createProductImages Shopify API product image response error', $productImageResponse);
                    }
                } catch (\Exception $exception) {
                    Log::error('ShopifyManager createProductImages Shopify API product image error: ' . $exception->getMessage(), $exception->getTrace());
                }
            }
        }
    }

    /**
     * @param int $limit
     * @param array $filters
     * @return array
     */
    private function getOrders(int $limit = 250, array $filters = []): array
    {
        $orderListResponse = $this->shop->api()->rest(
            'GET',
            '/admin/api/' . self::VERSION . '/orders.json',
            [
                'query' => [
                    'fields' => $filters['fields'] ?? null,
                    'ids' => $filters['ids'] ?? null,
                    'limit' => $limit,
                    'since_id' => $filters['since_id'] ?? null,
                    'status' => 'open',
                    'order' => 'id ASC',
                ],
            ]
        );

        if ($orderListResponse['status'] === Response::HTTP_OK) {
            return $orderListResponse['body']['orders']->toArray();
        }

        Log::error('ShopifyManager getOrders Shopify API order response error', $orderListResponse);

        return [];
    }

    /**
     * @param ShopifyOrder $shopifyOrder
     * @return void
     */
    private function createFulfillmentOrder(ShopifyOrder $shopifyOrder): void
    {
        $fulfillmentOrderResponse = $this->shop->api()->rest(
            'GET',
            '/admin/api/' . self::VERSION . "/orders/{$shopifyOrder->shopify_id}/fulfillment_orders.json"
        );

        if ($fulfillmentOrderResponse['status'] === Response::HTTP_OK) {
            $fulfillmentOrders = $fulfillmentOrderResponse['body']['fulfillment_orders']->toArray();

            // Use end() to get the last element (the last fulfillment order)
            $lastFulfillmentOrder = end($fulfillmentOrders);

            if ($lastFulfillmentOrder['request_status'] === 'accepted') {
                $fulfillment_order_id = $lastFulfillmentOrder['id'] ?? null;

                if ($fulfillment_order_id) {
                    $fulfillmentResponse = $this->shop->api()->rest(
                        'POST',
                        '/admin/api/' . self::VERSION . '/fulfillments.json',
                        [
                            'fulfillment' => [
                                'line_items_by_fulfillment_order' => [
                                    [
                                        'fulfillment_order_id' => $fulfillment_order_id
                                    ]
                                ]
                            ]
                        ]
                    );

                    if ($fulfillmentResponse['status'] === Response::HTTP_CREATED) {
                        $this->response_data[$shopifyOrder->shopify_id] = 'succeed';
                    } else {
                        $this->response_data[$shopifyOrder->shopify_id] = 'failed';

                        Log::error('ShopifyManager createFulfillmentOrder Shopify API fulfillment response error', $fulfillmentResponse);
                    }
                } else {
                    $this->response_data[$shopifyOrder->shopify_id] = 'failed';

                    Log::error('ShopifyManager createFulfillmentOrder Shopify API fulfillment order error', $fulfillmentOrderResponse);
                }
            } else {
                Log::error('ShopifyManager createFulfillmentOrder Shopify API fulfillment order error: '.$lastFulfillmentOrder['request_status']);
            }

        } else {
            $this->response_data[$shopifyOrder->shopify_id] = 'failed';

            Log::error('ShopifyManager createFulfillmentOrder Shopify API fulfillment order response error', $fulfillmentOrderResponse);
        }
    }

    /**
     * @param int $shopify_order_id
     * @return array
     */
    private function getOrderTransactions(int $shopify_order_id): array
    {
        $orderTransactionListResponse = $this->shop->api()->rest(
            'GET',
            '/admin/api/' . self::VERSION . "/orders/{$shopify_order_id}/transactions.json"
        );

        if ($orderTransactionListResponse['status'] === Response::HTTP_OK) {
            return $orderTransactionListResponse['body']['transactions']->toArray();
        }

        Log::error('ShopifyManager getOrderTransactions Shopify API order transaction response error', $orderTransactionListResponse);

        return [];
    }

    /**
     * @return mixed
     */
    private function getLastImportedShopifyOrderShopifyId(): mixed
    {
        return $this->shop->shopifyOrders->max('shopify_id');
    }

    public function createCarrierService() {
        $carr = [
            'name' => 'Custom PFF rates',
            'callback_url' => '',
            'service_discovery' => true
        ];

        $shopApi = $this->shop->api()->rest('POST', '/admin/api/' . self::VERSION . '/carrier_services.json', ['carrier_service' =>$carr]);

        return $shopApi;
    }

    public function getLocations() {
        $shopApi = $this->shop->api()->rest('GET', '/admin/api/' . self::VERSION . '/locations.json');

        return $shopApi;
    }

    public function prepareDeliveryProfileData($gid = false) {
        // Prepare the data needed for the delivery profile creation
        $variantsToAssociate = auth()->user()->designVariants->whereNotNull('shopify_gid')->pluck('shopify_gid')->toArray();

        $profileData = [
            'locationGroupsToCreate' => [
                'locationsToAdd' => ["gid://shopify/Location/64427753651"],
                'zonesToCreate' => [
                    [
                        'name' => 'Domestic Zone',
                        'countries' => [
                            'code' => 'LV',
                            'includeAllProvinces' => true
                        ],
                        'methodDefinitionsToCreate' => [
                            [
                                'name' => 'Standard Shipping',
                                'rateDefinition' => [
                                    'price' => [
                                        'amount' => 50,
                                        'currencyCode' => 'EUR'
                                    ]
                                ],
                                'priceConditionsToCreate' => [
                                    'criteria' => [
                                        'amount' => 100,
                                        'currencyCode' => 'EUR'
                                    ],
                                    'operator' => 'GREATER_THAN_OR_EQUAL_TO'
                                ]
                            ],
                        ]
                    ],
                    [
                        'name' => 'International Zone',
                        'countries' => [
                            'code' => 'US',
                            'includeAllProvinces' => true
                        ],
                        'methodDefinitionsToCreate' => [
                            [
                                'name' => 'International Standard',
                                'rateDefinition' => [
                                    'price' => [
                                        'amount' => 10,
                                        'currencyCode' => 'EUR'
                                    ]
                                ],
                            ],
                        ]
                    ]
                ],
            ],
            'variantsToAssociate' => $variantsToAssociate,
        ];

        if ($gid) {
            $profileData['id'] = $gid;
        } else {
            $profileData['name'] = "PrintFF: Print on Demand";
        }

        return $profileData;
    }

    //Todo:: Refactoring
    protected function createDeliveryProfile($profileData) {
        $result= [];

        $mutation = <<<'GRAPHQL'
            mutation ($profile: DeliveryProfileInput!) {
              deliveryProfileCreate(profile: $profile) {
                profile {
                  id
                  name
                  profileLocationGroups {
                    locationGroup {
                      id
                      locations(first: 5) {
                        nodes {
                          name
                          address {
                            country
                          }
                        }
                      }
                    }
                    locationGroupZones(first: 1) {
                      edges {
                        node {
                          zone {
                            id
                            name
                            countries {
                              code {
                                countryCode
                              }
                            }
                          }
                          methodDefinitions(first: 1) {
                            edges {
                              node {
                                id
                                name
                                rateProvider {
                                  __typename
                                  ... on DeliveryRateDefinition {
                                    price {
                                      amount
                                      currencyCode
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
        GRAPHQL;

        $variables = [
            'profile' => $profileData
        ];

        try {
            $result = $this->shop->api()->graph($mutation, $variables);
        } catch (\Exception $exception) {
            Log::error('ShopifyManager Shopify API createDeliveryProfile error: ' . $exception->getMessage(), $exception->getTrace());
        }

        return $result['body']['data']['deliveryProfileCreate'];
    }

    //Todo:: Refactoring
    protected function updateDeliveryProfile($profileData) {
        $mutation = <<<'GRAPHQL'
            mutation ($profile: DeliveryProfileInput!) {
              deliveryProfileUpdate(profile: $profile) {
                profile {
                  id
                  name
                  profileLocationGroups {
                    locationGroup {
                      id
                      locations(first: 5) {
                        nodes {
                          name
                          address {
                            country
                          }
                        }
                      }
                    }
                    locationGroupZones(first: 1) {
                      edges {
                        node {
                          zone {
                            id
                            name
                            countries {
                              code {
                                countryCode
                              }
                            }
                          }
                          methodDefinitions(first: 1) {
                            edges {
                              node {
                                id
                                name
                                rateProvider {
                                  __typename
                                  ... on DeliveryRateDefinition {
                                    price {
                                      amount
                                      currencyCode
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
        GRAPHQL;

        $variables = [
            'profile' => $profileData
        ];

        $result = $this->shop->api()->graph($mutation, $variables);
        return $result['body']['data']['deliveryProfileUpdate'];
    }

    private function handleDeliveryProfile() {
        $deliveryProfile = ShopifyDeliveryProfile::where('user_id', auth()->id())->first();

        if ($deliveryProfile) {
            $profileData = $this->prepareDeliveryProfileData($deliveryProfile->gid);
            $this->updateDeliveryProfile($profileData);

        } else {
            $profileData = $this->prepareDeliveryProfileData();
            $newProfile = $this->createDeliveryProfile($profileData);

            if (isset($newProfile['profile']['id'])) {

                $deliveryProfile = new ShopifyDeliveryProfile([
                    'user_id' => auth()->id(),
                    'gid' => $newProfile['profile']['id'],
                    'name' => $newProfile['profile']['name'],
                ]);
                $deliveryProfile->save();
            } else {
                throw new \Exception('Failed to create a new delivery profile.');
            }
        }

        return $deliveryProfile;
    }

    private function retrieveAssignedFulfillmentOrderRequests() {
        $shopApi = $this->shop->api()->rest('GET', '/admin/api/' . self::VERSION . '/assigned_fulfillment_orders.json', [
            'assignment_status' => 'fulfillment_requested',
            'location_ids[]' => 74320216243
        ]);

        if ($shopApi['status'] === 200 && !empty($shopApi['body']['fulfillment_orders'])) {
            Log::info('Retrieve assigned Fulfillment Order Request success');

            return $shopApi['body'];
        } else {
            Log::info('Retrieve assigned Fulfillment Order Request failed:');
            Log::info('ShopApi error:', $shopApi['body']);
        }

        return null;
    }

    private function handleFulfillmentRequest($fulfillmentOrder) {

        $shopifyOrder = ShopifyOrder::where('shopify_id', $fulfillmentOrder->order_id)->first();

        if (!$shopifyOrder) {
            Log::error("Shopify order with ID {$fulfillmentOrder->order_id} not found in shopify_orders table.");
            return;
        }

        $existingFulfillmentOrder = FulfillmentOrder::where('shopify_fulfillment_order_id', $fulfillmentOrder['id'])->first();

        try {
            if (!$existingFulfillmentOrder) {
                $fulfillmentOrderModel = FulfillmentOrder::create([
                    'shopify_fulfillment_order_id' => $fulfillmentOrder['id'],
                    'shopify_order_id' => $shopifyOrder->id,
                    'status' => $fulfillmentOrder['status'],
                    'location_id' => $fulfillmentOrder['assigned_location_id'],
                    'destination' => json_encode($fulfillmentOrder['destination']),
                    'delivery_method' => json_encode($fulfillmentOrder['delivery_method']),
                ]);

                foreach ($fulfillmentOrder['line_items'] as $item) {
                    FulfillmentOrderItem::create([
                        'fulfillment_order_id' => $fulfillmentOrderModel->id,
                        'shopify_line_item_id' => $item['line_item_id'],
                        'quantity' => $item['quantity'],
                    ]);
                }
            }

            $this->acceptFulfillmentRequest($fulfillmentOrder['id']);

        } catch (\Exception $e) {
            Log::error("Failed to handle fulfillment request for order ID {$fulfillmentOrder->order_id}: " . $e->getMessage());
        }
    }

    private function acceptFulfillmentRequest($fulfillmentOrderId)
    {
        $shopApi = $this->shop->api()->rest('POST', "/admin/api/" . self::VERSION . "/fulfillment_orders/{$fulfillmentOrderId}/fulfillment_request/accept.json");

        if ($shopApi['status'] === 200) {
            Log::info("Fulfillment request for order {$fulfillmentOrderId} accepted successfully.");
        } else {
            Log::error("Failed to accept fulfillment request for order {$fulfillmentOrderId}.", $shopApi['body']);
        }

        return $shopApi;
    }

    public function processFulfillmentOrders()
    {
        $assignedFulfillmentOrders = $this->retrieveAssignedFulfillmentOrderRequests();

        if (!empty($assignedFulfillmentOrders)) {
            foreach ($assignedFulfillmentOrders['fulfillment_orders'] as $fulfillmentOrder) {
                $this->handleFulfillmentRequest($fulfillmentOrder);
            }
        }
    }
}
