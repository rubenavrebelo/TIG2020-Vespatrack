import * as React from "react";
import {
  Typography,
  MenuItem,
  Select,
  TextField,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
  },
  subject: {
    fontWeight: 500,
    color: "#E5A627",
  },
  idinput: { width: "15%" },
  idInputContainer: { display: "inline" },
  idInputTitle: { marginLeft: 5 }
}));
interface Props {
  setEditConfirmed: (confirmed: boolean) => void;
  setIsNest: (nest: string) => void;
  setNest: (nest?: number) => void;
  editedConfirmed: boolean;
  isNest: string;
  nest?: number;
}
export default function HornetEdit(props: Props) {
  const [numNests, setNum] = React.useState<number>(0);

  const classes = useStyles();

  const handleConfirmedChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    props.setEditConfirmed(event.target.value as boolean);
  };
  const handleNestChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    props.setIsNest(event.target.value as string);
  };

  const handleNestId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const number = parseInt(event.target.value);
    if (number <= numNests) props.setNest(number);
    else if (event.target.value === "") props.setNest(undefined);
  };

  const setNumCallback = React.useCallback((length) => setNum(length), [
    setNum,
  ]);

  React.useEffect(() => {
    fetch("https://vespatrack.herokuapp.com/ninhos")
      .then((res) => res.json())
      .then((result) => setNumCallback(result.length));
  }, [setNumCallback]);

  return (
    <div>
      {" "}
      <div>
        <Typography display="inline" className={classes.subject}>
          Confirmação Vespa Asiática?{" "}
        </Typography>
        <Select
          onChange={handleConfirmedChange}
          value={props.editedConfirmed.toString()}
        >
          <MenuItem value={"true"}>Sim</MenuItem>
          <MenuItem value={"false"}>Não</MenuItem>
        </Select>
      </div>
      <div>
        <Typography display="inline" className={classes.subject}>
          Ninho encontrado?{" "}
        </Typography>
        <Select onChange={handleNestChange} value={props.isNest}>
          {numNests > 0 && <MenuItem value={"true"}>Sim</MenuItem>}
          <MenuItem value={"false"}>Não</MenuItem>
        </Select>
        {props.isNest === "true" && numNests > 0 && (
          <div className={classes.idInputContainer}>
            <Typography className={classes.idInputTitle} display={"inline"}>
              ID:
            </Typography>
            <TextField
              onChange={handleNestId}
              value={props.nest}
              className={classes.idinput}
              type={"number"}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
