import * as React from "react";
import {
  withStyles,
  makeStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Paper,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Types, ViewingStates, LocalTypes, FilterObject } from "../types/types";

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: 2,
    position: "absolute",
    width: "15%",
    marginTop: "2%",
    marginLeft: "10px",
    textAlign: "left",
  },
  filterText: {
    marginLeft: 15,
  },
}));

const CustomExpansionPanel = withStyles({
  root: {
    borderTop: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(ExpansionPanel);

interface Props {
  setMarkers: (data: FilterObject) => void;
  years: Object;
}

export default function FilterPaper(props: Props) {
  const [currentFilters, setFilters] = React.useState<FilterObject>({});
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [typeState, setTypeState] = React.useState({
    hornet: true,
    nest: true,
  });
  const [state, setState] = React.useState({
    solved: true,
    progress: true,
    notsolved: true,
  });
  const [localType, setLocalType] = React.useState({
    residencial: true,
    rural: true,
    industrial: true,
    comercial: true,
  });
  const [years, setYears] = React.useState(props.years);

  const classes = useStyles();

  React.useEffect(() => {
    fetchRequest();
  }, [state, localType, typeState, years]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => (
    type: string
  ) => {
    if (type === "type") {
      const type = {
        ...typeState,
        [event.target.value]: !(typeState as any)[event.target.value],
      };
      setTypeState(type);
    } else if (type === "typelocal") {
      const localtype = {
        ...localType,
        [event.target.value]: !(localType as any)[event.target.value],
      };
      setLocalType(localtype);
    } else if (type === "state") {
      const newSet = {
        ...state,
        [event.target.value]: !(state as any)[event.target.value],
      };
      setState(newSet);
    } else if (type === "year") {
      const newYears = {
        ...years,
        [event.target.value]: !(years as any)[event.target.value],
      };
      setYears(newYears);
    }
  };

  const fetchRequest = () => {
    let data: FilterObject = currentFilters;
    data = {
      ...data,
      localtype: Object.keys(localType)
        .filter((key) => (localType as any)[key] === true)
        .map((key) => key.charAt(0).toUpperCase() + key.slice(1)),
    };
    data = {
      ...data,
      state: Object.keys(state)
        .filter((key) => (state as any)[key] === true)
        .map((value) =>
          value === "solved"
            ? "Resolvido"
            : value === "notsolved"
            ? "Não Resolvido"
            : "Em Progresso"
        ),
    };
    data = {
      ...data,
      type: Object.keys(typeState)
        .filter((key) => (typeState as any)[key] === true)
        .map((key) => (key === "hornet" ? "Vespa" : "Ninho")),
    };
    data = {
      ...data,
      years: Object.keys(years).filter((key) => (years as any)[key] === true),
    };

    props.setMarkers(data);
    setFilters(data);
  };

  const handleChange = (panel: string) => (
    event: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  const FormGroups = (type: string) => {
    const values =
      type === "type" ? Types : type === "state" ? ViewingStates : LocalTypes;
    return (
      <FormGroup>
        {values.map((val) => {
          let checkVal;
          let value;
          if (type === "type") {
            checkVal = val === "Vespa" ? typeState.hornet : typeState.nest;
            value = val === "Vespa" ? "hornet" : "nest";
          }
          if (type === "state") {
            checkVal =
              val === "Não Resolvido"
                ? state.notsolved
                : val === "Resolvido"
                ? state.solved
                : state.progress;
            value =
              val === "Não Resolvido"
                ? "notsolved"
                : val === "Resolvido"
                ? "solved"
                : "progress";
          } else if (type === "typelocal") {
            checkVal = (localType as any)[val.toLowerCase()];
            value = val.toLowerCase();
          }

          return (
            <FormControlLabel
              label={val}
              control={
                <Checkbox
                  value={value}
                  checked={checkVal}
                  onChange={(e) => handleCheckboxChange(e)(type)}
                />
              }
            />
          );
        })}
      </FormGroup>
    );
  };

  const yearsCheckboxes = () => {
    return (
      <FormGroup>
        {Object.keys(years).map((year) => (
          <FormControlLabel
            label={year}
            control={
              <Checkbox
                value={year}
                checked={(years as any)[year]}
                onChange={(e) => handleCheckboxChange(e)("year")}
              />
            }
          />
        ))}
      </FormGroup>
    );
  };

  return (
    <Paper className={classes.root} elevation={0}>
      <Typography variant={"h6"} className={classes.filterText}>
        Filtrar
      </Typography>
      <CustomExpansionPanel
        expanded={expanded === "type"}
        onChange={handleChange("type")}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} id={"type"}>
          Por tipo
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>{FormGroups("type")}</ExpansionPanelDetails>
      </CustomExpansionPanel>
      <CustomExpansionPanel
        expanded={expanded === "state"}
        onChange={handleChange("state")}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} id={"state"}>
          Por estado
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>{FormGroups("state")}</ExpansionPanelDetails>
      </CustomExpansionPanel>
      <CustomExpansionPanel
        expanded={expanded === "typelocal"}
        onChange={handleChange("typelocal")}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} id={"typelocal"}>
          Por tipo de local
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>{FormGroups("typelocal")}</ExpansionPanelDetails>
      </CustomExpansionPanel>
      <CustomExpansionPanel
        expanded={expanded === "year"}
        onChange={handleChange("year")}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} id={"year"}>
          Por ano
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>{yearsCheckboxes()}</ExpansionPanelDetails>
      </CustomExpansionPanel>
    </Paper>
  );
}
