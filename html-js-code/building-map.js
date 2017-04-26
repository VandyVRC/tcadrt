// Important note: There is a certain amount of sloppiness that is tolerated by the fact that the jQuery functions
// that handle the XML returned from AJAX strips off the language tags that the SPARQL endpoint sends in the query
// results.  This means that handling the results is easier if the language tags aren't desired (which they usually 
// arent).  However, if they were desired, they would have to be generated and attached to the literals.  Also,
// if a version of this program were created where the queries requested application/sparql-results+json instead of 
// XML one would need to pay attention to whether the results included language tags or not.  The current (2016-11) 
// Heard Library SPARQL endpoint only supports XML results, but in the future cleaner code might result if the 
// program were converted to using JSON results.

// See http://leafletjs.com/examples/quick-start/ for details on using leafletjs to generate a map


var numResultstoReturn = 300; // the max number of results to return in the SPARQL search query
var numResultsPerPage = 10; // the number of search results per page, for pagination
var isoLanguage = 'en';
var imageHtmlBlob = '';
var done = 'no'

    // create the map centered on eastern China with zoom level 5 (shows most of the country)
    var mymap = L.map('mapid').setView([34, 115], 5);
    

var dynastiesEn = [
	"Tang",
	"Five Dynasties",
	"Northern Song",
	"Southern Song",
	"Liao",
	"Jin",
	"Yuan",
	"Ming",
	"Qing"
];

var dynastiesZhHans = [
	"唐",
	"五代",
	"北宋",
	"南宋",
	"辽",
	"金",
	"元",
	"明",
	"清"
];

var dynastiesZhHant = [
	"唐",
	"五代",
	"北宋",
	"南宋",
	"遼",
	"金",
	"元",
	"明",
	"清"
];

// URIs from the PeriodO ontology http://perio.do/
var dynastiesURI = [
	"<http://n2t.net/ark:/99152/p0fp7wvrjpj>",
	"<http://n2t.net/ark:/99152/p0fp7wv5h26>",
	"<http://n2t.net/ark:/99152/p0fp7wvjvn8>",
	"<http://n2t.net/ark:/99152/p0fp7wv9x7n>",
	"<http://n2t.net/ark:/99152/p0fp7wvw8zq>",
	"<http://n2t.net/ark:/99152/p0fp7wvmghn>",
	"<http://n2t.net/ark:/99152/p0fp7wvvrz5>",
	"<http://n2t.net/ark:/99152/p0fp7wv2s8c>",
	"<http://n2t.net/ark:/99152/p0fp7wvtqp9>"
];

// The local ID needs to be parsed from the search ("?") part of the URL
var localID = location.search;
// strip off the initial "?"
if (localID.length<=1)
	{
	localID="";  //deal with the case where no (or an empty) search is given
	}
else
	{
	localID=localID.substring(1);
	}
// if the search string is not empty, set the isoLanguage to be the search string
if (localID!=""){
	        isoLanguage=localID;
			// searching, so show the spinner icon
			$('#searchSpinner').show();

			if (isoLanguage=='en') {
			document.getElementById("box0").selectedIndex = "0";
			$("#boxLabel0").text("Language");
			$("#boxLabel1").text("Province");
			$("#boxLabel3").text("Dynasty range for site");
			$("#boxLabel2").text("Historic Site");
			$("#searchButton").text("Search");
			$("#resetButton").text("Reset");
			}
			if (isoLanguage=='zh-hans') {
			document.getElementById("box0").selectedIndex = "1";
			$("#boxLabel0").text("语言");
			$("#boxLabel1").text("省");
			$("#boxLabel3").text("历代");
			$("#boxLabel2").text("名胜");
			$("#searchButton").text("搜索");
			$("#resetButton").text("重启");
			}
			if (isoLanguage=='zh-hant') {
			document.getElementById("box0").selectedIndex = "2";
			$("#boxLabel0").text("語言");
			$("#boxLabel1").text("省");
			$("#boxLabel3").text("歷代");
			$("#boxLabel2").text("名勝");
			$("#searchButton").text("搜索");
			$("#resetButton").text("重啟");
			}
			setProvinceOptions(isoLanguage);
			setDynastyOptions(isoLanguage);
			var provinceSelection = $("#box1").val();
			var dynastySelection = $("#box3").val();
			setSiteOptions(provinceSelection,dynastySelection,isoLanguage);
}


