<?php

namespace App\Services;

use App\Objects\API\Order;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class AdminApi
{
    /**
     * @var mixed
     */
    private mixed $admin_api_endpoint;

    /**
     * @var mixed
     */
    private mixed $admin_api_access_token;

    public function __construct()
    {
        $this->admin_api_endpoint = env('ADMIN_SYSTEM_API_URL');
        $this->admin_api_access_token = env('API_ACCESS_TOKEN');
    }

    /**
     * @return array
     */
    public function getOrders(): array
    {
        $response = Http::withToken($this->admin_api_access_token)
            ->get("{$this->admin_api_endpoint}/orders");

        return $this->getResponseData($response);
    }

    /**
     * @param Order $order
     * @return array
     */
    public function syncOrder(Order $order): array
    {
        $response = Http::withToken($this->admin_api_access_token)
            ->post("{$this->admin_api_endpoint}/orders/sync", $order);

        return $this->getResponseData($response);
    }

    /**
     * @param Response $response
     * @return array
     */
    private function getResponseData(Response $response): array
    {
        if (!in_array($response->status(), [200, 201], true)) {
            return [
                'status' => 'error',
                'message' => $response->body(),
            ];
        }

        return [
            'status' => 'success',
            'data' => $response->json(),
        ];
    }
}
