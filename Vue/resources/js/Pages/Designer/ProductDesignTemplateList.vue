<script>
import LayoutAuthenticated from "@/Layouts/LayoutAuthenticated.vue";
import SectionMain from "@/Components/SectionMain.vue";
import {Link, router, useForm} from "@inertiajs/vue3";
import BaseButton from "@/Components/BaseButton.vue";
import SectionTitle from "@/Components/SectionTitle.vue";
import Dropdown from "@/Components/Dropdown.vue";
import DropdownLink from "@/ComponentsBreeze/DropdownLink.vue";

export default {
    name: "ProductDesignTemplateList",
    data() {
        const form = useForm({
            title: '',
            description: '',
            retailPrices: {},
            uuid: '',
            selectedIds: {}
        });

        return {
            selectAll: false,
            selectedDesigns: [],
            form,
        };
    },
    components: {
        DropdownLink,
        Dropdown,
        SectionTitle,
        SectionMain,
        LayoutAuthenticated,
        Link,
        useForm,
        BaseButton,
    },
    props: {
        templateList: Array
    },
    computed: {
        rowCheckboxes() {
            return this.templateList.map(() => this.selectAll);
        },
    },
    watch: {
        selectAll(value) {
            this.selectedDesigns = value ? this.templateList.map(design => design.id) : [];
        }
    },

    methods: {
        getPublishRoute(designId) {
            $('.v-spinner').show();

            this.form.post(route('designs.publish', {'id': designId}), {
                onSuccess: () => {
                },
                onError: () => {
                    console.log(form.errors)
                },
                onFinish: () => {
                    $('.v-spinner').hide();
                },
            });
        },
        getCartStoreRoute(uuid) {
            this.form.uuid = uuid;
            this.form.post(route('cart.store'));
        },
        deleteDesign(designId) {
            this.form.delete(route('designs.destroy', designId));
        },
        deleteSelectedDesigns() {
            if (!confirm('Are you sure you want to delete the selected designs?')) {
                return;
            }
            if (this.selectedDesigns.length === 0) {
                return;
            }
            this.form.selectedIds = this.selectedDesigns;
            this.form.delete(route('designs.mass.destroy'), {
                onSuccess: () => {
                    this.selectedDesigns = [];
                },
                onError: (error) => {
                    console.log(error);
                },
            });
        },
        clickRow(designId) {
            router.get('/dashboard/design-details/edit/'+designId)
        },
        handleCheckboxChange(e) {
            const designId = e.target.value;
            if (e.target.checked) {
                if (!this.selectedDesigns.includes(designId)) {
                    this.selectedDesigns.push(designId);
                }
            } else {
                this.selectedDesigns = this.selectedDesigns.filter(id => id !== designId);
            }
        }
    },
    mounted() {}
}
</script>

