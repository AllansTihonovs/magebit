class View {
    render() {
        var Main = React.createClass({

            render: function() {
                return (
                    <div>
                        <div className="navigation"></div>
                        <div className="homepage-view admin-sidebar">
                            <div className="welcome-text">
                                <h3>Velkommen - FysioDanmark Administration</h3>
                            </div>

                            <div className="welcome__boxes">
                                <a href="/bi/clinics">
                                    <div className="welcome__boxes--item">
                                        <img src="/img/pin.svg" />
                                        <p>Klinikker</p>
                                    </div>
                                </a>
                                {Utilities.getUserType() > 3 &&
                                <a href="/bi/superclinic">
                                    <div className="welcome__boxes--item">
                                        <img src="/img/Fysioterapi.svg"/>
                                        <p>Super Klinikker</p>
                                    </div>
                                </a>
                                }
                                {Utilities.getUserType() > 3 &&
                                    <a href="/bi/users">
                                        <div className="welcome__boxes--item">
                                            <img src="/img/user-alt.svg"/>
                                            <p>Brugere</p>
                                        </div>
                                    </a>
                                }
                                <a href="/bi/employees">
                                    <div className="welcome__boxes--item">
                                        <img src="/img/edit.svg" />
                                        <p>Medarbejdere</p>
                                </div>
                                </a>
                            </div>
                        </div>
                    </div>
                );
            },
        });

        var Page = React.createClass({
            render: function () {
                return (
                    <div className="content-wrap">
                        <Main/>
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
    var view = new View();

    view.render();
});