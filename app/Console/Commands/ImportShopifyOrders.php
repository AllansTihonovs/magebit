<?php

namespace App\Console\Commands;

use App\Models\Shop;
use App\Services\ShopifyManager;
use Illuminate\Console\Command;

class ImportShopifyOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shopify-order:import';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Imports shopify orders';

    /**
     * @return void
     */
    public function handle(): void
    {
        $shops = Shop::with('shopifyOrders')->get();

        foreach ($shops as $shop) {
            $this->comment('Start: ' . now() . " — {$shop->name}");

            $shopifyManager = new ShopifyManager($shop);
            $shopifyManager->importShopifyOrders();

            $this->comment('End:   ' . now() . " — {$shop->name}");
        }

        $this->info('Completed');
    }
}