function setProvinceOptions(isoLanguage) {
	if (isoLanguage=='en') {languageTag='zh-latn-pinyin';}
	if (isoLanguage=='zh-hans') {languageTag='zh-hans';}
	if (isoLanguage=='zh-hant') {languageTag='zh-hant';}

	// start the province dropdown over with "All/全部" as the first option
	$("#box1 option:gt(0)").remove();
	if (isoLanguage=='en') {$("#box1 option").text("All");}
	if (isoLanguage=='zh-hans') {$("#box1 option").text("全部");}
	if (isoLanguage=='zh-hant') {$("#box1 option").text("全部");}

	// create URI-encoded query string
        var string = 'SELECT DISTINCT ?province WHERE {'
                    +'?site <http://www.geonames.org/ontology#featureCode> <http://www.geonames.org/ontology#S.ANS>.'
                    +'?site <http://rs.tdwg.org/dwc/terms/stateProvince> ?province.'
                    +"FILTER (lang(?province)='"+languageTag+"')"
                    +'}'
                    +'ORDER BY ASC(?province)';
	var encodedQuery = encodeURIComponent(string);

        // send query to endpoint
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encodedQuery,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
            success: parseProvinceXml
        });

	}

function setDynastyOptions(isoLanguage) {
	
	if (isoLanguage=='en') {languageTag='en';}
	if (isoLanguage=='zh-hans') {languageTag='zh-hans';}
	if (isoLanguage=='zh-hant') {languageTag='zh-hant';}
	
        $("#box3 option:gt(0)").remove();
	if (isoLanguage=='en') {$("#box3 option").text("All");}
	if (isoLanguage=='zh-hans') {$("#box3 option").text("全部");}
	if (isoLanguage=='zh-hant') {$("#box3 option").text("全部");}

	for (i=0;i<dynastiesURI.length;i++)
	    {
	    if (isoLanguage=='en') {
	    	labelValue=dynastiesEn[i];
	    	}
	    if (isoLanguage=='zh-hans') {labelValue=dynastiesZhHans[i];}
	    if (isoLanguage=='zh-hant') {labelValue=dynastiesZhHant[i];}
	    bindingValue=dynastiesURI[i];
	    $("#box3").append("<option value='"+bindingValue+"'>"+labelValue+'</option>');
            }
 	}

function setSiteOptions(provinceSelection,dynastySelection,isoLanguage) {
	if (isoLanguage=='en') {languageTag='en';}
	if (isoLanguage=='zh-hans') {languageTag='zh-hans';}
	if (isoLanguage=='zh-hant') {languageTag='zh-hant';}

	// start the site dropdown over with "All/全部" as the first option
	$("#box2 option:gt(0)").remove();
	if (isoLanguage=='en') {$("#box2 option").text("All");}
	if (isoLanguage=='zh-hans') {$("#box2 option").text("全部");}
	if (isoLanguage=='zh-hant') {$("#box2 option").text("全部");}

	// create URI-encoded query string
	var string = "PREFIX time: <http://www.w3.org/2006/time#>"
		    +'SELECT DISTINCT ?siteName WHERE {'
                    +'?site <http://www.geonames.org/ontology#featureCode> <http://www.geonames.org/ontology#S.ANS>.'
        if (provinceSelection != '?province') 
        	{
	        string = string + '?site <http://rs.tdwg.org/dwc/terms/stateProvince> ?provinceTagged.'
	            +'BIND (str(?provinceTagged) AS ?province)'
	            +'FILTER (?province =  '+provinceSelection+')'
	        }
	if (dynastySelection != '?dynasty')
		{
	        string = string +'?site <http://purl.org/dc/terms/temporal> ?interval.'
                    +'?interval time:intervalStartedBy ?startDynasty.'
                    +'?interval time:intervalFinishedBy ?endDynasty.'
                    // target dynasty must be earlier than ?endDynasty
                    +'?endDynasty time:intervalMetBy* '+dynastySelection+'.'
                    //target dynasty must be later than ?startDynasty
                    +dynastySelection+' time:intervalMetBy* ?startDynasty.'

                    // +'?interval <http://www.w3.org/2000/01/rdf-schema#label> ?periodTagged.'
	           // +'BIND (str(?periodTagged) AS ?period)'
	           // +'FILTER (?period =  '+dynastySelection+')'
	        }
                string = string +'?site <http://www.w3.org/2000/01/rdf-schema#label> ?siteTagged.'
                    +"FILTER (lang(?siteTagged)='"+languageTag+"')"
	            +'BIND (str(?siteTagged) AS ?siteName)'
	            +'}'
                +'ORDER BY ASC(?siteName)';

                var encodedQuery = encodeURIComponent(string);
        // send query to endpoint
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encodedQuery,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
            success: parseSiteXml
        });

	}
