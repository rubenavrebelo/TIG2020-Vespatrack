import * as React from "react";
import {
  makeStyles,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: 2,
    position: "absolute",
    width: "15%",
    marginBottom: "3%",
    marginLeft: "10px",
    textAlign: "left",
    bottom: 0,
  },
  header: {
    marginLeft: 15,
  },
  selects: {
    paddingLeft: 15,
    paddingRight: 15,
  },
}));

export interface Props {
  setLayer: (layers: any) => void;
  layers: any;
}
export default function LayersPaper(props: Props) {
  const classes = useStyles();

  return (
    <Paper className={classes.root} elevation={0}>
      <Typography variant={"h6"} className={classes.header}>
        Camadas
      </Typography>
      <div className={classes.selects}>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            checked={props.layers.risk}
            onChange={(e) =>
              props.setLayer({ ...props.layers, risk: !props.layers.risk })
            }
            label={"Risco"}
          />
          <FormControlLabel
            control={<Checkbox />}
            checked={props.layers.exterminator}
            onChange={(e) =>
              props.setLayer({
                ...props.layers,
                exterminator: !props.layers.exterminator,
              })
            }
            label={"Exterminadores"}
          />
        </FormGroup>
      </div>
    </Paper>
  );
}
