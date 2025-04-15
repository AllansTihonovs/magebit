import {Return} from "./components/Return";

class Dashboards {
	render() {
		var self = this;

		$.ajax({
			url: "/bi/dashboards-data",
			dataType: 'json',
			success: function(resp) {
				self.view = new View(this, resp);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	}

	addDashboard() {
		var self = this;

		var group_id = $("#add-dashboard-group-id").val();

		$.ajax({
			url: '/bi/new-dashboard',
			method: "POST",
			headers: {
				'X-CSRF-Token': Utilities.getToken(),
			},
			data: {
				name: $("#dashboard-title").val(),
				description: $("#dashboard-description").val(),
				class_name: $("#class-name").val(),
				groupId: group_id,
			},
	    })
	    .done(function(resp) {
	    	if (resp.status === 200) {
	    		var dashboard = resp.response.added;

	    		var groups = self._context.state.groups;
	    		var current_group = _.find(groups, function(group) {
					return group.id == group_id;
				});

	    		current_group.dashboards.push(dashboard);
	    		self._context.setState({groups: groups});

	    		//updating edit form state
	    		self._editForm.setState({
					id: dashboard.id,
					title: dashboard.name,
					class_name: dashboard.class_name,
					description: dashboard.description,
	    		});

				$.magnificPopup.instance.close();

				notyf.confirm('Success!');
	    	} else {
	    		console.error(resp);
	    	}
		});
	}

	updateDashboard(id) {
		var self = this;

		$.ajax({
			url: '/bi/dashboard',
			method: "PUT",
			headers: {
				'X-CSRF-Token': Utilities.getToken(),
			},
			data: {
				id: id,
				name: $("#edit-dashboard-title").val(),
				class_name: $("#edit-class-name").val(),
				description: $("#edit-dashboard-description").val(),
			},
	    })
	    .done(function(resp) {
	    	if (resp.status === 200) {
	    		//updating the dashboard
	    		var groups = _.map(self._context.state.groups, function(group) {

	    			//updateing the dashboard
		    		var current_dashboard = _.find(group.dashboards, function(dashboard) {
		    			return dashboard.id == id;
		    		});
		    		_.extend(current_dashboard, resp.response.changed);

		    		return group;
		    	});

	    		self._context.setState({groups: groups});

				notyf.confirm('Success!');
	    	} else {
	    		console.error(resp);
	    	}
		});
	}

	deleteDashboard(id) {
		var self = this;

		$.ajax({
			url: "/bi/dashboard",
			method: "DELETE",
			headers: {
				"X-CSRF-Token": Utilities.getToken(),
			},
			data: {
				id: id,
			},
		})
		.done(function(resp) {
			if (resp.status == 200) {
				var _context = self._context;

	    		var groups = _.map(_context.state.groups, function(group) {
					group.dashboards = _.reject(group.dashboards, function(dashboard) {
						return dashboard.id == id;
					});

					return group
				});

				_context.setState({groups: groups});

				notyf.confirm('Success!');
			} else {
				console.error(resp);
			}
		});
	}

	addGroup() {
		var self = this;

		var checkedUserGroups = [];
		$('.add-group-user:checked').each(function () {
			checkedUserGroups.push($(this).val());
		});

		$.ajax({
			url: '/bi/new-group',
			method: "POST",
			headers: {
				'X-CSRF-Token': Utilities.getToken(),
			},
			data: {
				name: $("#new-group-title").val(),
				user_groups: checkedUserGroups,
			},
	    })
	    .done(function(resp) {
	    	if (resp.status === 200) {
	    		var group = resp.response.added;
	    		var groups = self._context.state.groups;

				_.extend(groups, group);
	    		self._context.setState({groups: groups});

				$.magnificPopup.instance.close();

				notyf.confirm('Success!');
	    	} else {
	    		console.error(resp);
	    	}
		});
	}

	updateGroup(id) {
		var self = this;

		var checkedUserGroups = [];
		$('.edit-group-user:checked').each(function () {
			checkedUserGroups.push($(this).val());
		});

		var data = {
			id: id,
			name: $("#edit-group-title").val(),
			user_groups: checkedUserGroups,
		};

		$.ajax({
			url: '/bi/group',
			method: "PUT",
			headers: {
				'X-CSRF-Token': Utilities.getToken(),
			},
			data: data,
	    })
	    .done(function(resp) {
	    	if (resp.status === 200) {
				self._context.state.groups[id].user_groups = checkedUserGroups;

				$.magnificPopup.instance.close();

				notyf.confirm('Success!');
	    	} else {
	    		console.error(resp);
	    	}
		});
	}

	deleteGroup(id) {
		var self = this;

		$.ajax({
			url: "/bi/group",
			method: "DELETE",
			headers: {
				"X-CSRF-Token": Utilities.getToken(),
			},
			data: {
				id: id,
			},
		})
		.done(function(resp) {
			if (resp.status == 200) {
				var _context = self._context;

				//removing the deleted dashboard from the dashboards
				var groups = _.reject(_context.state.groups, function(group) {
					return group.id == id;
				});

				_context.setState({groups: groups});

				notyf.confirm('Success!');
			} else {
				console.error(resp);
			}
		});
	}
}

class View {
	constructor(dashboards, data) {
		var _groups = data.dashboard_groups;
		var _user_groups = data.user_groups;

		var NewDashboardPopUp = React.createClass({

			hanldeAddDashboard: function(e) {
				dashboards.addDashboard();
				this.setState(this.getInitialState());
			},

			handleChange: function(ev) {
				var state = {};
				state[$(ev.target).attr("data-property")] = ev.target.value;

				this.setState(state);
			},

			getInitialState: function() {
				return {
					group_id: -1,
					name: "",
					class_name: "",
					description: "",
				};
			},

			componentDidMount: function() {
				dashboards._newDashboardForm = this;
			},

			render: function() {
				return (
					<div id="dashboard-popup" className="popup mfp-hide">

						<h2>Add dashboard</h2>
						<input id="add-dashboard-group-id" type="hidden" value={this.state.group_id} onChange={this.handleChange} />
						<input id="dashboard-title" placeholder="Dashboard title" data-property="name" value={this.state.name} onChange={this.handleChange} />
						<input id="class-name" placeholder="Class name" data-property="class_name" value={this.state.class_name} onChange={this.handleChange} />
						<textarea id="dashboard-description" data-property="description" rows="5" cols="40" placeholder="Dashboard description" onChange={this.handleChange} value={this.state.description} >
						</textarea>

						<button id="add-dashboard" className="button-fat" onClick={this.hanldeAddDashboard}>Add dashboard</button>
					</div>
				);
			},

		});

		var EditDashboardPopUp = React.createClass({

			hanldeEditDashboard: function(e) {

				var dashboard_id = $("#edit-dashboard-id").val();
				dashboards.updateDashboard(dashboard_id);

			    // Close popup that is currently opened
				var magnificPopup = $.magnificPopup.instance;
				magnificPopup.close();
			},

			handleChange: function(ev) {
				var state = {};
				state[$(ev.target).attr("data-property")] = ev.target.value;

				this.setState(state);
			},

			getInitialState: function() {
				return {id: "", title: "", class_name: "", description: ""};
			},

			componentDidMount: function() {
				dashboards._editForm = this;
			},

			render: function() {
				return (
					<div id="edit-dashboard-popup" className="popup mfp-hide">

						<h2>Edit dashboard</h2>
						<input id="edit-dashboard-id" type="hidden" value={this.state.id} />
						<input id="edit-dashboard-title" placeholder="Dashboard title" data-property="title" value={this.state.title} onChange={this.handleChange}  />
						<input id="edit-class-name" placeholder="Class name" data-property="class_name"  value={this.state.class_name} onChange={this.handleChange}  />
						<textarea id="edit-dashboard-description" name="Description" rows="5" cols="40" placeholder="Dashboard description" data-property="description"
								value={this.state.description} onChange={this.handleChange}></textarea>

						<button id="edit-dashboard" className="button-fat" onClick={this.hanldeEditDashboard}>Save</button>
					</div>
				);
			},

		});

		var DeleteDashboardPopUp = React.createClass({

			hanldeDelete: function() {
				var dashboard_id = this.state.dashboard_id;
				if (dashboard_id) {
					dashboards.deleteDashboard(dashboard_id);
					this.closePopup();
				}
			},

			closePopup: function() {
				var magnificPopup = $.magnificPopup.instance;
				magnificPopup.close();
			},

			getInitialState: function() {
				return {
					dashboard_id: -1,
				};
			},

			componentDidMount: function() {
				dashboards._deleteDashboardForm = this;
			},

			render: function() {
				return (
					<div id="delete-dashboard-popup" className="popup mfp-hide delete-popup">

						<h2>Vil du slette dette?</h2>
						<div className="popup-buttons">
							<button className="button-fat" onClick={this.closePopup}>Fortryd</button>
							<button className="button-fat ghost" onClick={this.hanldeDelete}>Slet</button>
						</div>
					</div>
				);
			},
		});

		var NewGroupPopUp = React.createClass({

			hanldeAddGroup: function(e) {
				dashboards.addGroup();
			},

			handleChange: function(ev) {
				var state = {};
				state[$(ev.target).attr("data-property")] = ev.target.value;
				this.setState(state);
			},

			componentDidMount: function() {
				dashboards._newGroupForm = this;
			},

			getInitialState: function() {
				return {
					title: "",
					user_groups:[]
				};
			},

			selectAll: function(ev) {
				var button = $(ev.target);
				var val = button.data("val");
				var type = button.data("type");

				var checkboxes = document.getElementsByName(type);
				for (var i=0, n=checkboxes.length; i<n; i++) {
					checkboxes[i].checked = val;
				}
			},

			render: function() {
				var user_group_list = _.map(this.state.user_groups, function(group) {
					return (
						<div>
							<label className="checkbox-inline-text">
								<input id={"group-add" + group.id} type="checkbox" name="groups" className="checkbox-inline add-group-user" value={group.id} />
								{group.name}
							</label>
						</div>
					);
				});

				return (
					<div id="add-group-popup" className="popup mfp-hide">
						<h2>New group</h2>
						<input id="new-group-title" data-property="title"  placeholder="Group title" value={this.state.title} onChange={this.handleChange} />

						<label for="add-group-name">Choose user groups</label>
						<button type="button" className="checkboxButton" data-type="groups" data-val="1" onClick={this.selectAll}>Select All</button>
						<button type="button" className="checkboxButton" data-type="groups" data-val="0" onClick={this.selectAll}>Select None</button>
						<div className="checkbox-panel">
							{user_group_list}
						</div>

						<button id="add-group" className="button-fat" onClick={this.hanldeAddGroup}>Add</button>
					</div>
				);
			},

		});

		var EditGroupPopUp = React.createClass({

			editGroup: function(e) {
				var group_id = $("#edit-group-id").val();
				dashboards.updateGroup(group_id);
			},

			handleChange: function(ev) {
				var state = {};
				state[$(ev.target).attr("data-property")] = ev.target.value;

				this.setState(state);
			},

			getInitialState: function() {
				return {id: "", title: "", user_groups:[], user_groups:[],};
			},

			componentDidMount: function() {
				dashboards._editGroupForm = this;
			},

			toggleCheckbox: function(ev) {
				var check_box = $(ev.target);
				var group_id = check_box.attr("value");

				var user_groups = this.state.user_groups;

				var is_checked = check_box.is(":checked");
				if (is_checked) {
					user_groups = _.union(user_groups, [Number(group_id)]);
				} else {
					user_groups = _.without(user_groups, Number(group_id));
				}

				this.setState({user_groups: user_groups});
			},

			selectAll: function(ev) {
				var button = $(ev.target);
				var val = button.data("val");
				var type = button.data("type");

				var checkboxes = document.getElementsByName(type);
				var selection_ids = [];
				for (var i=0, n=checkboxes.length; i<n; i++) {
					checkboxes[i].checked = val;

					if (val) {
						selection_ids = _.union(selection_ids, [parseInt(checkboxes[i].value)]);
					}
				}

		        this.state.user_groups = selection_ids;
			},

			render: function() {
				var self = this;

				var user_group_list = _.map(_user_groups, function(group) {
					var is_checked = false;
					if (_.contains(self.state.user_groups, parseInt(group.id))) {
						is_checked = true;
					}

					return  <div>
								<label className="checkbox-inline-text">
									<input id={"group-edit-" + group.id} type="checkbox" name="groups" className="checkbox-inline edit-group-user" value={group.id} onChange={self.toggleCheckbox} checked={is_checked}/>
									{group.name}
								</label>
							</div>;
				});

				return (
					<div id="edit-group-popup" className="popup mfp-hide">

						<h2>Edit group</h2>
						<input id="edit-group-id" type="hidden" value={this.state.id} />
						<input id="edit-group-title" placeholder="Group title" data-property="title" value={this.state.title} onChange={this.handleChange}  />

						<label for="add-group-name">Choose user groups</label>
						<button type="button" className="checkboxButton" data-type="groups" data-val="1" onClick={this.selectAll}>Select All</button>
						<button type="button" className="checkboxButton" data-type="groups" data-val="0" onClick={this.selectAll}>Select None</button>
						<div className="checkbox-panel">
							{user_group_list}
						</div>

						<button id="edit-group" className="button-fat" onClick={this.editGroup}>Save</button>
					</div>
				);
			},

		});

		var DeleteGroupPopUp = React.createClass({

			hanldeDelete: function() {
				var group_id = this.state.group_id;
				if (group_id) {
					dashboards.deleteGroup(group_id);
					this.closePopup();
				}
			},

			closePopup: function() {
				var magnificPopup = $.magnificPopup.instance;
				magnificPopup.close();
			},

			getInitialState: function() {
				return {
					group_id: -1,
				};
			},

			componentDidMount: function() {
				dashboards._deleteGroupForm = this;
			},

			render: function() {
				return (
					<div id="delete-group-popup" className="popup mfp-hide delete-popup">
						<h2>Vil du slette dette?</h2>
						<div className="popup-buttons">
							<button className="button-fat" onClick={this.closePopup}>Fortryd</button>
							<button className="button-fat ghost" onClick={this.hanldeDelete}>Slet</button>
						</div>
					</div>
				);
			},
		});

		var AddGroup = React.createClass({

			openNewGroupForm: function() {
				$('.new-group-popup-link').magnificPopup({
					type: 'inline',
					callbacks: {
						elementParse: function() {
							dashboards._newGroupForm.setState({
								user_groups: data.user_groups,
							});
						}
					}
				});
				$('.new-group-popup-link').magnificPopup("open");
			},

			render: function() {

				var self = this;

				return (
					<div className="">
				    	<div className="graph col-12 dashboard-container">
							<div className="add-group-panel">
								<a href="#add-group-popup" className="new-group-popup-link">
									<div onClick={self.openNewGroupForm}>
										<i></i>
										<span className="sidebar-menu-icon"></span>
										<h3>Tilføj gruppe</h3>
									</div>
								</a>
							</div>
						</div>
					</div>
				);
			},

		});

		var Content = React.createClass({

			openNewDashboardForm: function(ev) {
				var group_id = $(ev.target).closest(".dashboards-group").attr("data-db-id");
				dashboards._newDashboardForm.setState({group_id: group_id});

				$('.new-dashboard-popup-link').magnificPopup({
					type: 'inline'
				});

				$('.new-dashboard-popup-link').magnificPopup("open");
			},

			openEditDashboardForm: function(ev) {
				$('.edit-dashboard-popup-link').magnificPopup({
					type: 'inline',
					callbacks: {
						elementParse: function(item) {
							var panel = $(ev.target).closest(".dashboard-panel");
							dashboards._editForm.setState({
								id: panel.attr("data-db-id"),
								title: panel.find(".dashboard-title").attr("value"),
								class_name: panel.find(".dashboard-class-name").attr("value"),
								description: panel.find(".dashboard-description").attr("value"),
							});
						}
					}
				});

				$('.edit-dashboard-popup-link').magnificPopup("open");
			},

			openDeleteDashboardForm: function(ev) {
				var dashboard_id = $(ev.target).closest(".dashboard-panel").attr("data-db-id");
				dashboards._deleteDashboardForm.setState({dashboard_id: dashboard_id});
				$('.delete-dashboard-popup-link').magnificPopup({
					type: 'inline',
				});

				$('.delete-dashboard-popup-link').magnificPopup("open");
			},

			openEditGroupForm: function(ev) {
				$('.edit-group-popup-link').magnificPopup({
					type: 'inline',
					callbacks: {
						elementParse: function() {
							var group = $(ev.target).closest(".dashboards-group");

							var id = group.data("db-id");

							var active_group = _groups[id];

							var user_groups = [];
							if (active_group) {
								user_groups = active_group.user_groups;

								var user_groups = user_groups.map(function (x) {
								    return parseInt(x.id);
								});
							}

							dashboards._editGroupForm.setState({
								id: id,
								title: group.find(".group-title").attr("value"),
								user_groups: user_groups,
							});
						}
					}
				});

				$('.edit-group-popup-link').magnificPopup("open");
			},

			openDeleteGroupForm: function(ev) {
				var group_id = $(ev.target).closest(".dashboards-group").attr("data-db-id");
				dashboards._deleteGroupForm.setState({group_id: group_id});
				$('.delete-group-popup-link').magnificPopup({
					type: 'inline',
				});

				$('.delete-group-popup-link').magnificPopup("open");
			},

			getInitialState: function() {
				var groups = data.dashboard_groups;
				return {groups: groups};
			},

			componentDidMount: function() {
				dashboards._context = this;
			},

			render: function() {
				var self = this;
				var user_type = Utilities.getUserType();

				// rendering dashboards
				var groups = _.map(this.state.groups, function(group) {
					var group_dashboards = _.map(group.dashboards, function(dashboard) {

						if (dashboard["slug"] == null) {
							var url = "/bi/dashboard/" + dashboard["id"];
						} else {
							var url = "/bi/dashboard/" + dashboard["slug"];
						}

						return (
							<div className="graph col-3 dashboard-container">
								<div data-db-id={dashboard["id"]} className="white-panel dashboard-panel">
									{user_type > 3 &&
										<div>
											<a href="#edit-dashboard-popup" className="edit-dashboard-popup-link">
												<i className="edit-dashboard icon-android-create" onClick={self.openEditDashboardForm}></i>
											</a>
											<a href="#delete-dashboard-popup" className="delete-dashboard-popup-link">
												<i className="delete-dashboard icon-close" onClick={self.openDeleteDashboardForm}></i>
											</a>
										</div>
									}
									<div className="description-wrapper">
										<a href={url}>
											<div className="middle-align">
											{/*<i></i>*/}
											<span className="sidebar-menu-icon"></span>
											<h2 className="dashboard-title clearfix" value={dashboard["name"]}>{dashboard["name"]}</h2>
											<div className="dashboard-description" value={dashboard["description"]}>
												{dashboard["description"]}
											</div>
											<div className="dashboard-class-name" value={dashboard["class_name"]} style={{display: "none"}}></div>
											</div>
										</a>
									</div>
								</div>
							</div>
				      	);
				    });

					return (
						<div className="dashboard-group dashboards-group" data-db-id={group.id}>
							{user_type > 3 &&
								<div>
									<a href="#edit-group-popup" className="edit-group-popup-link">
										<i className="edit-group edit-dashboard icon-android-create" onClick={self.openEditGroupForm}></i>
									</a>
									<a href="#delete-group-popup" className="delete-group-popup-link">
										<i className="delete-group delete-dashboard icon-close" onClick={self.openDeleteGroupForm}></i>
									</a>
								</div>
							}
                            {user_type > 3 &&
								<h3 className="group-title" value={group.name}>{group.name}</h3>
                            }
                            {group_dashboards}
							{user_type > 3 &&
						    	<div className="graph col-3 dashboard-container">
									<div className="add-dashboard-panel">
										<a href="#dashboard-popup" className="new-dashboard-popup-link">
											<div onClick={self.openNewDashboardForm}>
												<i></i>
												<span className="sidebar-menu-icon"></span>
												<h3 className="add-dashboard-text">Tilføj dashboard</h3>
											</div>
										</a>
									</div>
								</div>
							}
						</div>
					);
				});

				return (
					<div className="groups">
						{groups}
					</div>
				);
			},

		});

		var Page = React.createClass({
			render: function() {
				var user_type = Utilities.getUserType();
                var user_type_danica = Utilities.getUserType() ? 21 : false;

                return (
					<div className="content-wrap">
						<div className="dashboard-wrapper">
                            {user_type_danica
                                ? null
                                : <Return href={"/bi/dashboards"}/>
                            }
							<Content />
							{user_type > 3 ? <AddGroup /> : ''}
						</div>
						{user_type > 3 &&
							<div>
								<NewDashboardPopUp />
								<EditDashboardPopUp />
								<DeleteDashboardPopUp />
								<NewGroupPopUp />
								<EditGroupPopUp />
								<DeleteGroupPopUp />
							</div>
						}
					</div>
				);
			},
		});

		ReactDOM.render(
			React.createElement(Page, null),
			document.getElementById('content')
		);
	}
}


$(document).ready(function() {
	var dashboards = new Dashboards();
	dashboards.render();
});
