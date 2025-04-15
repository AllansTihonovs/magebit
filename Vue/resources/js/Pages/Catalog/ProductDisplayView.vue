
<script setup>
import {Link} from "@inertiajs/vue3";
import LayoutAuthenticated from "@/Layouts/LayoutAuthenticated.vue";
import SectionMain from "@/Components/SectionMain.vue";
import { VueperSlides, VueperSlide } from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'
import BaseButton from "@/Components/BaseButton.vue";

defineProps({
    product: Object,
})

</script>

<template>
    <LayoutAuthenticated>
        <SectionMain>
            <div class="container">
                <div class="row">
                    <div class="col-md-6">
                        <div class="product-image-container">
                            <vueper-slides slide-image-inside>
                                <vueper-slide
                                    v-for="(image, i) in product.productAttachments"
                                    :key="i"
                                    :image="image.url">
                                </vueper-slide>
                            </vueper-slides>
                        </div>
                    </div>
                    <div class="col-md-6 product-details">
                        <div class="product-name">
                            <h1>{{ product.product_data.product_variant_name }}</h1>
                        </div>
                        <div class="product-description">
                            {{ product.product_data.description }}
                        </div>
                        <div class="product-price">
                            € {{ product.product_data.price }}
                        </div>
                    </div>
                </div>
            </div>
        </SectionMain>
    </LayoutAuthenticated>
</template>
