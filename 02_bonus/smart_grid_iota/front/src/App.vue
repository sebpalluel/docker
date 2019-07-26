<template>
	<div id="app">
		<navbar :store="store"></navbar>
		<api :store="store"></api>
		<!--<router-view :store="store"></router-view>-->
	</div>
</template>


<script>
	import Navbar from './components/Navbar.vue' 
	import Api from './components/Api.vue' 
export default {
	name: 'app',
	data() {
		return {
			store:{
				iota:undefined,
        messages:[]
			}
		}
	},
	components: {
		'navbar': Navbar,
    'api': Api
	}
}
</script>
