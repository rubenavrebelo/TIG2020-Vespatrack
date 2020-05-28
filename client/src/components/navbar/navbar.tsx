import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  makeStyles,
  Drawer,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import AddViewing from "./add-edit/add-viewing";
import grey from "@material-ui/core/colors/grey";
import DetailView from "./detail-view";
import { SidebarMode } from "../../App";
import { Center } from "../google-maps/maps";

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
}));

export default function Navbar(props: Props) {
  const classes = useStyles();

  return (
    <div>
      <AppBar position="fixed" className={classes.navBar}>
        <Toolbar>
          <div style={{ textAlign: "left", marginTop: "auto" }}>
            <img
              src={"http://localhost:8080/images/vespatrack_logo.png"}
              style={{ width: 50, display: "inline-block" }}
              alt={"Vespatrack logo"}
            />
          </div>
          <div className={classes.title}>
            <Typography
              variant={"h4"}
              style={{ marginTop: "10px", marginLeft: "10px" }}
            >
              Vespatrack
            </Typography>
          </div>
          <IconButton
            edge="end"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
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
