import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  makeStyles,
  Drawer,
  TextField,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";

import AddViewing from "./add-edit/add-viewing";
import grey from "@material-ui/core/colors/grey";
import DetailView from "./detail-view";
import { SidebarMode } from "../../App";
import { Center } from "../google-maps/maps";
import Autocomplete from "@material-ui/lab/Autocomplete";

interface Props {
  sidebarOpen: boolean;
  center: Center;
  setCurrent: (lat?: number, lng?: number) => void;
  local: string;
  setLocal: (address: string) => void;
  searched: boolean;
  setSearched: (searched: boolean) => void;
  addViewing: (type: string, localType: string, photo?: File) => void;
  mode: SidebarMode;
  id: number;
  updateCallback: (query: boolean) => void;
  query: boolean;
  updatePhoto: (photo?: File) => void;
  setMunicipality: (municipality: string) => void;
  handleSidebarClose: (sibear: boolean) => void;
  municipalities: any[];
  setFBMunicip: (municip: string) => void;
}

const drawerWidth = "25%";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  navBar: {
    backgroundColor: "#e5a627",
    zIndex: theme.zIndex.drawer + 1,
    height: "10vh",
  },
  title: {
    flexGrow: 1,
    textAlign: "left",
    margin: "0 auto",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    textAlign: "left",
  },
  drawerPaper: {
    marginTop: "5%",
    width: drawerWidth,
    backgroundColor: grey[100],
    height: "90%",
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  logoContainer: { textAlign: "left", marginTop: "auto" },
  logo: { width: 50, display: "inline-block" },
  header: { marginTop: "10px", marginLeft: "10px" },
  fullExtent: { marginTop: 9, width: 300 },
  backButton: { marginTop: 5 },
}));

export default function Navbar(props: Props) {
  const [value, setValue] = React.useState<string | null>(
    props.municipalities[0]
  );
  const [inputValue, setInputValue] = React.useState("");
  const [enablePanTo, setPanTo] = React.useState<boolean>(false);

  const classes = useStyles();

  return (
    <div>
      <AppBar position="fixed" className={classes.navBar}>
        <Toolbar>
          <div className={classes.logoContainer}>
            <img
              src={
                "https://vespatrack.herokuapp.com/images/vespatrack_logo.png"
              }
              className={classes.logo}
              alt={"Vespatrack logo"}
            />
          </div>
          <div className={classes.title}>
            <Typography variant={"h4"} className={classes.header}>
              Vespatrack
            </Typography>
          </div>
          {enablePanTo && (
            <Autocomplete
              className={classes.fullExtent}
              value={value}
              onChange={(event: any, newValue: string | null) => {
                setValue(newValue);
                props.setFBMunicip(newValue ? newValue : "");
                setPanTo(false);
              }}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              options={props.municipalities}
              getOptionLabel={(option: any) => option}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Zoom em Concelho"
                  variant="outlined"
                />
              )}
            />
          )}
          <IconButton
            edge="end"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={(e) => setPanTo(!enablePanTo)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        anchor="right"
        open={props.sidebarOpen}
        variant="persistent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerContainer}>
          <IconButton onClick={() => props.handleSidebarClose(false)}>
            <ArrowForwardIcon className={classes.backButton} />
          </IconButton>
          {props.mode === "infoDetail" ? (
            props.id !== -1 && (
              <DetailView
                updatePhoto={props.updatePhoto}
                query={props.query}
                updateCallback={props.updateCallback}
                id={props.id}
              />
            )
          ) : (
            <AddViewing {...props} setMunicipality={props.setMunicipality} />
          )}
        </div>
      </Drawer>
    </div>
  );
}