/*
function setCategoryOptions() {
	// create URI-encoded query string
        var string = "PREFIX Iptc4xmpExt: <http://iptc.org/std/Iptc4xmpExt/2008-02-29/>"+
                    "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>"+
                    'SELECT DISTINCT ?category WHERE {' +
                    "?image Iptc4xmpExt:CVterm ?view." +
                    "?view skos:broader ?featureCategory." +
                    "?featureCategory skos:prefLabel ?category." +
                    '}'
                    +'ORDER BY ASC(?category)';
	var encodedQuery = encodeURIComponent(string);

        // send query to endpoint
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encodedQuery,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
            success: parseCategoryXml
        });

	}
*/
function parseProvinceXml(xml) {
    // done searching, so hide the spinner icon
    $('#searchSpinner').hide();
    //step through each "result" element
    $(xml).find("result").each(function() {

        // pull the "binding" element that has the name attribute of "province"
        $(this).find("binding[name='province']").each(function() {
            bindingValue=$(this).find("literal").text();
            quoteBindingValue='"'+bindingValue+'"';
            $("#box1").append("<option value='"+quoteBindingValue+"'>"+bindingValue+'</option>');
        });
    });
}

function parseSiteXml(xml) {
    // done searching, so hide the spinner icon
    $('#searchSpinner').hide();
    //step through each "result" element
    $(xml).find("result").each(function() {

        // pull the "binding" element that has the name attribute of "siteName"
        $(this).find("binding[name='siteName']").each(function() {
            bindingValue=$(this).find("literal").text();
            quoteBindingValue='"'+bindingValue+'"';
            $("#box2").append("<option value='"+quoteBindingValue+"'>"+bindingValue+'</option>');
        });
    });
}
/*
function parseCategoryXml(xml) {
    // done searching, so hide the spinner icon
    $('#searchSpinner').hide();
    //step through each "result" element
    $(xml).find("result").each(function() {

        // pull the "binding" element that has the name attribute of "category"
        $(this).find("binding[name='category']").each(function() {
            bindingValue=$(this).find("literal").text();
            quoteBindingValue='"'+bindingValue+'"';
            $("#box4").append("<option value='"+quoteBindingValue+"'>"+bindingValue+'</option>');
        });
    });
}
*/

function getImages(buildingURI,tableRow) {

	// create URI-encoded query string
        var string = 'PREFIX ac: <http://rs.tdwg.org/ac/terms/>'
                    +'PREFIX foaf: <http://xmlns.com/foaf/0.1/>'
                    +'SELECT DISTINCT ?thumbURL ?gqURL WHERE {'
                    +"?image foaf:depicts <"+buildingURI+">."
                    +'?image ac:hasServiceAccessPoint ?thumbSap.'
                    +'?thumbSap ac:variant ac:Thumbnail.'
                    +'?thumbSap ac:accessURI ?thumbURL.'
                    +'?image ac:hasServiceAccessPoint ?gqSap.'
                    +'?gqSap ac:variant ac:GoodQuality.'
                    +'?gqSap ac:accessURI ?gqURL.'
                    +'}';
	var encodedQuery = encodeURIComponent(string);
        // send query to endpoint
        $.ajax({
            type: 'GET',
            url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encodedQuery,
            headers: {
                Accept: 'application/sparql-results+xml'
            },
//            success: parseImageXml
        })
        .done(function(xml){
	    //step through each "result" element
	    $(xml).find("result").each(function() {
	
		// pull the "binding" element that has the name attribute of "gqURL"
		$(this).find("binding[name='gqURL']").each(function() {
		    tableRow=tableRow+"<a target='_blank' href='"+$(this).find("uri").text() + "'>";
		});
	
		// pull the "binding" element that has the name attribute of "thumbURL"
		$(this).find("binding[name='thumbURL']").each(function() {
		    tableRow=tableRow+"<img src='"+$(this).find("uri").text() + "'></a> ";
		});     
	    });
	tableRow=tableRow+"<br/><br/></div>"
	$("#div1").append(tableRow);
	});
        
}


