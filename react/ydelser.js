import React from "react";
import {ClinicGroupIcons} from "./components/ClinicGroupIcons";

class Group extends React.Component {
    constructor(props) {
        super(props);
        props.inputState.icons = [
            { icon: 'andre-sundhedsydelser.svg', name: 'ANDRE SUNDHEDSYDELSER' },
            { icon: 'fysioterapi.svg', name: 'FYSIOTERAPI' },
            { icon: 'genoptraening.svg', name: 'GENOPTRÆNING' },
            { icon: 'holdtraening.svg', name: 'HOLDTRÆNING' },
            { icon: 'kostvejledning.svg', name: 'KOSTVEJLEDNING' },
            { icon: 'massage.svg', name: 'MASSAGE' },
            { icon: 'personlig-traening.svg', name: 'PERSONLIG TRÆNING' },
            { icon: 'screening-test.svg', name: 'SCREENINGER OG TEST' }
        ];
        
        props.inputState.SelectedIcon = props.inputState.icon;

        this.state = props.inputState;

        this.onValueChange = this.onValueChange.bind(this);
        this.submit = this.submit.bind(this);
        this.handleCheckbox = this.handleCheckbox.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.inputState !== this.props.inputState) {
            this.setState(this.props.inputState);
        }

        if (prevProps.inputState.id !== this.props.inputState.id) {
            this.setState(this.props.inputState);
        }
    }

    resetState() {
        this.setState({ BusinessSegmentName: '', BusinessSegmentCode: '', id: 9999,
            is_fysio: 0, is_danica: 0, is_visible: 0, is_bodyparts: 0, errors: [], order: 1});
    }

    submit() {
        this.props.onSubmit(this.state);
        this.resetState();
    }

    onValueChange(event) {
        this.setState({[event.target.name]: event.target.value });
    }

    handleCheckbox(ev) {
        var property = ev.target.dataset.property;
        let obj = {};

        if (ev.target.checked) {
            obj[property] = 1;
        } else {
            obj[property] = 0;
        }

        this.setState(obj);
    }

    setSelectedIcon(icon) {
        this.setState({SelectedIcon: icon})
    }

    handleOrderChange (ev) {
        const value = ev.target.value;
        this.setState({order: value});
    }

    render() {
        let self = this;
        const icons = this.state.icons.map((icon, key) => {
            return <ClinicGroupIcons key={key}
                                     icon={icon}
                                     SelectedIcon={this.state.SelectedIcon}
                                     setSelectedIcon={this.setSelectedIcon.bind(self)}
            />
        });

        return (
            <div id="group-popup" className="popup mfp-hide">
                <div>
                    <label for="name">Name</label>
                    <input type="text" id="name" name="BusinessSegmentName" value={this.state.BusinessSegmentName} onChange={this.onValueChange}/>
                </div>
                <div className="checkboxes">
                    <div className="checkbox-wrapper">
                        <input id="is-fysio-checkbox" data-property="is_fysio" onChange={this.handleCheckbox} type="checkbox" checked={this.state.is_fysio} />
                        <label htmlFor="is-fysio-checkbox"></label>
                        <span>Fysio</span>
                    </div>
                    <div className="checkbox-wrapper">
                        <input id="is-danica-checkbox" data-property="is_danica" onChange={this.handleCheckbox} type="checkbox" checked={this.state.is_danica} />
                        <label htmlFor="is-danica-checkbox"></label>
                        <span>Danica</span>
                    </div>
                    <div className="checkbox-wrapper">
                        <input id="is-visible-checkbox" data-property="is_visible" onChange={this.handleCheckbox} type="checkbox" checked={this.state.is_visible} />
                        <label htmlFor="is-visible-checkbox"></label>
                        <span>Visible</span>
                    </div>
                    <div className="checkbox-wrapper">
                        <input id="is-bodyparts-checkbox" data-property="is_bodyparts" onChange={this.handleCheckbox} type="checkbox" checked={this.state.is_bodyparts} />
                        <label htmlFor="is-bodyparts-checkbox"></label>
                        <span>Body Parts</span>
                    </div>
                </div>
                <div className="chooser-container">
                    <label>Group Order</label>
                    <Chosen data-placeholder="Choose order" disableSearch="true" width={"10%"} onChange={(ev) => this.handleOrderChange(ev)}>
                        {this.props.groupList.length > 0 ?
                            this.props.groupList.map((group, key) => {
                                const newkey = key + 1;
                                return this.state.order ===  newkey ? <option selected value={newkey}>{newkey}</option>
                                    : <option value={newkey}>{newkey}</option>
                            })
                            : <option value='1'>1</option>
                        }
                    </Chosen>
                </div>

                <div id="popup-service-group-code">
                    <label for="code">Code</label>
                    <input type="text" id="code" name="BusinessSegmentCode" value={this.state.BusinessSegmentCode} onChange={this.onValueChange}/>
                </div>
                {this.state.errors === 409  &&
                    <div id="add-service-groups-errors">This group code is taken!</div>
                }
                {this.state.errors === 410  &&
                    <div id="add-service-groups-errors">Group name and code is required!</div>
                }
                <div className="row">
                    {icons}
                </div>

                <button className="button-fat" onClick={this.submit}>Submit</button>
            </div>
        );
    }
}

