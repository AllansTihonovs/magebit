
(function (exports) {

	function DonutChart() {
		C3Chart.call(this);
	}

	DonutChart.prototype = Object.create(C3Chart.prototype);

	exports.DonutChart = DonutChart;
})(window);