$(document).ready(function(){
		
	// not searching initially, so hide the spinner icon
	$('#searchSpinner').hide();
    
	// fires when there is a change in the language dropdown
	$("#box0").change(function(){
			// searching, so show the spinner icon
			$('#searchSpinner').show();
			var isoLanguage= $("#box0").val();
			if (isoLanguage=='en') {
			$("#boxLabel0").text("Language");
			$("#boxLabel1").text("Province");
			$("#boxLabel3").text("Dynasty range for site");
			$("#boxLabel2").text("Historic Site");
			$("#searchButton").text("Search");
			}
			if (isoLanguage=='zh-hans') {
			$("#boxLabel0").text("语言");
			$("#boxLabel1").text("省");
			$("#boxLabel3").text("历代");
			$("#boxLabel2").text("名胜");
			$("#searchButton").text("搜索");
			$("#resetButton").text("重启");
			}
			if (isoLanguage=='zh-hant') {
			$("#boxLabel0").text("語言");
			$("#boxLabel1").text("省");
			$("#boxLabel3").text("歷代");
			$("#boxLabel2").text("名勝");
			$("#searchButton").text("搜索");
			$("#resetButton").text("重啟");
			}
			setProvinceOptions(isoLanguage);
			setDynastyOptions(isoLanguage);
			var provinceSelection = $("#box1").val();
			var dynastySelection = $("#box3").val();
			setSiteOptions(provinceSelection,dynastySelection,isoLanguage);
	});

	// fires when there is a change in the province dropdown
	$("#box1").change(function(){
			// searching, so show the spinner icon
			$('#searchSpinner').show();
			var isoLanguage= $("#box0").val();
			var provinceSelection = $("#box1").val();
			var dynastySelection = $("#box3").val();
			setSiteOptions(provinceSelection,dynastySelection,isoLanguage);
	});

	// fires when there is a change in the dynasty dropdown
	$("#box3").change(function(){
			// searching, so show the spinner icon
			$('#searchSpinner').show();
			var isoLanguage= $("#box0").val();
			var provinceSelection = $("#box1").val();
			var dynastySelection = $("#box3").val();
			setSiteOptions(provinceSelection,dynastySelection,isoLanguage);
	});

	// Main routine: execute SPARQL queries to get values and add them to the select options
	setProvinceOptions(isoLanguage);
	setDynastyOptions(isoLanguage);
	var provinceSelection = $("#box1").val();
	var dynastySelection = $("#box3").val();
	setSiteOptions(provinceSelection,dynastySelection,isoLanguage);
//	setCategoryOptions();

	// creates a function that's executed when the button is clicked
	$("#resetButton").click(function(){
			isoLanguage= $("#box0").val();
			window.location.replace("building-map.html?"+isoLanguage);
	});
			
	// creates a function that's executed when the button is clicked
	$("#searchButton").click(function(){
			// remove any map markers that are already there (doesn't work)
			//var markers = L.markerClusterGroup()
			//markers.clearLayers();
			
			// searching, so show the spinner icon
			$('#searchSpinner').show();
		
			//pulls data from the input boxes
			var isoLanguage= $("#box0").val();
			if (isoLanguage=="en") {intervalLabelLan="en"} else {intervalLabelLan="zh-hans"};
			var provinceSelection = $('#box1').val();
			var siteSelection = $('#box2').val();
			var dynastySelection = $('#box3').val();
//			var category = $('#box4').val();
			// creates a string that contains the query with the data from the dropdowns
			// inserted into the right place.  The variable values are already enclosed in quotes as necessary.
			var query = "SELECT DISTINCT ?siteName ?siteNameLan ?siteInterval ?building ?bldgIntervalLabel ?buildingNameLan ?buildingNameLatn ?lat ?long  WHERE {" +
				    "?site <http://www.geonames.org/ontology#featureCode> <http://www.geonames.org/ontology#S.ANS>." +
				    "?site <http://www.w3.org/2000/01/rdf-schema#label> ?siteName.FILTER (lang(?siteName)='zh-latn-pinyin')" +
				    "?site <http://purl.org/dc/terms/temporal> ?interval." +
				    "OPTIONAL{?interval <http://www.w3.org/2000/01/rdf-schema#label> ?siteInterval.FILTER ( lang(?siteInterval)='"+intervalLabelLan+"')}" +
			            "OPTIONAL{?site <http://www.w3.org/2000/01/rdf-schema#label> ?siteNameLan.FILTER ( lang(?siteNameLan)='"+languageTag+"')}"

			if (siteSelection != '?site') 
				{
				if (isoLanguage=='en') {languageTag='en';}
				if (isoLanguage=='zh-hans') {languageTag='zh-hans';}
				if (isoLanguage=='zh-hant') {languageTag='zh-hant';}
				query = query + "?site <http://www.w3.org/2000/01/rdf-schema#label> " + siteSelection + "@"+ languageTag + "."
				}
		
			if (dynastySelection != '?dynasty')
				{
				query = query + 
				    '?interval time:intervalStartedBy ?startDynasty.'+
				    '?interval time:intervalFinishedBy ?endDynasty.'+
				    // target dynasty must be earlier than ?endDynasty
				    '?endDynasty time:intervalMetBy* '+dynastySelection+'.'+
				    //target dynasty must be later than ?startDynasty
				    dynastySelection+' time:intervalMetBy* ?startDynasty.'
				}
				
			if (provinceSelection != '?province') 
				{
				if (isoLanguage=='en') {languageTag='zh-latn-pinyin';}
				if (isoLanguage=='zh-hans') {languageTag='zh-hans';}
				if (isoLanguage=='zh-hant') {languageTag='zh-hant';}
				query = query + "?site <http://rs.tdwg.org/dwc/terms/stateProvince> " + provinceSelection + "@" + languageTag + "."
				}
		
			query = query + "?building <http://schema.org/containedInPlace> ?site." +
			    "?building <http://purl.org/dc/terms/temporal> ?bldgInterval." +
			    "OPTIONAL{?bldgInterval <http://www.w3.org/2000/01/rdf-schema#label> ?bldgIntervalLabel.}" +
			    "OPTIONAL{?building <http://www.w3.org/2000/01/rdf-schema#label> ?buildingNameLan.FILTER ( lang(?buildingNameLan)='"+languageTag+"')}" +
			    "OPTIONAL{?building <http://www.w3.org/2000/01/rdf-schema#label> ?buildingNameLatn.FILTER ( lang(?buildingNameLatn)='zh-latn-pinyin')}" +
			    "OPTIONAL{?building <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat.}" +
			    "OPTIONAL{?building <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?long.}" +
			    "}" +
			    "ORDER BY ASC(?buildingName)" +
			    "LIMIT " + numResultstoReturn;
	
			// URL-encodes the query so that it can be appended as a query value
			var encoded = encodeURIComponent(query)
		
			// does the AJAX to send the HTTP GET to the Callimachus SPARQL endpoint
			// then puts the result in the "data" variable
			$.ajax({
			    type: 'GET',
			    url: 'http://rdf.library.vanderbilt.edu/sparql?query=' + encoded,
			    headers: {
				Accept: 'application/sparql-results+xml'
			    },
			    success: parseXml
			});
		    });

});