<template>
    <LayoutAuthenticated>
        <SectionTitle>
            Product Designs
        </SectionTitle>
        <SectionMain>
            <div class="design-list-container">
                <div class="flex flex-col">
                    <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div>
                                <div class="table-responsive">
                                    <div class="flex items-center justify-between mb-2 ml-5">
                                        <div class="flex">
                                            <label class="flex items-center space-x-2 cursor-pointer">
                                                <input type="checkbox" class="form-checkbox" v-model="selectAll">
                                                <span class="ml-2">Select all</span>
                                            </label>
                                            <div class="ml-4">
                                                <Dropdown align="right" width="48">
                                                    <template #trigger>
                                                        <span class="inline-flex rounded-md">
                                                            <button
                                                                type="button"
                                                                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                                            >
                                                                Action

                                                                <svg class="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    </template>

                                                    <template #content>
                                                        <DropdownLink href="#" @click.prevent="deleteSelectedDesigns">
                                                            Delete
                                                        </DropdownLink>
                                                    </template>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </div>
                                    <table class="table table-hover text-nowrap min-w-full text-left text-sm font-light bg-white rounded-[20px]">
                                        <thead class="font-medium dark:border-neutral-500">
                                            <tr>
                                                <th scope="col" class="py-4"></th>
                                                <th scope="col" class="px-6 py-4">Canvas Image</th>
                                                <th scope="col" class="px-6 py-4">Product</th>
                                                <th scope="col" class="px-6 py-4">Status</th>
                                                <th scope="col" class="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr class="hover:cursor-pointer" v-for="(design, index) in templateList" :key="design.id" @click="clickRow(design.id)">
                                                <td class="whitespace-nowrap py-4">
                                                    <input type="checkbox" class="form-checkbox"
                                                           :value="design.id"
                                                           @click.stop
                                                           @change="handleCheckboxChange"
                                                           :checked="selectedDesigns.includes(design.id)"
                                                           v-model="rowCheckboxes[index]">
                                                </td>
                                                <td class="whitespace-nowrap px-6 py-4">
                                                    <img width="100" :src="design.design_variants[0] ? '/storage/'+design.design_variants[0].canvas_image_path : ''" alt="Print file">
                                                </td>
                                                <td class="whitespace-nowrap px-6 py-4">
                                                    <p><b>{{ design.title }}</b></p>
                                                    <p>Variant count: {{ design.design_variants.length }}</p>
                                                </td>
                                                <td class="whitespace-nowrap px-6 py-4">
                                                    <span class="ud-publishing-status" :class="design.shopify_status === 'active' ? 'active' : ''">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="#E7E7E7">
                                                            <circle cx="5" cy="5" r="5" fill="#E7E7E7"/>
                                                        </svg>
                                                    {{ design.shopify_status === 'active' ? 'Published' : 'Unpublished' }}
                                                    </span>
                                                </td>
                                                <td class="whitespace-nowrap inline-flex px-6 py-10">
                                                    <a :href="route('designer.edit', design.id)" class="action-btn pt-2" @click.stop>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                                            <g clip-path="url(#clip0_58_657)">
                                                                <path d="M0 12.3321V17H4.66798L14.0039 7.66411L9.33584 2.99609L0 12.3321ZM4.07322 15.5637L2.87253 15.5638V14.1275H1.4363V12.9267L2.45742 11.9056L5.09433 14.5425L4.07322 15.5637ZM9.69522 4.90375C9.85959 4.90375 9.94189 4.98609 9.94189 5.15057C9.94189 5.22548 9.91579 5.28895 9.86332 5.34142L3.78144 11.4233C3.72905 11.4755 3.66542 11.5017 3.59066 11.5017C3.42622 11.5017 3.34388 11.4192 3.34388 11.2549C3.34388 11.18 3.37006 11.1165 3.42237 11.064L9.50429 4.98228C9.55653 4.92993 9.62016 4.90375 9.69522 4.90375Z" fill="black"/>
                                                                <path d="M16.5842 3.05199L13.9474 0.426352C13.6631 0.142235 13.3227 0 12.9262 0C12.5221 0 12.1857 0.142235 11.9164 0.426352L10.0537 2.27785L14.7218 6.94579L16.5845 5.08317C16.8612 4.80636 16.9995 4.46974 16.9995 4.07322C16.9994 3.68432 16.8611 3.34384 16.5842 3.05199Z" fill="black"/>
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_58_657">
                                                                    <rect width="17" height="17" fill="white"/>
                                                                </clipPath>
                                                            </defs>
                                                        </svg>
                                                    </a>
                                                    <form @submit.prevent="deleteDesign(design.id)">
                                                        <button type="submit" class="action-btn pt-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                                                                <path d="M18.375 4.375H2.625C2.39294 4.375 2.17038 4.46719 2.00628 4.63128C1.84219 4.79538 1.75 5.01794 1.75 5.25C1.75 5.48206 1.84219 5.70462 2.00628 5.86872C2.17038 6.03281 2.39294 6.125 2.625 6.125H4.375V16.625C4.37521 17.3211 4.65184 17.9887 5.14408 18.4809C5.63631 18.9732 6.30387 19.2498 7 19.25H14C14.6961 19.2498 15.3637 18.9732 15.856 18.481C16.3482 17.9887 16.6248 17.3211 16.625 16.625V6.125H18.375C18.6071 6.125 18.8296 6.03281 18.9937 5.86872C19.1578 5.70462 19.25 5.48206 19.25 5.25C19.25 5.01794 19.1578 4.79538 18.9937 4.63128C18.8296 4.46719 18.6071 4.375 18.375 4.375ZM9.625 14C9.625 14.2321 9.53281 14.4546 9.36872 14.6187C9.20463 14.7828 8.98207 14.875 8.75 14.875C8.51794 14.875 8.29538 14.7828 8.13128 14.6187C7.96719 14.4546 7.875 14.2321 7.875 14V9.625C7.875 9.39294 7.96719 9.17038 8.13128 9.00628C8.29538 8.84219 8.51794 8.75 8.75 8.75C8.98207 8.75 9.20463 8.84219 9.36872 9.00628C9.53281 9.17038 9.625 9.39294 9.625 9.625V14ZM13.125 14C13.125 14.2321 13.0328 14.4546 12.8687 14.6187C12.7046 14.7828 12.4821 14.875 12.25 14.875C12.0179 14.875 11.7954 14.7828 11.6313 14.6187C11.4672 14.4546 11.375 14.2321 11.375 14V9.625C11.375 9.39294 11.4672 9.17038 11.6313 9.00628C11.7954 8.84219 12.0179 8.75 12.25 8.75C12.4821 8.75 12.7046 8.84219 12.8687 9.00628C13.0328 9.17038 13.125 9.39294 13.125 9.625V14Z" fill="black"/>
                                                                <path d="M8.75 3.5H12.25C12.4821 3.5 12.7046 3.40781 12.8687 3.24372C13.0328 3.07962 13.125 2.85706 13.125 2.625C13.125 2.39294 13.0328 2.17038 12.8687 2.00628C12.7046 1.84219 12.4821 1.75 12.25 1.75H8.75C8.51794 1.75 8.29538 1.84219 8.13128 2.00628C7.96719 2.17038 7.875 2.39294 7.875 2.625C7.875 2.85706 7.96719 3.07962 8.13128 3.24372C8.29538 3.40781 8.51794 3.5 8.75 3.5Z" fill="black"/>
                                                            </svg>
                                                        </button>
                                                    </form>
                                                    <form @submit.prevent="getPublishRoute(design.id)" class="publish-form" :id="'publishDesign-' + index">
                                                        <BaseButton type="submit" color="info" label="Publish" />
                                                    </form>
                                                    <form @submit.prevent="getCartStoreRoute(design.uuid)">
                                                        <BaseButton type="submit" color="info" label="Create Order" />
                                                    </form>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SectionMain>
    </LayoutAuthenticated>
</template>

<style scoped>

</style>