class Info extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            service: null
        }
    }

    componentDidUpdate(prevProps) {
     
        if (this.props.service !== prevProps.service) {
            let service = this.props.service;

            if (service.info === null) {
                service.info = "";
            }

            this.setState({
                service: service
            });
        }
    }

    handleInfo(el) {
        let service = this.state.service;

        service.info = el.target.value;

        this.setState({
            service: service
        });
    }

    submit() {
        let self = this;
       
        $.ajax({
            url: "/bi/clinic-service/update-info",
            method: 'GET',
            data: {
                service_id: self.state.service ? self.state.service.PK : null,
                clinic_id: self.state.service ? self.state.service.clinic_id : null,
                info: self.state.service ? self.state.service.info : null,
            },
        }).done(function (resp) {
            $('.info-popup-link').magnificPopup("close");
             self.props.refreshServices();
        });
    }
    
    render() {
        return (
            <div id="info-popup" className="popup mfp-hide">
                <div>
                    { this.state.service ? <h3>{this.state.service.Ydelsesnavn}</h3> : null }
                    <label for="info">Information</label>
                    <textarea id="info" 
                              onChange={this.handleInfo.bind(this)}
                              name="info"
                              value={this.state.service ? this.state.service.info : null}></textarea>
                </div>

                <button className="button-fat" onClick={this.submit.bind(this)}>Gem Info</button>
            </div>
        );
    }
}

class RemoveGroup extends React.Component {
    constructor(props) {
        super(props);

        this.removeGroup = this.removeGroup.bind(this);
        this.removeService = this.removeService.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.closePopup = this.closePopup.bind(this);
    }

    handleRemove() {
        if (this.props.objectData.type === 'group') {
            this.removeGroup(this.props.objectData.data);
        } else if (this.props.objectData.type === 'service') {
            this.removeService(this.props.objectData.data);
        }
    }

    removeGroup(group) {
        let self = this;

        $.ajax({
            url: "/bi/clinic-groups/remove",
            method: 'GET',
            data: {
                clinic_id: group.clinic_id,
                segment_code: group.BusinessSegmentCode,
            },
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        }).done(function (resp) {
            if (resp) {
                $('.loading-wrap').fadeOut();
            }
            self.closePopup();
        });
    }

    removeService(service) {
        var self = this;

        if(service.PK !== null) {
            $.ajax({
                url: "/bi/clinic-service/remove",
                method: 'GET',
                data: {
                    service_id: service.PK,
                    clinic_id: service.clinic_id,
                },
            }).done(function (resp) {
                self.closePopup();

            });
        }
    }

