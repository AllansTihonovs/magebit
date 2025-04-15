(function (exports) {

	function BarChart() {
		C3Chart.call(this);
	}

	BarChart.prototype = Object.create(C3Chart.prototype);

	BarChart.prototype.load = function(component) {

		if (this.chart) {
			this.chart.load({
				columns: component.data.data.columns,
				unload: true,
			});

			if (component.data.grid) {
				this.chart.ygrids(component.data.grid.y.lines);
			}
		}
	};

	exports.BarChart = BarChart

})(window);