// converts nodes of an XML object to text. See http://tech.pro/tutorial/877/xml-parsing-with-jquery
// and http://stackoverflow.com/questions/4191386/jquery-how-to-find-an-element-based-on-a-data-attribute-value
function parseXml(xml) {
    // done searching, so hide the spinner icon
    $('#searchSpinner').hide();

    // tell the user how many results we found
    var numResults = $(xml).find("result").length;
    if (numResults < 1) {
        $("#div2").html("<h4 class=\"text-warning\">No buildings found</h4>");
    }
    else {
        $("#div2").html("<h4 class=\"text-success\">Found "+numResults+" buildings</h4>");

        //step through each "result" element
        $(xml).find("result").each(function() {

            tableRow="<div>";
            
	isoLanguage= $("#box0").val();
	if (isoLanguage=='en') {
		siteLabel="Historic Site";
		buildingLabel="Historic Object";
		}
	if (isoLanguage=='zh-hans') {
		siteLabel="名胜 ";
		buildingLabel="文物";
		}
	if (isoLanguage=='zh-hant') {
		siteLabel="名勝";
		buildingLabel="文物";
		}
            
            // pull the "binding" element that has the name attribute of "siteName"
            $(this).find("binding[name='siteName']").each(function() {
            	siteName=$(this).find("literal").text();
                tableRow=tableRow+siteLabel+": <strong>"+ siteName + "</strong>";
            });

            // pull the "binding" element that has the name attribute of "siteNameLan"
            $(this).find("binding[name='siteNameLan']").each(function() {
            	siteNameLan=$(this).find("literal").text();
                tableRow=tableRow+" ("+ siteNameLan + ")";
            });

            // pull the "binding" element that has the name attribute of "siteInterval"
            $(this).find("binding[name='siteInterval']").each(function() {
            	siteInterval=$(this).find("literal").text();
                tableRow=tableRow+" "+ siteInterval;
            });

            // pull the "binding" element that has the name attribute of "buildingNameLatn"
            $(this).find("binding[name='buildingNameLatn']").each(function() {
                tableRow=tableRow+". "+buildingLabel+": <strong>"+$(this).find("literal").text()+"</strong>";
            });

            // pull the "binding" element that has the name attribute of "buildingNameLan"
            $(this).find("binding[name='buildingNameLan']").each(function() {
                tableRow=tableRow+" ("+$(this).find("literal").text() + ")";
            });
            
            // pull the "binding" element that has the name attribute of "bldgIntervalLabel"
            $(this).find("binding[name='bldgIntervalLabel']").each(function() {
                tableRow=tableRow+" "+$(this).find("literal").text() + ".";
            });
            
            latitude = "";

            // pull the "binding" element that has the name attribute of "lat"
            $(this).find("binding[name='lat']").each(function() {
               latitude=$(this).find("literal").text();
            });

            // pull the "binding" element that has the name attribute of "long"
            $(this).find("binding[name='long']").each(function() {
                longitude=$(this).find("literal").text();
            });
            tableRow = tableRow + '<br/>'
            if (latitude!="") {
		    tableRow = tableRow + '<a target="top" href="http://maps.google.com/maps?output=classic&amp;q=loc:'+ latitude + ',';
		    tableRow = tableRow + longitude +'&amp;t=h&amp;z=16">Open location in map application</a><br/>';
		    tableRow = tableRow + '<img src="http://maps.googleapis.com/maps/api/staticmap?center='+latitude+','+longitude+'&amp;zoom=11&amp;size=300x300&amp;markers=color:green%7C'+latitude+','+longitude+'&amp;sensor=false"/>'
		    tableRow = tableRow + '<img src="http://maps.googleapis.com/maps/api/staticmap?center='+latitude+','+longitude+'&amp;maptype=hybrid&amp;zoom=18&amp;size=300x300&amp;markers=color:green%7C'+latitude+','+longitude+'&amp;sensor=false"/><br/>'
		   

	    // add the latitude and longitude to the leaflet.js map
	    var marker = L.marker([latitude, longitude]).addTo(mymap);
	    marker.bindPopup(siteName)
		    }
		
	    // pull the "binding" element that has the name attribute of "building"
            $(this).find("binding[name='building']").each(function() {
                buildingURI=$(this).find("uri").text();
            });
            

            
            // the getBuildings function queries the endpoint for image tnumbnails and good quality accessURIs, then inserts the blob into the div
            getImages(buildingURI,tableRow);

        });


    }
}