import * as React from "react";
import {
  makeStyles,
  Stepper,
  Step,
  StepContent,
  StepLabel,
  Avatar,
  StepButton,
  Select,
  IconButton,
  MenuItem,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/AddCircleOutline";
import CancelIcon from "@material-ui/icons/Close";

import { HornetStates, NestStates } from "../../types/types";

const useStyles = makeStyles((theme) => ({
  root: {},
  stepper: {
    flexDirection: "column-reverse",
  },
  img: {
    width: "auto",
    height: "auto",
  },
}));

interface Props {
  specific_id?: number;
  states: string[];
  currentState: string;
  type: string;
  callbackRender: (query: boolean) => void;
  id: number;
  query: boolean;
}

export default function Progression(props: Props) {
  const [addMode, setAddMode] = React.useState<boolean>(false);
  const classes = useStyles();

  React.useEffect(() => {}, [addMode]);

  const onEnableAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddMode(!addMode);
  };

  const CustomStepIcon = (props: { color: string }) => (
    <Avatar
      style={{ backgroundColor: props.color, width: 24, height: 24 }}
      classes={{ img: classes.img }}
      src={"https://vespatrack.herokuapp.com/images/step_hornet.png"}
    />
  );

  const renderMenuItems = (type: string) => {
    const state = type === "Vespa" ? HornetStates : NestStates;

    return state
      .filter(
        (el: any) => !props.states.includes(el) && el !== props.currentState
      )
      .map((state: any) => <MenuItem value={state}>{state}</MenuItem>);
  };

  const onStateSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    let data;

    if (
      (event.target.value as string).toLowerCase().includes("resolvido") &&
      props.id
    )
      data = {
        past_state: props.currentState,
        new_state: event.target.value as string,
        id: props.id,
        viewing_state: "Resolvido",
      };
    else
      data = {
        past_state: props.currentState,
        new_state: event.target.value as string,
        id: props.id,
        viewing_state: "Em Progresso",
      };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    if (props.specific_id) {
      fetch(
        `https://vespatrack.herokuapp.com/update_state/${props.type.toLowerCase()}s/${
          props.specific_id
        }`,
        requestOptions
      ).then((response) => props.callbackRender(!props.query));
    }
    setAddMode(false);
  };

  const colorPick = (step: string) => {
    let color;
    const stepLower = step.toLowerCase();
    color = stepLower.includes("não verificad")
      ? "#a51e1e"
      : stepLower.includes("resolvido")
      ? "#73c16b"
      : "#ebb74c";
    return color;
  };

  return (
    <div className={classes.root}>
      <Stepper
        activeStep={props.states.length + 1}
        className={classes.stepper}
        orientation="vertical"
      >
        {props.states.map((step, i) => (
          <Step key={i}>
            <StepLabel icon={<CustomStepIcon color={colorPick(step)} />}>
              {step}
            </StepLabel>
            <StepContent />
          </Step>
        ))}
        <Step key={props.states.length + 1}>
          <StepLabel
            icon={<CustomStepIcon color={colorPick(props.currentState)} />}
          >
            {props.currentState}
          </StepLabel>
          <StepContent />
        </Step>
        {!props.currentState.includes("Resolvido") && (
          <Step key={props.states.length + 1}>
            {!addMode ? (
              <StepButton onClick={onEnableAdd} icon={<AddIcon />}>
                Adicionar novo estado
              </StepButton>
            ) : (
              <StepLabel icon={<AddIcon />}>
                <Select
                  defaultValue="newState"
                  style={{ width: "80%" }}
                  onChange={onStateSelect}
                >
                  {renderMenuItems(props.type)}
                  <MenuItem disabled value={"newState"}>
                    {" "}
                    Adicionar novo estado
                  </MenuItem>
                </Select>
                {addMode && (
                  <IconButton size={"small"} onClick={onEnableAdd}>
                    <CancelIcon />
                  </IconButton>
                )}
              </StepLabel>
            )}
          </Step>
        )}
      </Stepper>
    </div>
  );
}
