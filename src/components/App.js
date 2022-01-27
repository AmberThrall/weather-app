import React from 'react';
import OpenWeatherMap from '../OpenWeatherMap';
import './App.css';

function formatTemp(temp, units) {
    switch (units) {
        case "standard":
            return `${Math.floor(temp)} K`;
        case "imperial":
            return `${Math.floor((temp - 273.15) * 1.8 + 32)}°F`;
        case "metric":
            return `${Math.floor(temp - 273.15)}°C`;
        default:
            return temp;
    }
}

function cardinalDir(deg) {
    if (deg >= 337 || deg <= 22)
        return "N";
    else if (deg > 22 && deg <= 67)
        return "NE";
    else if (deg > 67 && deg <= 112)
        return "E";
    else if (deg > 112 && deg <= 157)
        return "SE";
    else if (deg > 157 && deg <= 202)
        return "S";
    else if (deg > 202 && deg <= 247)
        return "SE";
    else if (deg > 247 && deg <= 292)
        return "E";
    else
        return "NE";
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            forecastMode: "daily",
            location: "", 
            units: "imperial",
            error: "",
            current: {
                weather: [{
                    description: "broken clouds",
                }],
                main: {
                    temp: 0,
                    feels_like: 0,
                    temp_min: 0,
                    temp_max: 0,
                    pressure: 0,
                    humidity: 0,
                },
                visibility: 0,
                wind: { speed: 0, deg: 0 },
                clouds: { all: 0 },
                dt: 0,
                name: "London",
            },
            daily: [],
            hourly: [],
        };

        this.api = new OpenWeatherMap("f18d99f08ce07654fadb15c8f9c5259a");
        
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.update();
        window.setInterval((function(self) { return function() { self.update(); } })(this), 1000 * 60 * 5); // Update every 5 minutes.
    }

    handleChange(e) {
        this.setState({ location: e.target.value });
        this.update();
    }

    update() {
        const location = this.state.location === "" ? "London" : this.state.location;
        this.setState({ error: "Fetching..." });

        this.api.current(location, "standard").then(json => {
            this.setState({ current: json });
            this.api.onecall(json["coord"]["lat"], json["coord"]["lon"], [], "standard").then(json => {
                this.setState({ daily: json["daily"], hourly: json["hourly"], error: "" });
            }).catch(error => {
                this.setState({error: error.message});
            });
        }).catch(error => {
            this.setState({ error: error.message });
        });
    }

    render() {
        const desc = this.state.current["weather"][0]["description"].replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        const location = this.state.current["name"];
        const temp = formatTemp(this.state.current["main"]["temp"], this.state.units);

        let forecast;
        if (this.state.forecastMode === "daily") {
            const forecastItems = this.state.daily.slice(0,7).map((day, i) => {
                return (
                    <li className="forecastDay" key={i}>
                        <h3>{(new Date(day["dt"] * 1000)).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</h3>
                        <h2>{formatTemp(day["temp"]["max"], this.state.units) + " / " + formatTemp(day["temp"]["min"], this.state.units)}</h2>
                        <img src={`https://openweathermap.org/img/wn/${day["weather"][0]["icon"]}.png`} alt={day["weather"][0]["description"]} />
                    </li>
                );
            });

            forecast = <ul>{forecastItems}</ul>;
        }
        else {
            const forecastItems = this.state.hourly.slice(0,24).map((hour, i) => {
                return (
                    <li className="forecastHour" key={i}>
                        <h3>{(new Date(hour["dt"] * 1000)).toLocaleTimeString("en-US", { hour: "numeric" })}</h3>
                        <h2>{formatTemp(hour["temp"], this.state.units)}</h2>
                        <img src={`https://openweathermap.org/img/wn/${hour["weather"][0]["icon"]}.png`} alt={hour["weather"][0]["description"]} />
                    </li>
                );
            });

            forecast = <ul>{forecastItems}</ul>;
        }

        return (
            <>
                <div className="top">
                    <div className="topLeft">
                        <h2>{desc}</h2>
                        <h4>{location}</h4>
                        <p>{(new Date(this.state.current["dt"] * 1000)).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}</p>
                        <h1>{temp}</h1>
                        <img src={`https://openweathermap.org/img/wn/${this.state.current["weather"][0]["icon"]}@4x.png`} alt={desc} />
                    </div>
                    <div className="search">
                        <input value={this.state.location} placeholder="Location..." type="text" className="searchBar" onChange={this.handleChange}></input><br />
                        <span>{this.state.error}</span>
                    </div>
                    <div className="topRight">
                        <p>Feels Like</p>
                        <h2>{formatTemp(this.state.current["main"]["feels_like"], this.state.units)}</h2>
                        <p>Humidity</p>
                        <h2>{this.state.current["main"]["humidity"] + "%"}</h2>
                        <p>Wind</p>
                        <h2>{Math.floor(this.state.current["wind"]["speed"]) + " mph " + cardinalDir(this.state.current["wind"]["deg"])}</h2>
                    </div>
                </div>
                <div className="bottom">
                    <p>
                        <strong>Forecast: </strong>
                        <button className={this.state.forecastMode === "daily" ? "buttonSelected" : "buttonNotSelected"} onClick={() => {
                            this.setState({ forecastMode: "daily" });
                        }}>Daily</button>
                        <button className={this.state.forecastMode === "hourly" ? "buttonSelected" : "buttonNotSelected"} onClick={() => {
                            this.setState({ forecastMode: "hourly" });
                        }}>Hourly</button>
                    </p>
                    {forecast}
                    <p className="bottomRight">
                        <strong>Units:</strong>
                        <button className={this.state.units === "imperial" ? "buttonSelected" : "buttonNotSelected"} onClick={() => {
                            this.setState({ units: "imperial" });
                        }}>F</button>
                        <button className={this.state.units === "metric" ? "buttonSelected" : "buttonNotSelected"} onClick={() => {
                            this.setState({ units: "metric" });
                        }}>C</button>
                        <button className={this.state.units === "standard" ? "buttonSelected" : "buttonNotSelected"} onClick={() => {
                            this.setState({ units: "standard" });
                        }}>K</button>
                    </p>
                </div>
            </>
        );
    }
}

export default App;
