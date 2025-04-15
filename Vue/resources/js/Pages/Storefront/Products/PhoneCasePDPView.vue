<script>
import Header from "@/Pages/Storefront/Components/HeaderComponent.vue";
import Footer from "@/Pages/Storefront/Components/FooterComponent.vue";
import {Link} from "@inertiajs/vue3";
import { VueperSlides, VueperSlide } from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'
import { Ripple, Input, initTE } from "tw-elements";
import BaseButton from "@/Components/BaseButton.vue";
import {useForm} from "@inertiajs/vue3";
import SectionMain from "@/Components/SectionMain.vue";
import { mdiLeadPencil } from "@mdi/js";


export default {
    name: "PhoneCasePDPView",
    data() {
        const firstModel = this.categoryProducts.phone_model_list[0]

        const form = useForm({
            quantity: 1,
            sku: firstModel.sku,
            title: '',
            description: '',
        });

        return {
            isSelected: false,
            selected_options: [
                firstModel
            ],
            form,
            mdiLeadPencil
        }
    },
    props: {
        categoryProducts: Object,
    },
    components: {
        SectionMain,
        Header,
        Footer,
        Link,
        VueperSlides,
        VueperSlide,
        BaseButton,
        useForm,
        mdiLeadPencil
    },
    mounted() {
        initTE({ Input, Ripple })
    },
    methods: {
        selectSwatch(option, index) {
            this.$refs.vueperslides2.goToSlide(index)

            if (this.selected_options.includes(option)) {
                this.selected_options = this.selected_options.filter(
                    (item) => item !== option
                );
            } else {
                this.selected_options = [];
                this.selected_options.push(option);
            }

            if (this.selected_options.length > 0) {
                this.form.sku = this.selected_options[0].sku;
            } else {
                this.form.sku = '';
            }
        },

        submit() {
            this.form.title = this.categoryProducts.category_name;
            this.form.description = this.categoryProducts.product_data.description;
            this.form.post(route('designer', this.form.sku));
        }
    }
}
</script>

<template>
    <SectionMain>
        <div class="mx-auto pt-10 product-details-container">
            <div class="flex">
                <div class="product-image flex-1 px-2">
                    <div class="product-image-container bg-white">
                        <vueper-slides
                            slide-image-inside
                            ref="vueperslides1"
                            :bullets="false"
                            fixed-height="700px"
                            @slide="$refs.vueperslides2.goToSlide($event.currentSlide.index, { emit: false })">
                            <vueper-slide
                                v-for="(model, i) in categoryProducts.phone_model_list"
                                :key="i"
                                :image="model.attachment_url">
                            </vueper-slide>
                        </vueper-slides>
                        <vueper-slides
                            class="no-shadow thumbnails"
                            ref="vueperslides2"
                            @slide="$refs.vueperslides1.goToSlide($event.currentSlide.index, { emit: false })"
                            :visible-slides="6"
                            fixed-height="100px"
                            :gap="2.5"
                            :bullets="false"
                            :arrows="false">
                            <vueper-slide
                                v-for="(model, i) in categoryProducts.phone_model_list"
                                :key="i"
                                :image="model.attachment_url"
                                @click.native="$refs.vueperslides2.goToSlide(i)">
                            </vueper-slide>
                        </vueper-slides>
                    </div>
                </div>
                <div class="product-info flex-1 px-4">
                    <h1 class="product-title">{{categoryProducts.category_name}}</h1>
                    <div class="product-price">
                        <h2 class="price" id="price-preview"><span class="money" >€{{categoryProducts.product_data.price}}</span></h2>
                    </div>
                    <div class="product-stock">
                        <span class="product-stock-title">Availability:</span>
                        <div class="product-stock-description">In-Stock</div>
                    </div>
                    <div class="product-description">
                        {{categoryProducts.product_data.description}}
                    </div>
                    <form @submit.prevent="submit">
                        <ul class="swatch-btn-container flex flex-wrap mb-6">
                            <li class="swatch-btn" v-for="(model, index) in categoryProducts.phone_model_list" :key="model" role="group">
                                <button
                                    type="button"
                                    :class="{'swatch-selected': selected_options.includes(model)}"
                                    class="shadow-md"
                                    :name="model.sku"
                                    @click.prevent="selectSwatch(model, index)"
                                    data-te-ripple-init
                                    data-te-ripple-color="light">
                                    <span>{{ model.name }}</span>
                                </button>
                                <input type="hidden" name="sku" :value="model.sku" />
                            </li>
                        </ul>
                        <div class="block text-right">
                            <BaseButton
                                type="submit"
                                :icon="mdiLeadPencil"
                                class="rounded-[90px]"
                                color="info"
                                label="Customize"
                                id="customize-product"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </SectionMain>
</template>

<style scoped>
.product-title {
    margin-top: 0;
    text-transform: uppercase;
    color: #1a1a1a;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.1em;
    margin-bottom: 20px;
    width: 100%;
}

.product-price .price {
    color: #91ad41;
    font-weight: 500;
    font-size: 20px;
    margin-bottom: 30px;
}

.product-stock {
    font-size: 14px;
    margin-bottom: 5px;
    display: inline-flex;
}

.product-stock-title {
    color: #282828;
    font-weight: 500;
    margin-right: 5px;
    font-size: 14px;
    text-transform: uppercase;
}

.product-stock-description {
    color: #91ad41;
    font-weight: 300;
}

.product-description {
    font-size: 14px;
    color: #8b8b99;
    line-height: 1.8em;
    font-weight: 400;
    margin-bottom: 30px;
}

.swatch-btn {
    margin: 0 5px 5px 0;
}

.swatch-btn button {
    border: 2px solid #fff;
    padding: 6px 18px;
    border-radius: 90px;
    color: #000;
    background-color: #fff;
    text-decoration-color: #000;
    text-transform: uppercase;
    font-size: 16px;
}
.swatch-btn button:hover, .swatch-btn .swatch-selected {
    color: #fff;
    background-color: #91278F;
    border-color: #91278F;
    text-decoration-color: #fff;
}

.quantity-wrapper input {
    max-width: 100px;
}
</style>
