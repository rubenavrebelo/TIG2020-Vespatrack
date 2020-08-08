import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import grey from "@material-ui/core/colors/grey";
import SearchButton from "@material-ui/icons/Search";
import * as React from "react";
import Geocode from "react-geocode";
import { Center } from "../../google-maps/maps";
import { LocalTypes } from "../../../types/types";
import PhotoInput from "./photo-input";

interface Props {
  center: Center;
  local: string;
  setLocal: (address: string) => void;
  setSearched: (searched: boolean) => void;
  setCurrent: (lat?: number, lng?: number) => void;
  searched: boolean;
  addViewing: (type: string, localType: string, photo?: File) => void;
  setMunicipality: (municipality: string) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  paper: {
    marginTop: 20,
    padding: 15,
    textAlign: "left",
  },
  latLngTxtField: {
    width: "35%",
    marginRight: "15px",
  },
  paperTitle: {
    marginBottom: "10px",
  },
  firstPaper: {
    padding: 15,
    textAlign: "left",
  },
  addButton: { marginTop: "10px", marginBottom: "10px" },
  optional: { marginBottom: "10px", color: grey[400] },
  addressInput: { width: "80%" },
  viewingType: { width: "70%", marginBottom: "15px" },
  localType: { width: "70%" },
  addButtonContainer: { textAlign: "center" },
}));

export default function AddViewing(props: Props) {
  const [localtype, setLocalType] = React.useState("");
  const [viewType, setViewType] = React.useState("");
  const [selectedPhoto, setSelectedPhoto] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | undefined>("");
  const [currentLocal, setCurrentLocal] = React.useState<string>(props.local);

  const classes = useStyles();

  const streetOnChange = (address: string) => {
    Geocode.fromAddress(address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        props.setCurrent(lat, lng);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const geocodeCoords = React.useCallback(() => {
    const { lat, lng } = props.center;
    Geocode.fromLatLng(lat.toString(), lng.toString()).then(
      (response) => {
        const address = response.results[0].formatted_address;
        props.setMunicipality(
          response.results.filter((json: any) =>
            json.types.includes("administrative_area_level_2")
          )[0].address_components[0].long_name
        );
        setCurrentLocal(address);
        props.setLocal(address);
      },
      (error) => {
        props.setLocal("");
      }
    );
  }, [props.center]);

  const handleLatChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { setCurrent } = props;
    setCurrent(parseInt(event.target.value), undefined);
  };

  const handleLngChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { setCurrent } = props;
    if (props.searched) props.setSearched(false);
    setCurrent(undefined, parseInt(event.target.value));
  };

  const handleSearch = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { setSearched } = props;
    if (props.searched) props.setSearched(false);
    setSearched(true);
    streetOnChange(currentLocal);
  };

  const handleLocalTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setLocalType(event.target.value as string);
  };

  const handleViewTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setViewType(event.target.value as string);
  };

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedPhoto(null);
      return;
    }

    setSelectedPhoto(e.target.files[0]);
    e.target.value = "";
  };

  const onAddButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    selectedPhoto != null
      ? props.addViewing(viewType, localtype, selectedPhoto)
      : props.addViewing(viewType, localtype);
    setSelectedPhoto(null);
    setViewType("");
    setLocalType("");
  };

  const setPreviewCallback = React.useCallback(
    (image) => setPreview(image),
    []
  );

  React.useEffect(() => {
    const { lat, lng } = props.center;
    if (lat !== 0 && lng !== 0) geocodeCoords();
    if (!selectedPhoto) {
      setPreviewCallback(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhoto);
    setPreviewCallback(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [
    selectedPhoto,
    props.searched,
    geocodeCoords,
    props.center,
    props.local,
    setPreviewCallback,
  ]);

  return (
    <div>
      <Paper className={classes.firstPaper} elevation={0}>
        <Typography variant={"h6"} className={classes.paperTitle}>
          Informação Geográfica
        </Typography>
        <TextField
          className={classes.latLngTxtField}
          label={"Latitude"}
          type={"number"}
          value={props.center.lat}
          onChange={handleLatChange}
        />
        <TextField
          className={classes.latLngTxtField}
          label={"Longitude"}
          type={"number"}
          onChange={handleLngChange}
          value={props.center.lng}
        />

        <TextField
          label={"Morada"}
          onChange={(e) => setCurrentLocal(e.target.value)}
          value={currentLocal}
          multiline
          className={classes.addressInput}
        />
        <IconButton onClick={handleSearch}>
          <SearchButton />
        </IconButton>
      </Paper>
      <Paper className={classes.paper} elevation={0}>
        <Typography variant={"h6"} className={classes.paperTitle}>
          Informação Avistamento
        </Typography>
        <FormControl className={classes.viewingType}>
          <InputLabel>Tipo de Avistamento</InputLabel>
          <Select value={viewType} onChange={handleViewTypeChange}>
            <MenuItem value={"Vespa"}>Vespa</MenuItem>
            <MenuItem value={"Ninho"}>Ninho</MenuItem>
          </Select>
        </FormControl>

        <FormControl className={classes.localType}>
          <InputLabel>Tipo de Local</InputLabel>
          <Select value={localtype} onChange={handleLocalTypeChange} fullWidth>
            {LocalTypes.map((localtype) => (
              <MenuItem value={localtype}>{localtype}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper className={classes.paper} elevation={0}>
        <Typography variant={"h6"} className={classes.paperTitle}>
          Fotografia*
        </Typography>
        <PhotoInput
          preview={preview}
          setPreview={setPreview}
          onImageUpload={onImageUpload}
        />
        <Typography variant={"caption"} className={classes.optional}>
          *opcional
        </Typography>
      </Paper>
      <div className={classes.addButtonContainer}>
        <Button
          onClick={onAddButtonClick}
          variant={"outlined"}
          className={classes.addButton}
          disabled={localtype === "" || viewType === "" || props.local === ""}
        >
          Adicionar Avistamento
        </Button>
      </div>
    </div>
  );
}
