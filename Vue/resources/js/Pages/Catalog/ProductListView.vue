<script setup>
import {Link} from "@inertiajs/vue3";
import LayoutAuthenticated from "@/Layouts/LayoutAuthenticated.vue";
import SectionMain from "@/Components/SectionMain.vue";
defineProps({
    products: Object,
})

</script>

<template>
    <LayoutAuthenticated>
        <SectionMain>
            <div class="flex flex-wrap justify-between">
                <Link
                    v-for="product in products"
                    :key="product.id"
                    :href="route('product-display-view', {'id': product.id})"
                    class="col product-container"
                >
                    <div class="product-container-inner">
                        <div class="product-image">
                            <template v-for="(attachment, index) in product.attachment">
                                <img
                                    v-if="index === 0"
                                    :src="attachment.url"
                                    class="img-thumbnail h-80 m-auto"
                                    alt="Product image"
                                />
                            </template>
                        </div>
                        <div class="product-details">
                            <p class="product-name">
                                {{ product.product_variant_name }}
                            </p>
                            <p class="product-description-short">
                                {{ product.short_description }}
                            </p>
                            <p class="product-price">
                                € {{ product.price }}
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </SectionMain>
    </LayoutAuthenticated>
</template>

<style scoped>

</style>