    closePopup() {
        $('.remove-group-popup-link').magnificPopup("close");
        $('.edit-clinic-popup-link').magnificPopup("open");
    }

    render() {

        return (
            <div id="remove-group-popup" className="popup mfp-hide">
                <h3>Bekræft slet</h3>
                <div className="button-container">
                    <button className="button-fat" onClick={this.handleRemove}>Ja</button>
                    <button className="button-fat" onClick={this.closePopup}>Nej</button>
                </div>
            </div>
        );
    }
}

export class Ydelser extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            available_services: [],
            available_service_filtered: [],
            service_groups: [],
            attached_services: [],
            sorted_services: [],
            refresh: true,
            groupFormState: {
                BusinessSegmentName: '',
                BusinessSegmentCode: '',
                id: 9999,
                SelectedIcon: '',
                is_fysio: 0,
                is_danica: 0,
                is_visible: 0,
                is_bodyparts: 0,
                errors: [],
                order: 1,
            },
            available_service_type: ['ST', 'HV', 'KX'],
            selected_service: null
        };

        this.onSearch = _.debounce(function (event) { this.search(event.target.value) }.bind(this), 500);

        this.onGroupSubmit = this.onGroupSubmit.bind(this);
        this.addGroup = this.addGroup.bind(this);
        this.updateGroup = this.updateGroup.bind(this);
        this.onDrop = this.onDrop.bind(this);

        // this will be useful later (when clinic will be in its own page)
        this.defaultGroupFormState = {
            BusinessSegmentName: '',
            BusinessSegmentCode: '',
            id: 9999,
            is_fysio: 0,
            is_danica: 0,
            is_visible: 0,
            is_bodyparts: 0,
            order: 1,
        }
    }

    componentDidMount() {
        this.getAvailableServices();
        this.getServiceGroups();
        this.getClinicServices();
    }

    componentDidUpdate(prevProps) {
        if(this.props.clinicOriginalId !== prevProps.clinicOriginalId) {
            this.getAvailableServices();
            this.getServiceGroups();
            this.getClinicServices();
        }
    }

    getClinicGroupIconThumb(group) {

        if (!group.SelectedIcon || group.SelectedIcon === '') {
            return '';
        }

        return <img src={"/img/icons/clinic_group_icons/" + group.SelectedIcon} />
    }


    getAvailableServices() {
        this.clinic_id = this.props.clinicOriginalId;
        $('.loading-wrap').fadeIn();

        $.ajax({
            url: "/bi/clinics/available-services",
            method: 'GET',
            data: {
                clinic_id: this.clinic_id
            },
        }).done(function (resp) {
            $('.loading-wrap').fadeOut();
            this.setState({ available_services: resp.response[0], available_services_filtered: resp.response[0] });
            this.search(this.state.searchStr)
        }.bind(this))
    }

    getClinicServices() {
        this.clinic_id = this.props.clinicOriginalId;

        $.ajax({
            url: "/bi/clinic_services",
            method: 'GET',
            data: {
                clinic_id: this.clinic_id
            },
        }).done(function (resp) {
            this.setState({ attached_services: resp.data[0].services })
        }.bind(this));

        $('.loading-wrap').fadeOut();
    }



    getServiceGroups() {
        $.ajax({
            url: "/bi/service-groups",
            method: 'GET',
            data: {
                clinic_id: this.clinic_id,
            },
        }).done(function (resp) {
            let groupFormState = this.state.groupFormState;
            groupFormState.errors = null;
            this.setState({ service_groups: resp.response[0], groupFormState});
        }.bind(this));
    }

    handleGroupAdd() {
        this.setState({
            groupFormState: {
                BusinessSegmentName: '',
                BusinessSegmentCode: '',
                SelectedIcon: '',
                errors: []
            }
        });

        $( "#popup-service-group-code input").attr("disabled", false);

        $('.edit-clinic-popup-link').magnificPopup("close");
        $('.group-popup-link').magnificPopup({ type: 'inline', closeOnBgClick: false,
        callbacks: {
            afterClose: function() {
                $('.edit-clinic-popup-link').magnificPopup("open");
            }
        }
        });

        $('.group-popup-link').magnificPopup("open");
    }

    handleGroupEdit(group) {
        let self = this;
        $( "#popup-service-group-code input").attr("disabled", true);

        this.setState({
            groupFormState: {
                BusinessSegmentName: group.BusinessSegmentName,
                BusinessSegmentCode: group.BusinessSegmentCode,
                id: group.id,
                is_fysio: group.is_fysio,
                is_danica: group.is_danica,
                is_visible: group.is_visible,
                is_bodyparts: group.is_bodyparts,
                SelectedIcon: group.SelectedIcon,
                errors: [],
                order: group.order,
            }
        });

        $('.edit-clinic-popup-link').magnificPopup("close");
        $('.group-popup-link').magnificPopup({ type: 'inline', closeOnBgClick: false,
        callbacks: {
            afterClose: function() {
                $('.edit-clinic-popup-link').magnificPopup("open");
                self.setState({groupFormState: {
                    BusinessSegmentName: '',
                    BusinessSegmentCode: '',
                    id: 9999,
                    is_fysio: 0,
                    is_danica: 0,
                    is_visible: 0,
                    is_bodyparts: 0,
                    errors: [],
                    order: 1,
                }});
            }
        }
        });

        $('.group-popup-link').magnificPopup("open");
    }

    handleGroupRemove(ev, data) {
        const self = this;

        if (ev.target.className === 'remove-group-img') {
            this.setState({
                remove_data: {
                    type: 'group',
                    data: data
                }
            });

        } else {
            this.setState({
                remove_data: {
                    type: 'service',
                    data: data
                }
            });
        }

        $('.edit-clinic-popup-link').magnificPopup("close");
        $('.remove-group-popup-link').magnificPopup({ type: 'inline', closeOnBgClick: false,
            callbacks: {
                afterClose: function() {
                    self.getServiceGroups();
                    self.getClinicServices();
                    self.getAvailableServices();
                }
            }
        });

        $('.remove-group-popup-link').magnificPopup("open");
    }

    handleInfoEdit(service) {
        this.setState({
            selected_service: service
        })

        $('.edit-clinic-popup-link').magnificPopup("close");

        $('.info-popup-link').magnificPopup({ 
            type: 'inline', 
            closeOnBgClick: false,
            callbacks: {
                afterClose: function() {
                    $('.edit-clinic-popup-link').magnificPopup("open");
                }
            }
        });

        $('.info-popup-link').magnificPopup("open");
    }

    onDragOver(ev) {
        //drag effects
        ev.preventDefault();
    }

    onDragStart(ev) {
        const draggableElement = ev.target.id;
        ev.dataTransfer.setData("drag-item", draggableElement);
    }

    onDrop(ev) {
        $('.loading-wrap').fadeIn();
        const data = ev.dataTransfer.getData("drag-item");
        const dropZoneId = ev.currentTarget.id;

        if (data && dropZoneId) {
            this.addNewService(data, dropZoneId);
        }
    }

    addNewService (data, dropZoneId) {
        var self = this;
        this.clinic_id = this.props.clinicOriginalId;

        $.ajax({
            url: "/bi/clinic-service/add",
            method: 'POST',
            headers: {
                'X-CSRF-Token': Utilities.getToken(),
            },
            data: {
                service_id: data,
                service_group_code: dropZoneId,
                clinic_id: this.clinic_id,
            },
        }).done(function (resp) {
            self.getClinicServices();
            self.getAvailableServices();
        })
    }

    changeServiceType(ev, pk) {
        const clinic_id = this.props.clinicOriginalId;
        const value = ev.target.value;
        const service_type = ev.target[value].text;

        $.ajax({
            url: "/bi/clinic-services/update",
            method: 'PUT',
            headers: {
                'X-CSRF-Token': Utilities.getToken(),
            },
            data: {
                clinic_id: clinic_id,
                service_id: pk,
                service_type: service_type
            },
        }).done(function (resp) {
            this.getClinicServices();
        }.bind(this));

    }

    updateFK(ev, service) {
        const clinic_id = this.props.clinicOriginalId;

        $.ajax({
            url: "/bi/clinic-service/update-fk",
            method: 'PUT',
            headers: {
                'X-CSRF-Token': Utilities.getToken(),
            },
            data: {
                clinic_id: clinic_id,
                service_id: service.PK,
                is_fk: service.is_fk === 0 ? 1 : 0,
            },
        }).done(function (resp) {
            this.getClinicServices();
        }.bind(this));
    }

    showGroupsWithServices() {
        const groups = [];

        if (this.state.service_groups.length > 0) {
            this.state.service_groups.sort(function(a, b) {
                return a.order - b.order;
            });
            for (const group of this.state.service_groups) {
                const services = this.state.attached_services
                    .filter(service => service.BusinessSegmentCode === group.BusinessSegmentCode);

            const el = (
                <div className="service-group">
                    <div className="top">
                        <div className="name">
                            <h6>{group.BusinessSegmentName} ({group.BusinessSegmentCode}) 
                                {this.getClinicGroupIconThumb(group)}
                                { group.order ? <span>{group.order}</span> : null }
                            </h6>
                            
                        </div>
                        {Utilities.getUserType() > 3 &&
                            <div className="actions">
                                <img src="/img/edit.svg" onClick={() => this.handleGroupEdit(group)}/>
                                <img className="remove-group-img" src="/img/delete.svg" onClick={(ev) => this.handleGroupRemove(ev, group)}/>
                            </div>
                        }
                    </div>

                    <ul id={group.BusinessSegmentCode} className="attached-services"
                            onDragOver={this.onDragOver}
                            onDrop={this.onDrop}>
                            {services.length < 1 &&
                                <li>There are no services for this group</li>
                            }
                            {services.map(service => 
                                <li id={service.PK}>
                                    <span className="service-name">{service.Ydelsesnavn}</span>
                                    <span className="added-service-code">{service.Ydelseskode}</span>
                                    <div className="actions-container">
                                        <div className="left">
                                            <div className="chooser-container">
                                                <Chosen data-placeholder="Choose service type" disableSearch="true" width={"100%"} onChange={(ev) => this.changeServiceType(ev, service.PK)}>
                                                    {this.state.available_service_type.map(type => {
                                                        const availableType = this.state.available_service_type;
                                                        const selected_index = availableType.findIndex(type => type === service.service_type);

                                                        return type === service.service_type ?
                                                        <option selected value={selected_index}>{type}</option>
                                                    :
                                                        <option value={availableType.indexOf(type)}>{type}</option>
                                                    })}
                                                </Chosen>
                                            </div>
                                            <div className="checkbox-wrapper">
                                                <input id={"fk-" + service.PK} data-property="is_fk" onChange={(ev) => this.updateFK(ev, service)} type="checkbox" checked={service.is_fk === 1} />
                                                <label htmlFor={"fk-" + service.PK}></label>
                                                <span>FK</span>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <i className='service-edit' onClick={() => this.handleInfoEdit(service)}><img src="/img/edit.svg" /></i>
                                            <i className='service-remove' onClick={(ev) => this.handleGroupRemove(ev, service)}><img src="/img/delete.svg" /></i>

                                        </div>
                                    </div>
                                </li>)}
                    </ul>
                </div>
                );

                groups.push(el);
            }
        } else {
            const el = (
                <ul>There are no groups</ul>
            );

            groups.push(el);
        }

        return groups;
    }

    showAvailableServices() {
        if (this.state.available_services_filtered && this.state.available_services_filtered.length > 0) {
            return this.state.available_services_filtered
                .map(service => <li id={service.original_id}
                                    draggable="true"
                                    onDragStart={this.onDragStart}><span> {service.service_name}</span>
                    <span className="available-service-code"> {service.service_code}</span><img src="/img/drag.svg" /></li>);
        } else {
            return <li>There are no available services for this clinic</li>;
        }
    }

    search(value) {
        this.setState({searchStr: value});
        if (this.state.searchStr === '') {
            this.setState({ available_services_filtered: this.state.available_services });
        } else {
            const services = this.state.available_services
                .filter(service => service.service_name.toLowerCase().includes(this.state.searchStr.toLowerCase()));
            this.setState({ available_services_filtered: services });
        }
    }

    onGroupSubmit(group) {
        const existingGroupIndex = this.state.service_groups.findIndex(g => g.id === group.id);

        if (existingGroupIndex !== -1) {
            this.updateGroup(group, existingGroupIndex);
        } else {
            this.addGroup(group);
        }
    }

    addGroup(group) {
        let self = this;
        const groups = this.state.service_groups;
        groups.push(group);

        $.ajax({
            url: "/bi/clinic-groups/add",
            method: 'POST',
            headers: {
                'X-CSRF-Token': Utilities.getToken(),
            },
            data: {
                group_id: group.BusinessSegmentCode,
                group_name: group.BusinessSegmentName,
                clinic_id: this.props.clinicOriginalId,
                is_fysio: group.is_fysio,
                is_danica: group.is_danica,
                is_visible: group.is_visible,
                is_bodyparts: group.is_bodyparts,
                SelectedIcon: group.SelectedIcon,
                order: group.order,
            },
        }).done(function (resp) {
            if (resp.status === 200) {
                self.setState({ service_groups: groups });
                $('.group-popup-link').magnificPopup("close");

            } else {
                self.setState({groupFormState: {errors: resp.status}});
            }
            self.getServiceGroups();
        });
    }

    updateGroup(group, index) {
        let self = this;
        const groups = this.state.service_groups;
        groups[index] = group;

        $.ajax({
            url: "/bi/clinic-groups/edit",
            method: 'PUT',
            headers: {
                'X-CSRF-Token': Utilities.getToken(),
            },
            data: {
                group_name: group.BusinessSegmentName,
                group_id: group.id,
                SelectedIcon: group.SelectedIcon,
                is_fysio: group.is_fysio,
                is_danica: group.is_danica,
                is_visible: group.is_visible,
                is_bodyparts: group.is_bodyparts,
                order: group.order,
            },
        }).done(function (resp) {
            if (resp.status === 200) {
                self.setState({ service_groups: groups });
                $('.group-popup-link').magnificPopup("close");
            }

            self.getServiceGroups();
        });
    }

    render() {
        return (
            <div>
                <Group onSubmit={this.onGroupSubmit} inputState={this.state.groupFormState} groupList={this.state.service_groups}/>
                <Info service={this.state.selected_service} refreshServices={this.getClinicServices.bind(this)} />
                <RemoveGroup objectData={this.state.remove_data} refreshServices={this.getClinicServices.bind(this)} />
                <div className={'service-list-container'}>
                    <div className="group-container">
                        <div className="group-top">
                            <h3>Ydelsesgrupper</h3>
                            {Utilities.getUserType() > 3 &&
                            <button className="group-add-button" onClick={this.handleGroupAdd.bind(this)}>
                                <img src="/img/plus.svg" /> OPRET NY
                            </button>
                            }
                            <a href="#group-popup" className="group-popup-link"></a>
                            <a href="#info-popup" className="info-popup-link"></a>
                            <a href="#remove-group-popup" className="remove-group-popup-link"></a>
                        </div>
                        <div className="group-list">
                            <ul className="group-list__items">
                                {this.showGroupsWithServices()}
                            </ul>
                        </div>
                    </div>

                    <div className="service-container">
                        <div className="service-top">
                            <h3>Ydelser (A-A)</h3>
                            <div className="search-box">
                                <input type="search" placeholder="Search..." onChange={e => { e.persist(); this.onSearch(e) }}/>
                            </div>
                        </div>
                        <div className="service-list">
                            <ul>
                                {this.showAvailableServices()}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
