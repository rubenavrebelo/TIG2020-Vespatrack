import * as React from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Polygon,
  Circle,
} from "@react-google-maps/api";
import { Typography } from "@material-ui/core";
import { DataMarker, Exterminator } from "../../types/types";
import moment from "moment";

const googleMapsLibraries = ["geometry"];
interface Props {
  sidebarOpen: boolean;
  currentCenter: Center;
  searched: boolean;
  handleMapClick: (center: Center) => void;
  onMarkerClick: (id: number) => void;
  markers: DataMarker[];
  setMarkers: (markers: DataMarker[]) => void;
  handleInfoWClose: () => void;
  query: boolean;
  layers: any;
  fitBoundsMunicip: string;
}

interface MarkerRef {
  [id: number]: any;
}

const divStyle = {
  background: `white`,
  padding: 15,
};

const defaultMarker: DataMarker = {
  id: -1,
  type: "",
  state: "",
  local: "",
  date: "",
  lat: 0,
  lng: 0,
  localtype: "",
  specific_id: -1,
};

export interface Center {
  lat: number;
  lng: number;
}

const defaultCenter = {
  lat: 39.557191,
  lng: -7.8536599,
};

export default function Maps(props: Props) {
  const containerStyle = {
    width: props.sidebarOpen ? "75%" : "100%",
    height: "90vh",
  };

  const [currentMarker, setCurrentMarker] = React.useState<DataMarker>(
    defaultMarker
  );
  const [center, setCenter] = React.useState<Center>(defaultCenter);
  const [zoom, setZoom] = React.useState<number>(7);
  const [markerRefs, setMarkerRef] = React.useState<MarkerRef>({});
  const [risks, setRisks] = React.useState<any[]>([]);
  const [geoJSON, setgeoJSON] = React.useState<any>({});
  const [exterminators, setExterminators] = React.useState<Exterminator[]>([]);
  const [newMarker, setNewMarker] = React.useState<Center>({
    lat: -1,
    lng: -1,
  });
  const [mapRef, setMapRef] = React.useState<any>();

  const handleMarkerClick = (m: DataMarker) => {
    if (currentMarker.id !== -1) setCurrentMarker(defaultMarker);
    setCurrentMarker(m);
    const { lat, lng } = m;
    setCenter({ lat, lng });
    setZoom(14);
    setNewMarker({ lat: -1, lng: -1 });
    props.onMarkerClick(m.id);
  };

  const markerLoadHandler = (marker: any, place: DataMarker) => {
    return setMarkerRef((prevState: MarkerRef) => {
      return { ...prevState, [place.id]: marker };
    });
  };

  const createMarkers = () => {
    return props.markers.map((m: DataMarker) => {
      const type = m.type === "Vespa" ? "hornet" : "nest";
      const image =
        m.state === "Resolvido"
          ? `green${type}`
          : m.state === "Em Progresso"
          ? `orange${type}`
          : `red${type}`;
      return (
        <Marker
          key={m.id}
          onClick={() => handleMarkerClick(m)}
          onLoad={(marker) => markerLoadHandler(marker, m)}
          position={{ lat: m.lat, lng: m.lng }}
          icon={`https://vespatrack.herokuapp.com/images/${image}_32.png`}
        />
      );
    });
  };

  const handleInfoWindowClose = () => {
    setCurrentMarker(defaultMarker);
    props.handleInfoWClose();
  };

  const renderInfoW = (marker: DataMarker) => {
    return (
      <InfoWindow
        anchor={markerRefs[marker.id]}
        onCloseClick={handleInfoWindowClose}
        position={{ lat: marker.lat, lng: marker.lng }}
      >
        <div style={divStyle}>
          <div>
            <Typography
              variant={"h5"}
              style={{ display: "inline-block", marginRight: "20px" }}
            >
              {marker.type}
            </Typography>
            <Typography style={{ display: "inline-block" }}>
              ID: {marker.id}
            </Typography>
          </div>
          <Typography>Local: {marker.local}</Typography>
          <Typography>Estado: {marker.state}</Typography>
          <Typography>
            Data Submissão: {moment(marker.date).locale("pt").format("LL")}
          </Typography>
          {marker.photo !== null && (
            <img
              style={{ width: 150, margin: "0 auto", display: "block" }}
              alt={marker.type + marker.id}
              src={`https://storage.googleapis.com/tig2020-vespatrack/uploads/${marker.photo}`}
            />
          )}
          <Typography style={{ float: "right" }} variant={"caption"}>
            Informações Detalhadas >
          </Typography>
        </div>
      </InfoWindow>
    );
  };

  const onLoad = (map: any) => {
    setMapRef(map);
    map.addListener("zoom_changed", () => {
      setZoom(map.zoom);
    });
  };

  const loadGeoJson = () => {
    return geoJSON.features.map((concelho: any) => {
      let coordinates = concelho.geometry.coordinates[0];
      const coordArr: any = [];
      coordinates.map((coordinate: any) =>
        coordArr.push({ lat: coordinate[1], lng: coordinate[0] })
      );
      const risk = risks.filter(
        (municipality: any) =>
          municipality.municipality === concelho.properties.NAME_2
      );
      let color;
      let strokeColor;
      if (risk.length === 0) {
        color = "#73c16b";
        strokeColor = "#4b9b43";
      } else {
        const mode = risk[0].mode;
        if (mode === "Não Resolvido") {
          color = "#a51e1e";
          strokeColor = "#791818";
        } else if (mode === "Resolvido") {
          color = "#73c16b";
          strokeColor = "#4b9b43";
        } else {
          color = "#ebb74c";
          strokeColor = "#b5882b";
        }
      }
      return (
        <Polygon
          key={concelho.properties.NAME_2}
          path={coordArr}
          options={{
            fillColor: color,
            fillOpacity: 0.3,
            strokeColor: strokeColor,
            strokeOpacity: 1,
            strokeWeight: 1,
            clickable: false,
            draggable: false,
            editable: false,
            geodesic: false,
            zIndex: 1,
          }}
        ></Polygon>
      );
    });
  };

  const loadExterminatorLayer = () => {
    return exterminators.map((ext) => {
      const { lat, lng } = ext;
      return (
        <div>
          <Marker
            position={{ lat, lng }}
            icon={`https://vespatrack.herokuapp.com/images/exterminator.png`}
          />
          <Circle center={{ lat, lng }} radius={10000} />
        </div>
      );
    });
  };

  const handleMapClick = (event: any) => {
    const lat = Math.round(event.latLng.lat() * 1e6) / 1e6;
    const lng = Math.round(event.latLng.lng() * 1e6) / 1e6;
    const center = { lat, lng };
    props.handleMapClick(center);
    setCenter({ lat, lng });
    setNewMarker({ lat, lng });
    setZoom(14);
    setCurrentMarker(defaultMarker);
  };

  const initialLoad = () => {
    fetch("https://vespatrack.herokuapp.com/concelhos.geojson")
      .then((res) => res.json())
      .then((result) => setgeoJSON(result));
    fetch("https://vespatrack.herokuapp.com/municipalities_risk")
      .then((res) => res.json())
      .then((result) => {
        setRisks(result);
      });
    fetch("https://vespatrack.herokuapp.com/exterminadores")
      .then((res) => res.json())
      .then((result) => setExterminators(result));
  };

  const markerCallback = React.useCallback(() => {
    setNewMarker({
      lat: props.currentCenter.lat,
      lng: props.currentCenter.lng,
    });
    setCenter({ lat: props.currentCenter.lat, lng: props.currentCenter.lng });
    setZoom(14);
  }, [props.currentCenter.lat, props.currentCenter.lng]);

  React.useEffect(() => {
    if (props.markers.length > 0) initialLoad();
    if (props.fitBoundsMunicip !== "")
      mapRef.fitBounds(
        geoJSON.features.filter(
          (municipality: any) =>
            props.fitBoundsMunicip === municipality.properties.NAME_2
        ).coordinates[0][0]
      );
    if (props.searched) {
      markerCallback();
    } else {
      const current = currentMarker;
      const marker = props.markers.find((marker) => marker.id === current.id);
      marker && setCurrentMarker(marker ? marker : current);
    }
  }, [markerCallback, props, currentMarker, props.fitBoundsMunicip]);

  return (
    <div style={{ marginTop: "10vh" }}>
      <LoadScript
        libraries={googleMapsLibraries}
        googleMapsApiKey="AIzaSyDB274IridkTL6cMVfRD2OCnJDqPDMT7ME"
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          onClick={handleMapClick}
          onLoad={(map) => onLoad(map)}
          zoom={zoom}
          options={{
            mapTypeControl: false,
          }}
        >
          {createMarkers()}
          {currentMarker.id !== -1 && renderInfoW(currentMarker)}
          {props.searched && <Marker position={newMarker} />}
          {props.layers.risk && loadGeoJson()}
          {props.layers.exterminator && loadExterminatorLayer()}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
