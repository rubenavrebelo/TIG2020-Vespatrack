import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import moment from "moment";

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
  colony: boolean;
  destroyed: boolean;
  destruction_date?: Date;
}

export default function NestCard(props: Props) {
  const classes = useStyles();

  return (
    <div>
      <div>
        <Typography display="inline" className={classes.subject}>
          Com colónia?{" "}
        </Typography>
        <Typography display="inline">{props.colony ? "Sim" : "Não"}</Typography>
      </div>
      <div>
        <Typography display="inline" className={classes.subject}>
          Ninho destruído?{" "}
        </Typography>
        <Typography display="inline">
          {props.destroyed ? `Sim` : "Não"}
        </Typography>
      </div>
      {props.destroyed && (
        <div>
          <Typography display="inline" className={classes.subject}>
            Data destruição{" "}
          </Typography>
          <Typography display="inline">
            {moment(props.destruction_date).locale("pt").format("LL")}
          </Typography>
        </div>
      )}
    </div>
  );
}
