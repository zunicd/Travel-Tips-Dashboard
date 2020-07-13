var country = "US";
var locale = "en-US";
var currencies = "USD";
var outbound = "IND-sky";
var inbound = "ORD-sky";
var outboundDate = "2020-09-01";
var inboundDate = "2020-12-31";

$("#submit").click(function (e) {
	inbound = $("#destinations").children("option").filter(":selected").val();
	console.log("Inbound", inbound)
	var inboundformatted = inbound.split("-");
	//console.log(inboundformatted)
	outboundDate = $("#startd").val();
	console.log("Outbound Date", outboundDate)
	inboundDate = $("#endd").val();
	console.log("Inbound Date", inboundDate)

	var settings = {
		"async": true,
		"crossDomain": true,
		"url": (`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browseroutes/v1.0/${country}/${currencies}/${locale}/${outbound}/${inbound}/${outboundDate}?inboundpartialdate=${inboundDate}`),
		"method": "GET",
		"headers": {
			"x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
			"x-rapidapi-key": "68e3f8273fmshed3dde3b70a9127p1906b3jsn805b2870f3f4"
		}
	};
	//console.log("url", settings.url);

	$.ajax(settings).done(function (response) {
		console.log("Response", response);
		var xAxis = [];
		var yAxis = [];
		$.each(response.Quotes, function (index, value) {
			yAxis.push(value.MinPrice);
		});
		console.log(yAxis);

		$.each(response.Carriers, function (index, value) {
			xAxis.push(value.Name);
		});
		console.log(xAxis);

		var trace1 = [
			{
				x: xAxis,
				y: yAxis,
				type: 'bar'
			}
		];
		var layout = {
			title: `Cheapest Flights from IND to ${inboundformatted[0]}`,
			xaxis: { title: "Airline" },
			yaxis: { title: "Minimum Price" }
		};
		Plotly.newPlot('flightcost', trace1, layout);



		//console.log(JSON.stringify(response, null, 2))

	});
});