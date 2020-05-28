import * as React from "react";
import { makeStyles, Select, Typography, MenuItem } from "@material-ui/core";
import { HornetDataJoin, NestDataJoin } from "../../../types/types";
import HornetEdit from "./hornet-edit";
import NestEdit from "./nest-edit";

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
  data: HornetDataJoin | NestDataJoin;
  setEditedLocalType: (local: string) => void;
  setNest: (id?: number) => void;
  setEditConfirmed: (confirmed: boolean) => void;
  nest?: number;
  editedLocalType: string;
  editedConfirmed: boolean;
  isNest: string;
  setIsNest: (value: string) => void;
  type: string;
  setColony: (hasColony: boolean) => void;
  colony: boolean;
  setDestroyed: (destroyed: boolean) => void;
  destroyed: boolean;
}

export default function EditViewing(props: Props) {
  const classes = useStyles();

  const handleLocalTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    props.setEditedLocalType(event.target.value as string);
  };

  return (
    <div className={classes.root}>
      <div>
        <Typography display="inline" className={classes.subject}>
          Tipo Local{" "}
        </Typography>
        <Select
          value={props.editedLocalType}
          onChange={handleLocalTypeChange}
          style={{ width: "60%" }}
        >
          <MenuItem value={"Residencial"}>Residencial</MenuItem>
          <MenuItem value={"Rural"}>Rural</MenuItem>
          <MenuItem value={"Industrial"}>Industrial</MenuItem>
          <MenuItem value={"Comercial"}>Comercial</MenuItem>
        </Select>
      </div>
      {props.type === "Vespa" ? (
        <HornetEdit
          setEditConfirmed={props.setEditConfirmed}
          setIsNest={props.setIsNest}
          setNest={props.setNest}
          editedConfirmed={props.editedConfirmed}
          isNest={props.isNest}
          nest={props.nest}
        />
      ) : (
        <NestEdit
          setColony={props.setColony}
          setDestroyed={props.setDestroyed}
          colony={props.colony}
          destroyed={props.destroyed}
        />
      )}
    </div>
  );
}
