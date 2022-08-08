var drawingManager;
var selectedShape;

var selectedColor;
var all_overlays = []
const area = [];
const names = [];

function initMap()
{
    // creation of map
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 21.1458, lng: 79.0882 },
        zoom: 9,
    });

    //START- adding search place & autocomplete functionality
    const input = document.getElementById("pac-input");
    const options = {
        fields: ["formatted_address", "geometry", "name"],
        strictBounds: false,
        types: ["establishment"],
    };

    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.bindTo("bounds", map);

    const infowindow = new google.maps.InfoWindow();
    const infowindowContent = document.getElementById("infowindow-content");

    infowindow.setContent(infowindowContent);

    const marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
    });

    autocomplete.addListener("place_changed", () =>
    {
        infowindow.close();
        marker.setVisible(false);

        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {

            window.alert("No details available for input: '" + place.name + "'");
            return;
        }


        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        infowindowContent.children["place-name"].textContent = place.name;
        infowindowContent.children["place-address"].textContent =
            place.formatted_address;
        infowindow.open(map, marker);
    });

    document.getElementById("pac-input").value = ""
    //END- adding search place & autocomplete functionality

    //   Drawing manager library to draw polygons adding them in our application
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYLINE,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                // google.maps.drawing.OverlayType.MARKER,
                // google.maps.drawing.OverlayType.CIRCLE,
                // google.maps.drawing.OverlayType.POLYGON,
                google.maps.drawing.OverlayType.POLYLINE,
                // google.maps.drawing.OverlayType.RECTANGLE,
            ],
        },
        markerOptions: {
            icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
        },
        circleOptions: {
            fillColor: "#ffff00",
            fillOpacity: 1,
            strokeWeight: 5,
            clickable: false,
            editable: true,
            zIndex: 1,
        },
    });
    drawingManager.setMap(map);


    // Remove The shape of polygon we draw
    function clearSelection()
    {
        if (selectedShape) {
            selectedShape.setEditable(false);
            selectedShape = null;
        }
    }

    function setSelection(shape)
    {
        clearSelection();
        selectedShape = shape;
        shape.setEditable(true);
    }

    function deleteSelectedShape()
    {
        const shape = google.maps.geometry.spherical.computeArea(selectedShape.getPath())
        if (selectedShape) {
            for (let i = 0; i < area.length; i++) {

                if (area[i].areainSqMtr.toFixed(2) == shape.toFixed(2)) {
                    area.splice(i, 1);

                }
            }
            selectedShape.setMap(null);
            document.getElementById('data1').innerHTML =
                area.map((user) =>
                {
                    return [
                        `<div>
    <div> name:${user.name}</div>
    <div>Area in sq mtr:${user.areainSqMtr.toFixed(2)}</div>
    <div>Area in sq ft:${user.areainSqFt.toFixed(2)}<div>
    </div>
    `]

                })
        }
    }

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e)
    {
        all_overlays.push(e);

        if (e.type != google.maps.drawing.OverlayType.MARKER) {

            drawingManager.setDrawingMode(null);
            var newShape = e.overlay;
            newShape.type = e.type;
            google.maps.event.addListener(newShape, 'click', function ()
            {
                console.log("1")
                setSelection(newShape);
            });
            console.log("2..")
            setSelection(newShape);
        }
    });

    google.maps.event.addDomListener(document.getElementById('button'), 'click', deleteSelectedShape);

    // Area calculation of polygon
    google.maps.event.addListener(drawingManager, 'polylinecomplete', function (e)
    {
        var x = e.getPath().getArray();
        let y = []
        x.filter((ele, index, arr) =>
        {
            if (arr.indexOf(ele) == index) {
                var lat = ele.lat().toString();
                var lng = ele.lng().toString();
                var x = {
                    lat: lat,
                    lng: lng
                }
                y.push(x);
            }
        })
        var pathLeft = [];
        for (let i = 0; i < y.length; i++) {
            pathLeft[i] = new google.maps.LatLng(y[i].lat, y[i].lng)
        }

        const polygonLeft = new google.maps.Polygon({
            path: pathLeft,

        })
        const name = prompt('Please Enter building/solar panel name');
        // names.push(name);

        // console.log(names);

        var areaInSqMtr = google.maps.geometry.spherical.computeArea(polygonLeft.getPath())
        var areaInSqFt = areaInSqMtr * 10.764

        const obj = {
            areainSqMtr: areaInSqMtr,
            areainSqFt: areaInSqFt,
            name: name,
            LatLng: y

        }
        console.log("name", name)
        if (obj.areainSqMtr != 0 && name.length > 0) {
            area.push(obj)
        }
        // console.log("area", area);

        if (area.length == 2) {

            alert("The Area of" + " " + area[area.length - 2].name + " " + "is :" + area[area.length - 2].areainSqMtr.toFixed(2) + " " + "In Square Meters" + "\n " + "The Area of" + " " + area[area.length - 1].name + " " + "is :" + " " + area[area.length - 1].areainSqMtr.toFixed(2) + " " + "In Square Meters");
        }
        else if (area.length > 2 && area.length % 2 == 0) {




            alert("The Area of" + " " + area[area.length - 2].name + " " + "is :" + area[area.length - 2].areainSqMtr.toFixed(2) + " " + "In Square Meters" + "\n " + "The Area of" + " " + area[area.length - 1].name + " " + " is :" + "  " + area[area.length - 1].areainSqMtr.toFixed(2) + " " + "In Square Meters");



        }
        document.getElementById('data1').innerHTML =
            area.map((user) =>
            {
                return [
                    `<div>
    <div> name:${user.name}</div>
    <div>Area in sq mtr:${user.areainSqMtr.toFixed(2)}</div>
    <div>Area in sq ft:${user.areainSqFt.toFixed(2)}<div>
    </div>
    `]

            })


        // alert('The Area of Seelected Region:' + areaLeft + 'in sqmeters')

        // alert('Area of selected portion is in: \n' + parseFloat(areaInSqMtr).toFixed(2) + ' sq.m \n' + parseFloat(areaInSqMtr * 10.764).toFixed(2) + ' sq.ft  ')


    });



}



window.initMap = initMap;
