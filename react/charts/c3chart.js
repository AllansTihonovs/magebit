
(function (exports) {

	function C3Chart() {
	}

	C3Chart.prototype = {
		create: function(component) {

			var bindto= {bindto :'#' + component.chartId,};
			var data = component.data;
			_.extend(data, bindto);

			if (data.axis.y !== undefined && data.data.percentage !== true) {
				data.axis.y.tick = {
					format: value => this.numberFormat(value)
				};

			} else if (data.data.percentage === true) {
                data.axis.y.tick = {
                    format: value => this.numberFormatPercent(value)
                };

                data.data.labels = {
                    format: value => this.numberFormatPercent(value)
                }
			}

	        var chart = c3.generate(data);

	        this.chart = chart;
	        this.type = component.type;

	        return chart;
		},

		numberFormat: function (value) {
			return d3.format(',.2f')(value).replace('.', ' ').replace(/,/g, '.').replace(' ', ',');
		},

        numberFormatPercent: function (value) {
            return value + '%';
        },

		load: function(component) {
			if (this.chart) {
				this.chart.load({
					columns: component.data.data.columns,
					unload: true,
				})
			}
		},

		resize: function() {
			this.chart.flush();
		},

		remove: function() {
			var chart = this.chart;
			if (chart) {
				this.chart = chart.destroy();
			}
		},
	};

	exports.C3Chart = C3Chart;
})(window);
