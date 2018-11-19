enyo.kind({
	name: "DateTime",
	layoutKind: "FittableRowsLayout",
	events: {
		onBackbutton: ""
	},
	timeZones: null, // Possibly filtered by city name search term
	referenceTimeZones: null, // As returned from the Service
	currentTimeZone: null,
	palm: false,
	components:[
		{kind: "onyx.Toolbar",
		 style: "line-height: 28px;",
		 onSearch: "searchFieldChanged",
		 components:[
			 {name: "TextDiv",
			  tag: "div",
			  style: "height: 100%; margin: 0;",
			  components: [
				  {name: "Title",
				   content: "Date & Time"}
			  ]},
			 // Inspired by the webos-lib PortsSearch kind
			 {name: "SearchDecorator",
			  kind: "onyx.InputDecorator",
			  style: "position: absolute; top: 10px; right: 8px; padding: 2px 4px 3px 3px;",
			  showing: false,
			  components:[
				  {name: "SearchInput",
				   id: "searchBox",
				   kind: "onyx.Input",
				   placeholder: $L("Search for a city"),
				   selectOnFocus: false, //False initially to prevent focus-stealing
				   oninput: "citySearchTermChanged"},
				  {kind: "Image",
				   src: "$lib/webos-lib/assets/search-input-search.png",
				   style: "width: 24px; height: 24px;"}
			  ]}
		 ]},
		{ name: "DateTimePanels", kind: "Panels",
		  arrangerKind: "HFlipArranger",
		  fit: true, draggable: false, components: [
			/* Main Date Time panel */
			{ name: "MainDateTimeSettings",
			  kind: "Scroller",
			  touch: true, horizontal: "hidden",
			  components: [{
			  kind: "enyo.FittableRows",
			  components: [
				{kind: "onyx.Groupbox", layoutKind: "FittableRowsLayout",
				 name: "mdts1", style: "padding: 35px 10% 0 10%;", components: [
					{kind: "onyx.GroupboxHeader", content: "Time and Date Settings"},
					{ kind: "enyo.FittableColumns", classes: "group-item", components: [
						{content: "Time Format", fit: true },
						{kind: "onyx.PickerDecorator", components: [
							{},
							{name: "TimeFormatPicker", kind: "onyx.Picker", onChange: "timeFormatChanged", components: [
								{content: "12 Hour", active: true},
								{content: "24 Hour"}
							]},
							{kind: "onyx.Tooltip", content: "12/24hr Setting"}
						]}
					]},
					{ kind: "enyo.FittableColumns", classes: "group-item", components:[
						{content: "Network Time", fit: true },
						{kind: "onyx.PickerDecorator", components: [
							{name: "NetworkTimeToggle", kind: "onyx.ToggleButton", value: true, onChange: "networkTimeChanged"},
							{kind: "onyx.Tooltip", content: "Network Time"}
						]}
					]},
					{ name: "TimePickerRow", kind: "enyo.FittableColumns", classes: "group-item", components:[
						{content: "Time", fit: true},
						{name: "TimePicker", kind: "onyx.TimePicker", onSelect: "dateTimeChanged"},
					]},
					{ name: "DatePickerRow", kind: "enyo.FittableColumns", classes: "group-item", components:[
						{content: "Date", fit: true},
						{name: "DatePicker", kind: "onyx.DatePicker", onSelect: "dateTimeChanged"},
					]}
				]},
				{kind: "onyx.Groupbox", layoutKind: "FittableRowsLayout",
				 name: "mdts2", style: "padding: 10px 10% 8px 10%;", components: [
					{kind: "onyx.GroupboxHeader", content: "Time Zone"},
					{classes: "group-item", name: "TimeZoneItem", kind: "onyx.Item", content: "unknown",
					 tapHighlight: true, ontap: "showTimeZonePicker"}
				]}
			]}
			]},
			  /* Time Zone panel */
			{
			  kind: "enyo.FittableRows", components: [
				  {
					  name: "TimeZonePicker",
					  kind: "onyx.Groupbox",
					  layoutKind: "FittableRowsLayout",
					  style: "padding: 35px 10% 8px 10%;",
					  fit: true,
					  components: [
						  {
							  kind: "onyx.GroupboxHeader",
							  content: "Choose a Time Zone"
						  },
						  {
							  touch: true,
							  fit: true,
							  name: "TimeZonesList",
							  kind: "List",
							  count: 0,
							  onSetupItem: "setupTimeZoneRow",
							  components: [{
								  name: "timeZoneListItem",
								  classes: "tz-group-item",
								  ontap: "listItemTapped", components: [
									  {tag: "div", components: [
									  {name: "TZCountry", style: "float: left; font-weight: bold;",
									   allowHtml: true, content: "Country"},
									  {style: "float: right;",
									   name: "TZOffset", content: "GMT+10:00"}]},
									  {tag: "br"},
									  {tag: "div", style: "padding-top: 1px;", components: [
									  {name: "TZCity", style: "float: left;",
									   allowHtml: true, content: "City"},
									  {style: "float: right; font-size: smaller; padding-top: 2px;",
									   allowHtml: true,
									   name: "TZDescription", content: "Description"}]},
									  {tag: "br"}
								  ]
							  }]
						  }
					  ]
				  }]
			}
		  ]},
		{kind: "onyx.Toolbar", components:[
			{name: "Grabber", kind: "onyx.Grabber"},
		]},
		{kind: "SystemService", method: "getPreferences", name: "GetSystemPreferences", onComplete: "handleGetPreferencesResponse"},
		{kind: "SystemService", method: "setPreferences", name: "SetSystemPreferences" },
		{kind: "enyo.LunaService", method: "setSystemTime", name: "SetSystemTime", service: "luna://com.palm.systemservice/time" },
		{kind: "SystemService", method: "getPreferenceValues", name: "GetSystemPreferenceValues", onComplete: "handleGetPreferenceValuesResponse" },
	],
	//Handlers
	create: function(inSender, inEvent) {
		this.inherited(arguments);
		if(!window.PalmSystem) {
			enyo.log("Non-palm platform, service requests disabled.");

			/* Mock some data requests */

			this.handleGetPreferenceValuesResponse(null, {
				"timeZone": [
					{ "Country": "Samoa", "CountryCode": "WS", "ZoneID": "Pacific\/Apia", "City": "Apia", "Description": "West Samoa Time", "offsetFromUTC": 780, "supportsDST": 1, "preferred": true }, 
					{ "Country": "United States of America", "CountryCode": "US", "ZoneID": "America\/Adak", "City": "Adak", "Description": "Hawaii-Aleutian Time", "offsetFromUTC": -600, "supportsDST": 1, "preferred": true }, 
					{ "Country": "French Polynesia", "CountryCode": "PF", "ZoneID": "Pacific\/Tahiti", "City": "Tahiti", "Description": "Tahiti Time", "offsetFromUTC": -600, "supportsDST": 0 }
				]});

			this.handleGetPreferencesResponse(null, {
				timeFormat: "HH12",
				timeZone: { "Country": "French Polynesia", "CountryCode": "PF", "ZoneID": "Pacific\/Tahiti", "City": "Tahiti", "Description": "Tahiti Time", "offsetFromUTC": -600, "supportsDST": 0 },
				useNetworkTime: true
			});

			return;
		}

		this.$.GetSystemPreferences.send({keys: ["timeFormat", "timeZone", "useNetworkTime"]});

		/* Retrieve all time zones */
		this.$.GetSystemPreferenceValues.send({key: "timeZone"});

		this.palm = true;
	},
	reflow: function(inSender) {
		this.inherited(arguments);
		// Magic numbers based on webos-lib PortsSearch kind
		this.$.SearchInput.applyStyle("width", this.hasNode().offsetWidth - 182 + "px");
		this.$.SearchDecorator.applyStyle("width", this.$.SearchInput.hasNode().offsetWidth + 32 + "px");
		if(enyo.Panels.isScreenNarrow()) {
			this.$.Grabber.applyStyle("visibility", "hidden");
			this.$.mdts1.setStyle("padding: 35px 5% 0 5%;");
			this.$.mdts2.setStyle("padding: 10px 5% 8px 5%;");
			this.$.TimeZonePicker.setStyle("padding: 35px 5% 8px 5%;");
		}
		else {
			this.$.Grabber.applyStyle("visibility", "visible");
		}
	},
	updateTimeControlStates: function() {
		if (this.$.NetworkTimeToggle.value) {
			this.$.TimePickerRow.setShowing(false);
			this.$.DatePickerRow.setShowing(false);
		}
		else {
			this.$.TimePickerRow.setShowing(true);
			this.$.DatePickerRow.setShowing(true);
		}
	},
	//Action Handlers
	timeFormatChanged: function(inSender, inEvent) {
		if(this.palm) {
			this.$.SetSystemPreferences.send({timeFormat: inSender.selected.content === "12 Hour" ? "HH12" : "HH24"});
		}
		else {
			this.log(inSender.selected);
		}

		if (typeof(this.$.TimePicker) !== "undefined")
			this.$.TimePicker.setIs24HrMode(inSender.selected.content !== "12 Hour");
	},
	networkTimeChanged: function(inSender, inEvent) {
		if(this.palm) {
			this.$.SetSystemPreferences.send({useNetworkTime: inSender.value, receiveNetworkTimeUpdates: inSender.value});
		}
		else {
			this.log(inSender.value);
		}

		this.updateTimeControlStates();
	},
	dateTimeChanged: function(inSender, inEvent) {
		var timeObj = {};
		timeObj.utc = parseInt(inEvent.value.getTime() / 1000);

		if(this.palm) {
			this.$.SetSystemTime.send(timeObj);
			this.$.SetSystemPreferences.send({useNetworkTime: false, receiveNetworkTimeUpdates: false});
		}
		else {
			this.log(timeObj);
		}
	},
	citySearchTermChanged: function(inSender, inEvent) {
		var searchTerm = this.$.SearchInput.getValue().toLowerCase();
		if (searchTerm === '') {
			this.timeZones = this.referenceTimeZones;
		} else {
			this.timeZones = [];
			for (var i = 0; i < this.referenceTimeZones.length; i += 1) {
				if (this.referenceTimeZones[i].Sitty.toLowerCase().indexOf(searchTerm) >= 0) {
					this.timeZones.push(this.referenceTimeZones[i]);
				}
			}
		}
		this.$.TimeZonesList.setCount(this.timeZones.length);
		this.$.TimeZonesList.render();
	},
	listItemTapped: function(inSender, inEvent) {
		var newTimeZone = this.timeZones[inEvent.index];
		if (this.palm) {
			this.$.SetSystemPreferences.send({timeZone: newTimeZone});
		}
		this.currentTimeZone = newTimeZone;
		this.log("New time zone is " + newTimeZone.ZoneID);
		this.$.TimeZoneItem.setContent(this.currentTimeZone.ZoneID);
		this.showMainDateTimePanel();
	},
	setupTimeZoneRow: function (inSender, inEvent) {
		var cntry = this.timeZones[inEvent.index].Country;
		var offset = this.timeZones[inEvent.index].offsetFromUTC;
		var cty = this.timeZones[inEvent.index].City;
		var dscrptn = this.timeZones[inEvent.index].Description;
		// Want offset in hours and minutes
		var hrs = offset / 60;
		var ihrs = parseInt(hrs, 10);
		var mnts = Math.abs(offset) - Math.abs(ihrs) * 60;
		if (hrs !== 0) {
			offset = "UTC " + (ihrs >= 0 ? "+" : "") +
				ihrs + ":" + (mnts < 10 ? "0" : "") + mnts;
		} else {
			offset = "UTC";
		}
		// Manage a handful of unwieldy entries.
		// (Unfortunate that this tests positive even if we are in landscape orientation.)
		if (enyo.Panels.isScreenNarrow()) {
			// Ref. http://www.timeanddate.com/time/zones/
			if (dscrptn === "Fernando de Noronha Time") {
				dscrptn = "FNT";
			}
			// Arbitrary. Looks OK on a Nexus 4.
			if (cntry.length >= 31) {
				cntry = cntry.slice(0,28) + "&hellip;";
			}
		}
		this.$.TZCountry.setContent(cntry);
		this.$.TZOffset.setContent(offset);
		this.$.TZCity.setContent(cty);
		this.$.TZDescription.setContent(dscrptn);
		return true;
	},
	showTimeZonePicker: function(inSender, inEvent) {
		this.$.SearchDecorator.setShowing(true);
		this.$.DateTimePanels.setIndex(1);
		this.render(); // Otherwise the search layout is bad
	},
	showMainDateTimePanel: function(inSender, inEvent) {
		this.$.SearchDecorator.setShowing(false);
		this.$.DateTimePanels.setIndex(0);
	},
	handleBackGesture: function(inSender, inEvent) {
		this.log("sender:", inSender, ", event:", inEvent);
		if (this.$.DateTimePanels.getIndex() > 0) {
			this.$.SearchDecorator.setShowing(false);
			this.$.DateTimePanels.setIndex(0);
		} else {
			this.doBackbutton();
		}
	},
	//Service Callbacks
	handleGetPreferencesResponse: function(inSender, inResponse) {
		if(inResponse.timeFormat !== undefined) {
			this.$.TimeFormatPicker.setSelected(this.$.TimeFormatPicker.getClientControls()[inResponse.timeFormat === "HH12" ? 0 : 1]);
		}

		if(inResponse.useNetworkTime !== undefined)
			this.$.NetworkTimeToggle.setValue(inResponse.useNetworkTime);

		if(inResponse.timeZone !== undefined) {
			this.currentTimeZone = inResponse.timeZone;
			this.$.TimeZoneItem.setContent(this.currentTimeZone.ZoneID);
		}

		this.updateTimeControlStates();
	},
	handleGetPreferenceValuesResponse: function(inSender, inResponse) {
		if (inResponse["timeZone"] !== undefined) {
			this.timeZones = this.referenceTimeZones = inResponse["timeZone"];
			// Give the city-less entries "cities" to search on.
			// ("Sitty" for searchable City.)
			for (var i = 0; i < this.referenceTimeZones.length; i += 1) {
				var cty = this.referenceTimeZones[i].City;
				if (!cty || cty.length === 0) {
					cty = this.referenceTimeZones[i].Country;
				}
				this.referenceTimeZones[i].Sitty = cty;
			}
			// Safe to assume there is no search term at this stage (probably)
			this.timeZones = this.referenceTimeZones;
			this.$.TimeZonesList.setCount(this.timeZones.length);
		}
	}
});
