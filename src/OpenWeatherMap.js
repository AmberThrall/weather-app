class OpenWeatherMap {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async query(page, params = {}) {
        if (!params["appid"])
            params["appid"] = this.apiKey;

        // Construct the url
        let url = "http://api.openweathermap.org/data/2.5/" + page;
        let first = true;
        for (let p in params) {
            if (params[p] !== undefined) {
                url += (first ? "?" : "&") + p + "=" + params[p];
                first = false;
            }
        }

        // Async. fetch the response.
        const response = await fetch(url, { mode: 'cors' });

        if (!response.ok)
            throw new Error(`An error occured: ${response.status}`);

        const json = await response.json();
        if (json["cod"] && json["cod"] !== 200)
            throw new Error(json["message"]);

        return json;
    }

    async onecall(lat, lon, exclude = [], units = "standard", lang = "en") {
        return this.query("onecall", { lat, lon, exclude: exclude.join(","), units, lang });
    }

    async current(q, units = "standard", lang = "en") {
        return this.query("weather", { q, units, lang });
    }
}

export default OpenWeatherMap;
