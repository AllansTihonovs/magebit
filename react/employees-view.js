import { Therapists } from "./clinic/therapists";
import { SubMenu } from './components/SubMenu';
import { Therapist } from "./clinic/therapist";

export class Page extends React.Component {
    constructor(props) {
		super(props);

		this.state = {
			status: false,
			clinics: clinics,
			clinicID: '',
		};

		if (Utilities.getUserType() < 4) {
			this.state.clinicID = _.map(this.state.clinics, function(clinic) {
				return clinic.original_id;
			})
		}
	}

	addTherapist(el) {
		$("#new-therapist").click();
	}

    render() {
        return (
			<div className="content-wrap">
				<SubMenu type='employee' openForm={this.addTherapist} />
				<div className="dashboard-wrapper all-employee">
					<Therapists clinicId={this.state.clinicID} />
				</div>
			</div>
        );
    }
}

ReactDOM.render(
	React.createElement(Page, null),
	document.getElementById('content')
);