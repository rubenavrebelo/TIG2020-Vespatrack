import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/navbar/navbar";
import Maps, { Center } from "./components/google-maps/maps";
import { DataMarker, FilterObject } from "./types/types";
import FilterPaper from "./components/filter";
import LayersPaper from "./components/layers";
import Geocode from "react-geocode";

Geocode.setApiKey("AIzaSyDB274IridkTL6cMVfRD2OCnJDqPDMT7ME");
Geocode.setLanguage("pt-PT");
Geocode.setRegion("pt");

export type SidebarMode = "infoDetail" | "newMarker" | "infoMin";

function App() {
  const [sidebarOpen, setSidebar] = useState<boolean>(false);
  const [center, setCenter] = useState<Center>({ lat: -1, lng: -1 });
  const [local, setLocal] = React.useState("");
  const [searched, setSearched] = React.useState(false);
  const [mode, setMode] = React.useState<SidebarMode>("infoDetail");
  const [currentId, setCurrentId] = React.useState<number>(-1);
  const [markers, setMarkers] = React.useState<DataMarker[]>([]);
  const [query, setQuery] = React.useState<boolean>(false);
  const [filter, setFilter] = React.useState<boolean>(false);
  const [filterOptions, setFilterOptions] = React.useState<Object>({});
  const [years, setYears] = React.useState<Object>({});
  const [municipality, setMunicipality] = React.useState<Object>({});
  const [layers, setLayers] = React.useState({
    risk: false,
    exterminator: false,
  });
  const [allMunicip, setAllMunicip] = React.useState<any[]>([]);

  const addNewViewing = (type: string, localType: string, photo?: File) => {
    let data = new FormData();
    const viewing = {
      type,
      state: "Não Resolvido",
      local,
      date: new Date(),
      lat: center.lat,
      lng: center.lng,
      localType,
      municipality,
    };

    data.append("data", JSON.stringify(viewing));

    if (photo) data.append("photo", photo);

    const requestOptions = {
      method: "POST",
      body: data,
    };

    setCenter({ lat: 0, lng: 0 });
    setLocal("");
    setSearched(false);
    setSidebar(false);
    fetch("https://vespatrack.herokuapp.com/add", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setQuery(!query);
      });
  };

  const updatePhoto = (photo?: File) => {
    let data = new FormData();
    if (photo) {
      data.append("photo", photo);
    }

    const requestOptions = {
      method: "PUT",
      body: data,
    };

    fetch(
      `https://vespatrack.herokuapp.com/update_photo/${currentId}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        setQuery(!query);
      });
  };

  const postFilter = (data: FilterObject) => {
    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    };

    setFilterOptions(requestOptions);
    setFilter(true);
  };

  const handleInfoWClose = () => {
    setSearched(false);
    setCurrentId(-1);
    setSidebar(false);
  };

  const handleMapClick = (center: Center) => {
    setCenter(center);
    setSearched(true);
    setLocal("");
    setMode("newMarker");
    setSidebar(true);
    setCurrentId(-1);
  };

  const onMarkerClick = (id: number) => {
    setSearched(false);
    setLocal("");
    setMode("infoDetail");
    setCurrentId(id);
    if (!sidebarOpen) setSidebar(true);
  };

  const setCurrent = (lat?: number, lng?: number) => {
    if (lat && !lng) setCenter({ lat, lng: center.lng });
    if (!lat && lng) setCenter({ lat: center.lat, lng });
    if (lat && lng) setCenter({ lat, lng });
  };

  const getYears = () => {
    fetch("https://vespatrack.herokuapp.com/years")
      .then((resolve) => resolve.json())
      .then((result) => {
        {
          setYears(
            Object.keys(result)
              .map((key) => result[key].date_part)
              .reduce((ac: any, c: any) => {
                ac[c] = true;
                return ac;
              }, {})
          );
        }
      });
    setSearched(false);
  };

  const getMunicipalities = () => {
    fetch("https://vespatrack.herokuapp.com/concelhos.geojson")
      .then((res) => res.json())
      .then((result) => {
        const municips = result.features.map(
          (municip: any) => municip.properties.NAME_2
        );
        setAllMunicip(municips);
      });
  };

  React.useEffect(() => {
    getYears();
    if (allMunicip.length === 0) getMunicipalities();
    if (!filter) {
      fetch("https://vespatrack.herokuapp.com/avistamentos")
        .then((res) => res.json())
        .then((result) => setMarkers(result));
    } else {
      fetch("https://vespatrack.herokuapp.com/filter", filterOptions)
        .then((response) => response.json())
        .then((result) => setMarkers(result));
    }
  }, [query, filter, filterOptions]);

  return (
    <div className="App">
      {Object.keys(years).length !== 0 ? (
        <div>
          <Navbar
            setMunicipality={setMunicipality}
            updatePhoto={updatePhoto}
            updateCallback={setQuery}
            sidebarOpen={sidebarOpen}
            setCurrent={setCurrent}
            local={local}
            setLocal={setLocal}
            searched={searched}
            setSearched={setSearched}
            addViewing={addNewViewing}
            mode={mode}
            id={currentId}
            center={center}
            query={query}
            handleSidebarClose={handleInfoWClose}
            municipalities={allMunicip}
          />
          <FilterPaper years={years} setMarkers={postFilter} />
          <LayersPaper layers={layers} setLayer={setLayers} />
          <main>
            <Maps
              layers={layers}
              query={query}
              sidebarOpen={sidebarOpen}
              currentCenter={center}
              searched={searched}
              handleMapClick={handleMapClick}
              onMarkerClick={onMarkerClick}
              markers={markers}
              setMarkers={setMarkers}
              handleInfoWClose={handleInfoWClose}
            />
          </main>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default App;
