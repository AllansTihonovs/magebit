<?php

namespace App\Console\Commands;

use App\Models\Shop;
use App\Services\ShopifyManager;
use Illuminate\Console\Command;

class SyncShopifyOrdersToAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shopify-order:sync-to-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Syncs shopify orders to admin';

    /**
     * @return void
     */
    public function handle(): void
    {
        $shops = Shop::with('shopifyOrders')->get();

        foreach ($shops as $shop) {
            $this->comment('Start: ' . now() . " — {$shop->name}");

            $shopifyManager = new ShopifyManager($shop);
            $shopifyManager->syncShopifyOrdersToAdmin();

            $this->comment('End:   ' . now() . " — {$shop->name}");
        }

        $this->info('Completed');
    }
}
