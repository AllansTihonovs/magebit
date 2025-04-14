<?php

namespace App\Http\Controllers;


use App\Services\ShopifyManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Log;

class ShopifyController extends Controller {
    private $shop;
    public const VERSION = '2024-07';

    public function __construct() {

    }

    public function index() {
        $shop = Auth::user();
        $domain = $shop->getDomain()->toNative();
        $shopApi = $shop->api()->rest('POST', '/admin/shop.json')['body']['shop'];

        Log::info("Shop {$domain}'s object:" . json_encode($shop));
        Log::info("Shop {$domain}'s API objct:" . json_encode($shopApi));
    }

    /**
     * @param $id
     * @return JsonResponse
     */
    public function publishProducts($id): JsonResponse
    {
        $shopifyManager = new ShopifyManager(auth()->user()->shops()->first());
        $response_data = $shopifyManager->publishProducts($id);

        return response()->json($response_data);
    }

    public function carrierCreate() {
        $shopifyManager = new ShopifyManager(auth()->user()->shops()->first());
        $response_data = $shopifyManager->createCarrierService();

        return response()->json($response_data);
    }

    public function getLocations() {
        $shopifyManager = new ShopifyManager(auth()->user()->shops()->first());
        $response_data = $shopifyManager->getLocations();

        return response()->json($response_data);
    }

    public function createFulfillmentService() {
        $fulfillmentService = [
            'name' => 'Printff fulfillment service',
            'callback_url' => 'https://e17d2ac342cb.ngrok.app/api/webhooks',
            'inventory_management' => false,
            'permits_sku_sharing' => false,
            'fulfillment_orders_opt_in' => true,
            'tracking_support' => true,
            'requires_shipping_method' => true,
            'format' => 'json'
        ];

        return auth()->user()->shops()->first()->api()->rest('POST', '/admin/api/' . self::VERSION . '/fulfillment_services.json', [
            'fulfillment_service' => $fulfillmentService
        ]);
    }

    public function createFulfillmentServiceList() {
        return auth()->user()->shops()->first()->api()->rest('GET', '/admin/api/' . self::VERSION . '/fulfillment_services.json');
    }

    //TODO:: Reject fulfillment request
    public function rejectFulfillmentRequest() {

    }
}
