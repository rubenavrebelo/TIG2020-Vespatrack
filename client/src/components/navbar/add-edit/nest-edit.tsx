import * as React from "react";
import { Typography, MenuItem, Select, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
  },
  subject: {
    fontWeight: 500,
    color: "#E5A627",
  },
}));
interface Props {
  setColony: (hasColony: boolean) => void;
  colony: boolean;
  setDestroyed: (destroyed: boolean) => void;
  destroyed: boolean;
}

export default function NestEdit(props: Props) {
  const classes = useStyles();

  const handleColony = (event: React.ChangeEvent<{ value: unknown }>) => {
    props.setColony(event.target.value as boolean);
  };

  const handleDestroyedChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    props.setDestroyed(event.target.value as boolean);
  };

  return (
    <div>
      <div>
        <Typography display="inline" className={classes.subject}>
          Com colónia?{" "}
        </Typography>
        <Select onChange={handleColony} value={props.colony.toString()}>
          {" "}
          <MenuItem value={"true"}>Sim</MenuItem>
          <MenuItem value={"false"}>Não</MenuItem>
        </Select>
      </div>
      <div>
        <Typography display="inline" className={classes.subject}>
          Ninho destruído?{" "}
        </Typography>
        <Select
          onChange={handleDestroyedChange}
          value={props.destroyed.toString()}
        >
          {" "}
          <MenuItem value={"true"}>Sim</MenuItem>
          <MenuItem value={"false"}>Não</MenuItem>
        </Select>
      </div>
    </div>
  );
}
