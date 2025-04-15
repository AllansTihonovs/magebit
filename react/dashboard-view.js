import {Loader} from "./components/Loader";
import {Return} from "./components/Return";

(function (exports) {

	function View(dashboards) {

		var dataPicker = undefined;

		var NewPanelPopUp = React.createClass({

			addPanel: function(ev) {

				var dashboard = this.props.dashboard;

				dashboard.panels.add(ev);

				//reseting the state
				this.setState(this.getInitialState());

				// Close popup that is currently opened
				$.magnificPopup.instance.close();
			},

			handleChange: function(ev) {
				var state = {};
				state[$(ev.target).data("property")] = ev.target.value;
				this.setState(state);
			},

			getInitialState: function() {
				return {
					title: "",
					procedureName: "",
					width: 12,
					height: 8
				};
			},

			componentDidMount: function() {
				var dashboard = this.props.dashboard;
				dashboard.addReactComponent({_newPanelForm: this});
			},

			render: function() {
				return (
					<div id="new-panel-popup" className="popup mfp-hide">
						<h2 className="clearfix">New panel</h2>

						<input id="panel-title" placeholder="panel title" data-property="title" value={this.state.title} onChange={this.handleChange} />
						<input id="panel-procedure-name" placeholder="procedure name" data-property="procedureName" value={this.state.procedureName} onChange={this.handleChange} />

						<input id="panel-link-name" placeholder="link name" data-property="link_name" value={this.state.link_name} onChange={this.handleChange} />
						<input id="panel-link-address" placeholder="link address" data-property="link_address" value={this.state.link_address} onChange={this.handleChange} />

						<div className="clearfix"></div>
						<label for="new-panel-width">Width</label>
						<input id="new-panel-width" type="text" placeholder="width: 1-12" data-property="width" className="short-input" value={this.state.width} onChange={this.handleChange} />

						<label for="new-panel-height">Height</label>
						<input id="new-panel-height" type="text" placeholder="height: 1=20px" data-property="height" className="short-input" value={this.state.height} onChange={this.handleChange} />
						<div className="clearfix"></div>

						<button className="button-fat" id="add-panel" onClick={this.addPanel}>Add</button>
					</div>
				);
			}
		});

		var EditPanelPopUp = React.createClass({

			editPanel: function(ev) {

				var dashboard = this.props.dashboard;

				var panel_id = this.state.panelId;
				dashboard.panels.edit(panel_id);

				// Close popup that is currently opened
				$.magnificPopup.instance.close();
			},

			handleChange: function(ev) {
				var state = {};
				state[$(ev.target).data("property")] = ev.target.value;
				this.setState(state);
			},

			getInitialState: function() {
				return {
					panelId: "", title: "", procedureName: "", width: "",
					height: "", link_name: "", link_address: "",
				};
			},

			componentDidMount: function() {
				var dashboard = this.props.dashboard;
				dashboard.addReactComponent({_editPanelForm: this});
			},

			render: function() {

				return (
					<div id="edit-panel-popup" className="popup mfp-hide">
						<h2>Edit panel</h2>

						<input type="hidden" id="edit-panel-id" value={this.state.panelId} />
						<input id="edit-panel-title" placeholder="panel title" data-property="title" value={this.state.title} onChange={this.handleChange} />
						<input id="edit-panel-procedure-name" placeholder="procedure name" data-property="procedureName" value={this.state.procedureName} onChange={this.handleChange} />

						<input id="edit-panel-link-name" placeholder="link name" data-property="link_name" value={this.state.link_name} onChange={this.handleChange} />
						<input id="edit-panel-link-address" placeholder="link address" data-property="link_address" value={this.state.link_address} onChange={this.handleChange} />

						<div className="clearfix"></div>
						<label for="edit-panel-width">Width</label>
						<input id="edit-panel-width" type="text" placeholder="width: 1-12" data-property="width" className="short-input" value={this.state.width} onChange={this.handleChange} />

						<label for="edit-panel-height">Height</label>
						<input id="edit-panel-height" type="text" placeholder="height: 1=20px" data-property="height" className="short-input" value={this.state.height} onChange={this.handleChange} />
						<div className="clearfix"></div>

						<button className="button-fat" id="edit-panel" onClick={this.editPanel}>Save</button>
					</div>
				);
			}
		});

		var NewChartPopUp = React.createClass({

			addChart: function(ev) {

				var dashboard = this.props.dashboard;
				dashboard.charts.add();

				//reseting the state
				this.setState(this.getInitialState());

				$.magnificPopup.instance.close();
			},

			handleChange: function(ev) {
				var state = {};
				state[$(ev.target).data("property")] = ev.target.value;
				this.setState(state);
			},

			getInitialState: function() {
				return {panelId: "", procedureName: "", width: 8, height: 6,};
			},

			componentDidMount: function() {

				var dashboard = this.props.dashboard;

				$('#select-chart-type').chosen({
					disable_search_threshold: 10,
					allow_single_deselect: true,
					placeholder_text_single: "Select chart type",
					width: 400
				});

				dashboard.addReactComponent({_chartForm: this});
			},

			render: function() {
				return (
					<div id="chart-popup" className="popup mfp-hide">
						<h2>New chart</h2>
						<ChartSelection id="select-chart-type" />

						<div className="clearfix"></div>
						<input id="add-chart-procedure-name" placeholder="procedure name" data-property="procedureName" value={this.state.procedureName} onChange={this.handleChange} />

						<input id="add-chart-link-name" placeholder="link name" data-property="link_name" value={this.state.link_name} onChange={this.handleChange} />
						<input id="add-chart-link-address" placeholder="link address" data-property="link_address" value={this.state.link_address} onChange={this.handleChange} />

						<div className="clearfix"></div>
						<label for="add-chart-width">Width</label>
						<input id="add-chart-width" type="text" placeholder="width: 1-12" data-property="width" className="short-input" value={this.state.width} onChange={this.handleChange} />

						<label for="add-chart-height">Height</label>
						<input id="add-chart-height" type="text" placeholder="height: 1=20px" data-property="height" className="short-input" value={this.state.height} onChange={this.handleChange} />
						<div className="clearfix"></div>

						<div className="clearfix"></div>
						<input type="hidden" id="add-chart-parent-panel-id" value={this.state.panelId} />

						<div className="clearfix"></div>
						<button className="button-fat" id="add-new-chart" onClick={this.addChart}>Add</button>
					</div>
				);
			}
		});

		var EditChartPopUp = React.createClass({

			editChart: function(ev) {
				var dashboard = this.props.dashboard;

				var id = $("#edit-chart-id").val();
				dashboard.charts.edit(id, this.state.panelId);

				$.magnificPopup.instance.close();
			},

			handleChange: function(ev) {
				var state = {};
				state[$(ev.target).data("property")] = ev.target.value;
				this.setState(state);
			},

			getInitialState: function() {
				return {
					id: "", procedureName: "", width: "",
					height: "", chartType: "", panelId: ""
				};
			},

			componentDidMount: function() {

				var dashboard = this.props.dashboard;

				$('#edit-chart-type').chosen({
					disable_search_threshold: 10,
					allow_single_deselect: true,
					placeholder_text_single: "Select chart type",
					width: 400,
				});

				dashboard.addReactComponent({_editChartForm: this});
			},

			render: function() {

				return (
					<div id="edit-chart-popup" className="popup mfp-hide">

						<h2>Edit chart</h2>

						<input type="hidden" id="edit-chart-id" value={this.state.id} />

						<ChartSelection id="edit-chart-type" selected={this.state.chartType}/>

						<div className="clearfix"></div>
						<input id="edit-procedure-name" placeholder="procedure name" data-property="procedureName" value={this.state.procedureName} onChange={this.handleChange} />
						<div className="clearfix"></div>

						<input id="edit-chart-link-name" placeholder="link name" data-property="link_name" value={this.state.link_name} onChange={this.handleChange} />
						<input id="edit-chart-link-address" placeholder="link address" data-property="link_address" value={this.state.link_address} onChange={this.handleChange} />

						<label for="edit-chart-width">Width</label>
						<input id="edit-chart-width" type="text" placeholder="width: 1-12" className="short-input" data-property="width" value={this.state.width} onChange={this.handleChange}  />

						<label for="edit-chart-height">Height</label>
						<input id="edit-chart-height" type="text" placeholder="height: 1=20px" className="short-input" data-property="height" value={this.state.height} onChange={this.handleChange}  />

						<div className="clearfix"></div>
						<button className="button-fat" id="edit-chart" onClick={this.editChart}>Save</button>
					</div>
				);
			}
		});

		var ChartSelection = React.createClass({

			getInitialState: function() {

				var options = [
					{name: "BarChart"},
					{name: "PieChart"},
					{name: "SpeedometerChart"},
					{name: "DonutChart"},
					{name: "SimpleXYLineChart"},
					{name: "StackedChart"},
					{name: "FlatGaugeChart"},
					{name: "TableTypeChart"},
				];

				return {options: options,};
			},

			render: function() {

				var self = this;

				var options = this.state.options.map(function(option) {

					if (option.name == self.props.selected) {
						return <option selected value={option.name}>{option.name}</option>
					} else {
						return <option value={option.name}>{option.name}</option>
					}
				});

				return (
					<Chosen id={this.props.id} width={"270px"} disableSearch="true">
						{options}
					</Chosen>
				);
			}
		});

		var ControlSelections = React.createClass({

			selectData: function() {
				var dashboard = this.props.dashboard;
				dashboard.getData();
			},

			selectControlByName: function(component_id) {
				var dashboard = this.props.dashboard;

				return _.find(dashboard.controls, function(tmp_control) {
					return tmp_control.id == component_id;
				});
			},

			handleSelection: function(e) {

				var self = this;

				var dashboard = this.props.dashboard;

				var target = $(e.target);
				var component_id = target.attr("id");

				var control = self.selectControlByName(component_id);
				if (!control) {
					console.error("No control found");
					return;
				}

				var selected_value = $('option:selected', $('#' + component_id)).val();

				var link = new URL(window.location.href);
				link.searchParams.set(control.apiKey, selected_value);
				history.replaceState({}, '', link.href);

				dashboard.selections[control.apiKey] = selected_value;

				_.each(control.selectControls, function(select_control_id) {

					var widget = dashboard.widgets[select_control_id];
					if (!widget) {
						console.error("No widget found ", select_control_id);
						return;
					}

					var selected_control = self.selectControlByName(select_control_id);
					if (!selected_control) {
						console.error("No control found by id ", select_control_id)
						return;
					}

					var options = _.filter(selected_control.data, function(option) {
						return option.clinic_id == dashboard.selections.clinic_id;
					});

					var name = -1;
					var selected = 1;
					if (_.size(options) > 0) {

						var tmp_option = _.find(options, function(opt) {
							return opt.name;
						});

						if (tmp_option) {
							name = tmp_option.notaplan_id;
							selected = 1;
						}
					}

					dashboard.selections[selected_control.apiKey] = name;
					widget.setState({
						options: options,
						selected: selected
					});
				});

				self.selectData();
			},

			getInitialState: function() {

				var self = this;
				var dashboard = this.props.dashboard;

				// the current control
				var control = this.props.control;

				// selecting the linked controls, for example, for employee => shops
				var depended_controls = _.filter(dashboard.data.controls, function(tmp_control) {

					// selecting the control if it contains the current control id
					return _.contains(tmp_control.selectControls, control.id);
				});

				var options = control.data;
				if (_.size(depended_controls) > 0) {
					options = _.map(depended_controls, function(depended_control) {
						return _.filter(control.data, function(option) {
							var id = depended_control.apiKey;
							return option[id] == dashboard[id];
						});
					});
				}

				//options = _.flatten(options);

				return {
					options: options,
					selected: 0
				};
			},

			componentDidMount: function() {

				var dashboard = this.props.dashboard;
				var id = this.props.id;

				$("#" + id).chosen({disable_search_threshold: 10});

				dashboard.widgets[id] = this;
			},

			render: function() {

				var dashboard = this.props.dashboard;

				var state = this.state;
				var control = this.props.control;
				var select_by = control.selectBy;
				var render_by = 'id';

				if (control.apiKey == 'clinic_id') {
					var options = _.map(_.sortBy(this.state.options, 'name'), function(option, i) {
						if (option.type == 'group') {
							var buffer = [];

							buffer.push(<option className="group-result" value={"g" + option.id}>{option.name}</option>);

							var options = _.map(option.clinics, function(clinic){
								buffer.push(<option value={"c" + clinic.id}>{clinic.name}</option>);
							});

							return (buffer);
						} else {

							let selected = false;
							var link = new URL(window.location.href);
							var clinic_id = link.searchParams.get('clinic_id');

							if ("c" + option.id == clinic_id) {
								selected = true;
							}

							return <option value={"c" + option.id} selected={selected}>{option.name}</option>
						}
					});
				} else {
					var options = _.map(this.state.options, function(option, i) {
						if (option[render_by] == dashboard.selections[select_by]) {
							return <option selected id={option[render_by]} data-clinic-id={option[render_by]}>{option.name}</option>
						} else {
							return <option id={option[render_by]} data-clinic-id={option[render_by]}>{option.name}</option>
						}
					});
				}

				return (
					<div className="chooser-wrapper">
						<Chosen className="float-r" id={this.props.id} style={{"width": "320px"}} onChange={this.handleSelection}>
							{options}
						</Chosen>
					</div>
				);
			}
		});

		var AddPanel = React.createClass({

			openPanelPopup: function(ev) {
				//new panel form
				$('.new-panel-popup-link').magnificPopup({
					type: 'inline'
				});

				$('.new-panel-popup-link').magnificPopup("open");
			},

			render: function() {

				var self = this;

				return 	(
					<div className="graph col-12 dashboard-container">
						<div className="add-panel-panel">
							<a href="#new-panel-popup" className="new-panel-popup-link">
								<div onClick={self.openPanelPopup}>
									<i className="icon-plus large-plus"></i>
									<h3>Tilføj panel</h3>
								</div>
							</a>
						</div>
					</div>
				);
			},
		});

		var DeletePanelPopUp = React.createClass({

			hanldeDelete: function() {
				var panel_id = this.state.panel_id;
				if (panel_id) {
					var dashboard = this.props.dashboard;
					dashboard.panels.remove(panel_id);
					this.closePopup();
				}
			},

			closePopup: function() {
				$.magnificPopup.instance.close();
			},

			getInitialState: function() {
				return {
					panel_id: -1,
				};
			},

			componentDidMount: function() {
				var dashboard = this.props.dashboard;
				dashboard.addReactComponent({_deletePanelForm: this});
			},

			render: function() {
				return (
					<div id="delete-panel-popup" className="popup mfp-hide delete-popup">
						<h2>Vil du slette dette?</h2>
						<div className="popup-buttons">
							<button className="button-fat" onClick={this.closePopup}>Fortryd</button>
							<button className="button-fat ghost" onClick={this.hanldeDelete}>Slet</button>
						</div>
					</div>
				);
			},
		});

		var DeleteChartPopUp = React.createClass({

			hanldeDelete: function() {
				var chart_id = this.state.chart_id;
				if (chart_id) {
					var dashboard = this.props.dashboard;
					dashboard.charts.remove(chart_id);
					this.closePopup();
				}
			},

			closePopup: function() {
				$.magnificPopup.instance.close();
			},

			getInitialState: function() {
				return {
					chart_id: -1,
				};
			},

			componentDidMount: function() {
				var dashboard = this.props.dashboard;
				dashboard.addReactComponent({_deleteChartForm: this});
			},

			render: function() {
				return (
					<div id="delete-chart-popup" className="popup mfp-hide delete-popup">
						<h2>Vil du slette dette?</h2>
						<div className="popup-buttons">
							<button className="button-fat" onClick={this.closePopup}>Fortryd</button>
							<button className="button-fat ghost" onClick={this.hanldeDelete}>Slet</button>
						</div>
					</div>
				);
			},
		});

		var Controls = React.createClass({

            makeDateRange: function(start_date, end_date) {
                var start_date_formated = moment(start_date).format('DD-MM-YYYY');
                var end_date_formated = moment(end_date).format('DD-MM-YYYY');

                return start_date_formated + " - " + end_date_formated;
            },

			selectData: function() {
				var dashboard = this.props.dashboard;
				dashboard.getData();
			},

			getInitialState: function() {

				var dashboard = this.props.dashboard;

				var start_date_formated = dashboard.initialStartDate;
				var end_date_formated = dashboard.initialEndDate;

				return {
					range: this.makeDateRange(start_date_formated, end_date_formated),
					start: start_date_formated,
					end: end_date_formated,
					controls: dashboard.controls || [],
				};
			},

			componentDidMount: function() {

				var self = this;

				var dashboard = this.props.dashboard;

				//Date range picker
				var configObject = {
					singleMonth: false,
					autoClose: true,
					startOfWeek: 'monday',
					// batchMode: "week-range",
					showWeekNumbers: true,
					hoveringTooltip: false,
					showShortcuts: true,
					language: 'da',
					customShortcuts: [
						{
							name: 'Q1',
							dates : function()
							{
								var y = $('#date-range_0').attr('data-end').slice(0,4);
								var start = new Date(y, 0, 1);
								var end = new Date(y, 2 + 1, 0);
								return [start,end];
							}
						},
						{
							name: 'Q2',
							dates : function()
							{
                                var y = $('#date-range_0').attr('data-end').slice(0,4);
								var start = new Date(y, 3, 1);
								var end = new Date(y, 5 + 1, 0);
								return [start,end];
							}
						},
						{
							name: 'Q3',
							dates : function()
							{
								var y = $('#date-range_0').attr('data-end').slice(0,4);
								var start = new Date(y, 6, 1);
								var end = new Date(y, 8 + 1, 0);
								return [start,end];
							}
						},
						{
							name: 'Q4' + '<br>',
							dates : function()
							{
								var y = $('#date-range_0').attr('data-end').slice(0,4);
								var start = new Date(y, 9, 1);
								var end = new Date(y, 11 + 1, 0);
								return [start,end];
							}
						},
						{
							name: '2016',
							dates : function()
							{
								var date = new Date(), y = 2016;
								var start = new Date(y, 0, 1);
								var end = new Date(y, 11, 31);
								return [start,end];
							}
						},
						{
							name: '2017',
							dates : function()
							{
								var date = new Date(), y = 2017;
								var start = new Date(y, 0, 1);
								var end = new Date(y, 11, 31);
								return [start,end];
							}
						},
						{
							name: '2018',
							dates : function()
							{
								var date = new Date(), y = 2018;
								var start = new Date(y, 0, 1);
								var end = new Date(y, 11, 31);
								return [start,end];
							}
						},
                        {
                            name: '2019',
                            dates : function()
                            {
                                var date = new Date(), y = 2019;
                                var start = new Date(y, 0, 1);
                                var end = new Date(y, 11, 31);
                                return [start,end];
                            }
                        },
                        {
                            name: '2020',
                            dates : function()
                            {
                                var date = new Date(), y = 2020;
                                var start = new Date(y, 0, 1);
                                var end = new Date(y, 11, 31);
                                return [start,end];
                            }
                        },
					]
			    };

			    var dataPicker = $("#" + dashboard.dataRangeId).dateRangePicker(configObject)
				    .bind('datepicker-change', function(event, obj) {

						var start_date = moment(obj.date1).format('YYYY-MM-DD');
						var end_date = moment(obj.date2).format('YYYY-MM-DD');

						var link = new URL(window.location.href);
						link.searchParams.set('date_from', start_date);
						link.searchParams.set('date_to', end_date);
						history.replaceState({}, '', link.href);

				    	self.setState({
							range: self.makeDateRange(start_date, end_date),
	    					start: start_date,
	    					end: end_date,
	    				});

						self.selectData();
					});

			    $('.custom-shortcut:nth-child(5)').after('<span class="datepicker-years">Hele Året </span>');
                $('.week-name th').each(function () {
					var string = $(this).html();
					var stringNew = string.replace('ö', 'Ø');

                    $(this).text(stringNew);
                });

				dashboard.addReactComponent({_controls: this});
			},

			render: function() {

				var dashboard = this.props.dashboard;

				var controls = this.state.controls.map(function(control) {
					return <ControlSelections id={control.id} control={control} dashboard={dashboard} />;
				});

				return (
					<div className="controls-dashboard">
						<div className="controls white-panel dashboard-controls sticky">
							{controls}
							<input id={dashboard.dataRangeId}  className="" size="25" value={this.state.range} data-start={this.state.start} data-end={this.state.end} placeholder="Vælg tidsinterval"/>
							{(dashboard.dashboardId == 7 || dashboard.dashboardId == 9) &&
				                <input id="service_number" className="" size="25" placeholder="Ydernummer" onChange={this.selectData}/>
				            }
						</div>
				    </div>
				);
			},
		});

		var Contents = React.createClass({

			getInitialState: function() {
				return {
					dashboards: dashboards.dashboards || []
				};
			},

			render: function() {
				var user_type = Utilities.getUserType();

				var dashboards_count = _.size(this.state.dashboards);
				var width_class = "";
				if (dashboards_count > 1) {
					width_class = "width-50";
				}

				var _dashboards = this.state.dashboards.map(function(dashboard) {
					return (
						<div id={dashboard.id} className={"adevo-dashboard " + width_class}>
							<Controls dashboard={dashboard}/>
							<Content dashboard={dashboard}/>

							{user_type > 1 &&
								<div>
									<NewPanelPopUp dashboard={dashboard}/>
									<EditPanelPopUp dashboard={dashboard}/>
									<DeletePanelPopUp dashboard={dashboard}/>

									<NewChartPopUp dashboard={dashboard}/>
									<EditChartPopUp dashboard={dashboard}/>
									<DeleteChartPopUp dashboard={dashboard}/>
								</div>
							}
						</div>
					);
				});

				return (
					<div className="">
						{_dashboards}
					</div>
				);
			},

		});

		var Content = React.createClass({

			openChartPopup: function(ev) {

				var dashboard = this.props.dashboard;

				$('.chart-popup-link').magnificPopup({
					type: 'inline',
					callbacks: {
						elementParse: function(item) {
							var _chartForm = dashboard.getReactComponent("_chartForm");
							_chartForm.setState({
								panelId: $(ev.target).closest(".panel").attr("data-db-id")
							});
						}
					}
				});

				$('.chart-popup-link').magnificPopup("open");
			},

			openEditPanelPopup: function(ev) {
				var dashboard = this.props.dashboard;

				$('.edit-panel-popup-link').magnificPopup({
					type: 'inline',
					callbacks: {
						elementParse: function(item) {
							var panel = $(ev.target).closest(".panel");
							var _editPanelForm = dashboard.getReactComponent("_editPanelForm");
							_editPanelForm.setState({
								panelId: panel.attr("data-db-id"),
								title: panel.find(".panel-title").attr("value"),
								procedureName: panel.find(".panel-procedure-name").attr("value"),
								width: panel.attr("data-gs-width"),
								height: panel.attr("data-gs-height"),
								link_name: panel.find(".adevo-link").attr("data-link-name"),
								link_address: panel.find(".adevo-link").attr("href"),
							});
						}
					}
				});

				$('.edit-panel-popup-link').magnificPopup('open');
			},

			openDeletePanelPopup: function(ev) {
				var dashboard = this.props.dashboard;

				$('.delete-panel-popup').magnificPopup({
					type: 'inline',
					callbacks: {
						elementParse: function(item) {
							var panel = $(ev.target).closest(".panel");
							var _deletePanelForm = dashboard.getReactComponent("_deletePanelForm");
							_deletePanelForm.setState({
								panel_id: panel.attr("data-db-id"),
							});
						}
					}
				});

				$('.delete-panel-popup').magnificPopup('open');
			},

			getInitialState: function() {
				var dashboard = this.props.dashboard;
				return {panels: dashboard.panels || [],};
			},

			componentDidMount: function() {

				var dashboard = this.props.dashboard;
				dashboard.addReactComponent({_content: this});
			},

			componentDidUpdate: function() {

				var dashboard = this.props.dashboard;
				if (!dashboard.isInitialized) {

					var options = {
				    	width: 12,
				    	cellHeight: '10',
				    	topMargin: 0,
				    	disableDrag: true,
				    	disableResize: true,
				    };

					var user_type = Utilities.getUserType();
					if (user_type > 2) {
						options.disableDrag = false;
						options.disableResize = false;
					}

				    var grrid_stack_class = dashboard.getGridstackClassName();
				    var grid_stack_query = "." + grrid_stack_class;

				    dashboard.myGridstack = $(grid_stack_query).gridstack(options);

					$(grid_stack_query).on('change', function(event, items) {
						dashboard.saveLayout();
					});

					$(grid_stack_query).on('resizestop', function(event, ui) {

						//resizing the chart
						var elem = $(event.target);
						if (elem.hasClass("chart")) {

							var chart = dashboard.charts.charts[elem.attr("data-id")];
							if (chart) {
								chart.resize();
							}
						}

					});

				}

			},

			render: function() {

				var self = this;
				var user_type = Utilities.getUserType();
				var dashboard = this.props.dashboard;

				var layout = dashboard.getLayout() || {};

				var panels = this.state.panels.map(function(panel) {

					var panel_layout_obj = layout[panel.id] || {charts: {}};

					//setting charts layout
					panel.components = _.map(panel.components, function(component) {

						var component_layout = panel_layout_obj.charts[component.id] || {x: 0, y: 0, w: 12, h: 12};
						_.extend(component, component_layout);

						return component;
					});

					var panel_layout = panel_layout_obj.data || {x: 0, y: 0, w: 12, h: 12};

					_.extend(panel, panel_layout);

					var link_html = "";
					if (panel.link_name) {
						link_html = <a href={panel.link_address} data-link-name={panel.link_name} className="icon-link panel-link" >{panel.link_name}</a>;
					}

					return (
						<div id={panel.panelId} className="graph grid-stack-item grid-stack-panel-item panel" data-db-id={panel.id}
							data-gs-x={panel.x} data-gs-y={panel.y} data-gs-width={panel.w} data-gs-height={panel.h} >
							<div className="grid-stack-item-content white-panel-chart">
								<div>
									{user_type > 3 &&
										<div>
											<a href="#edit-panel-popup" className="edit-panel-popup-link" onClick={self.openEditPanelPopup}>
												<i className="edit-panel icon-android-create"></i>
											</a>
											<a href="#delete-panel-popup" className="delete-panel-popup" onClick={self.openDeletePanelPopup}>
												<i className="delete-panel icon-close"></i>
											</a>
										</div>
									}
									<h2 className="panel-heading panel-title" value={panel.title}>{panel.title} </h2>

									{link_html}

									<div className="panel-procedure-name" value={panel.procedure_name} style={{display: "none"}}></div>

									{user_type > 3 &&
										<a href="#chart-popup" className="chart-popup-link" >
											<i className="add-chart icon-plus" onClick={self.openChartPopup}></i>
										</a>
									}
									<a href={panel.link_address} data-link-name={panel.link_name} className="icon-link panel-link" >{panel.link_name}</a>

									<div className="panel-procedure-name" value={panel.procedure_name} style={{display: "none"}}></div>

									<div className="clearfix"></div>
									<ChartsComponent charts={panel.components} dashboard={dashboard} />
								</div>
							</div>
						</div>
					);
				});

				var grid_stack_id = dashboard.getGridstackId();
				var grid_stack_class_name = dashboard.getGridstackClassName();

				return (
					<div className="dashboard">

						<div id={grid_stack_id} className={"grid-stack grid-stack-panel data-gs-animate " + grid_stack_class_name}>
							{panels}
						</div>
						{user_type > 1 &&
							<AddPanel />
						}
					</div>
				);
			}
		});

		var ChartsComponent = React.createClass({

            exportExcelFile: function(ev) {
                let chart = $(ev.target).closest(".chart");
                let chartValue = chart.find(".chart-procedure-name").attr("value");
                let chartType = chart.find(".chart-type").attr("value");
                var dashboard = this.props.dashboard;

				$('.loading-wrap').fadeIn();

                $.ajax({
                    url: '/bi/export_excel',
                    method: "GET",
                    headers: {
                        "X-CSRF-Token": self.dashboard.token
                    },
                    data: {
                        procedure_name: chartValue,
						chart_type: chartType,
						data: dashboard.selectData(),
                    },
                    success: function() {
                        window.open(this.url);
						$('.loading-wrap').fadeOut();
                    }
                })
            },

			openEditChartPopup: function(ev) {
				var dashboard = this.props.dashboard;

				$('.edit-chart-popup-link').magnificPopup({
					type: 'inline',
                    fixedContentPos: false,
					callbacks: {
						elementParse: function(item) {
							var chart = $(ev.target).closest(".chart");
							var type = chart.find(".chart-type").attr("value");

							dashboard.getReactComponent("_editChartForm").setState({
								id: chart.attr("data-db-id"),
								procedureName: chart.find(".chart-procedure-name").attr("value"),
								width: chart.attr("data-gs-width"),
								height: chart.attr("data-gs-height"),
								chartType: chart.attr("data-chart-type"),
								panelId: chart.closest(".panel").attr("data-db-id"),
								link_name: chart.find(".chart-link-name").attr("value"),
								link_address: chart.find(".chart-link-address").attr("value"),
							});
						}
					}
				});

				$('.edit-chart-popup-link').magnificPopup("open");
			},

			openDeleteChartPopup: function(ev) {
				var dashboard = this.props.dashboard;

				$('.delete-chart-popup').magnificPopup({
					type: 'inline',
					callbacks: {
						elementParse: function(item) {
							var chart = $(ev.target).closest(".chart");
							var _deleteChartForm = dashboard.getReactComponent("_deleteChartForm");
							_deleteChartForm.setState({
								chart_id: chart.attr("data-db-id"),
							});
						}
					}
				});

				$('.delete-chart-popup').magnificPopup('open');
			},

			render: function() {

				var self = this;
				var user_type = Utilities.getUserType();

				var rendered_charts = this.props.charts.map(function(chart) {

					var link_html = "";
					if (chart.link_name) {
						link_html = <a href={chart.link_address} data-link-name={chart.link_name} className="icon-link chart-link">{chart.link_name}</a>;
					}

					var chart_item =
							<div className="grid-stack-item-content" >

								{user_type > 3 &&
								<div>
									<a href="#edit-chart-popup" onClick={self.openEditChartPopup} className="edit-chart-popup-link">
										<i className="edit-chart icon-android-create"></i>
									</a>
									<a href="#delete-chart-popup" onClick={self.openDeleteChartPopup} className="delete-chart-popup">
										<i className="delete-chart icon-close" onClick={self.deleteChart}></i>
									</a>
								</div>
								}

								<a className="export-link" onClick={self.exportExcelFile}>
									<div>
										<img src="https://img.icons8.com/officexs/16/000000/ms-excel.png"/>
										<span>Eksport til fil</span>
									</div>
								</a>

								<div className="chart-type" value={chart.type} style={{display: "none"}}></div>
								<div className="chart-procedure-name" value={chart.procedure_name} style={{display: "none"}}></div>

								<div className="chart-link-name" value={chart.link_name} style={{display: "none"}}></div>
								<div className="chart-link-address" value={chart.link_address} style={{display: "none"}}></div>

								<div id={chart.chartId}></div>

								{link_html}

							</div>;



					return (
						<div data-id={chart.chartId} className={"chart grid-stack-item " + "chart-" + chart.type} data-chart-type={chart.type} data-db-id={chart.id}
							data-gs-x={chart.x} data-gs-y={chart.y} data-gs-width={chart.w} data-gs-height={chart.h} >

							{chart_item}

						</div>
					);
				});

				var dashboard = this.props.dashboard;
				var grid_stack_class_name = dashboard.getGridstackClassName();

				return (
					<div className={"chart-wrap grid-stack grid-stack-chart data-gs-animate grid-stack-nested " + grid_stack_class_name}>
						{rendered_charts}
					</div>
				);
			}
		});

		var Page = React.createClass({
			render: function() {
				return (
					<div>
						<div className="content-wrap">
							<div className="dashboard-wrapper dashboard-view">
                                <Return href={"/bi/dashboards"}/>
								<Contents />
							</div>
						</div>
					</div>
				);
			}
		});

		ReactDOM.render(
			React.createElement(Page, null),
			document.getElementById('content')
		);
	}

	exports.View = View;
})(window);
