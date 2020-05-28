import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  paper: {
    marginTop: 20,
    padding: 15,
    textAlign: "left",
  },
  paperTitle: {
    marginBottom: "10px",
  },
  subject: {
    fontWeight: 500,
    color: "#E5A627",
  },
}));

export interface Props {
  confirmed_asian: boolean;
  nest?: number;
}

export default function HornetCard(props: Props) {
  const classes = useStyles();

  return (
    <div>
      <div>
        <Typography display="inline" className={classes.subject}>
          Confirmação Vespa Asiática?{" "}
        </Typography>
        <Typography display="inline">
          {props.confirmed_asian ? "Sim" : "Não"}
        </Typography>
      </div>
      <div>
        <Typography display="inline" className={classes.subject}>
          Ninho encontrado?{" "}
        </Typography>
        <Typography display="inline">
          {props.nest ? `Sim: ID ${props.nest}` : "Não"}
        </Typography>
      </div>
    </div>
  );
}
