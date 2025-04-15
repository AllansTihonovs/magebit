<script>
import 'vueperslides/dist/vueperslides.css'
import LayoutAuthenticated from "@/Layouts/LayoutAuthenticated.vue";
import PhoneCasePDPView from "@/Pages/Storefront/Products/PhoneCasePDPView.vue";
import Breadcrumbs from "@/Components/Breadcrumbs.vue";
import SectionTitle from "@/Components/SectionTitle.vue";

export default {
    data() {
        return {
        }
    },
    props: {
        categoryProducts: Object,
    },
    components: {
        SectionTitle,
        PhoneCasePDPView,
        LayoutAuthenticated,
        Breadcrumbs
    },
    mounted() {
    },
}

</script>

<template>
    <LayoutAuthenticated>
        <Breadcrumbs />
        <PhoneCasePDPView :categoryProducts="categoryProducts"/>
    </LayoutAuthenticated>
</template>

<style scoped>
</style>
