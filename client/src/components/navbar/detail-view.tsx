import * as React from "react";
import {
  makeStyles,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  ButtonBase,
  DialogActions,
  Button,
} from "@material-ui/core";
import Progression from "./progression";
import { HornetDataJoin, NestDataJoin } from "../../types/types";
import moment from "moment";
import "moment/locale/pt";
import EditIcon from "@material-ui/icons/Edit";
import EditViewing from "./add-edit/edit-viewing";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import { isUndefined } from "util";
import HornetCard from "./info-card-hornet";
import NestCard from "./info-card-nest";
import PhotoInput from "./add-edit/photo-input";

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

interface Props {
  id: number;
  updateCallback: (query: boolean) => void;
  query: boolean;
  updatePhoto: (photo?: File) => void;
}

export default function DetailView(props: Props) {
  const classes = useStyles();
  const [editMode, setEditMode] = React.useState(false);
  const [nest, setNest] = React.useState<number | undefined>();
  const [detailInfo, setDetailInfo] = React.useState<
    HornetDataJoin | NestDataJoin
  >();
  const [editedLocalType, setEditedLocalType] = React.useState("");
  const [editConfirmed, setEditConfirmed] = React.useState<boolean>(false);
  const [isNest, setIsNest] = React.useState<string>("false");
  const [colony, setColony] = React.useState<boolean>(false);
  const [destroyed, setDestroyed] = React.useState<boolean>(false);
  const [fullscreenImage, setfsImage] = React.useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | undefined>("");

  const setPreviewCallback = React.useCallback(
    (image) => setPreview(image),
    []
  );

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedPhoto(null);
      return;
    }

    setSelectedPhoto(e.target.files[0]);
    e.target.value = "";
  };

  React.useEffect(() => {
    fetch(`https://vespatrack.herokuapp.com/${props.id}`)
      .then((res) => res.json())
      .then((result) => {
        fetch(
          `https://vespatrack.herokuapp.com/infodetails/${result.type.toLowerCase()}s/${
            props.id
          }`
        )
          .then((res) => res.json())
          .then((result) => {
            setEditedLocalType(result.localtype);
            if (isHornetJoin(result)) {
              setEditConfirmed(result.confirmed_asian);
              setNest(result.nest ? result.nest : undefined);
              setIsNest(nest ? "true" : "false");
            } else {
              setColony(result.colony);
              setDestroyed(result.destroyed);
            }
            setDetailInfo(result);
            if (!selectedPhoto) {
              setPreviewCallback(undefined);
              return;
            }

            const objectUrl = URL.createObjectURL(selectedPhoto);
            setPreviewCallback(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
          });
      });
  }, [
    props.id,
    editMode,
    nest,
    props.query,
    selectedPhoto,
    setPreviewCallback,
  ]);

  const isHornetJoin = (
    data: HornetDataJoin | NestDataJoin
  ): data is HornetDataJoin => {
    return (data as HornetDataJoin).confirmed_asian !== undefined;
  };

  const handlefsImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    setfsImage(!fullscreenImage);
  };

  const onPhotoSend = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedPhoto) props.updatePhoto(selectedPhoto);
  };

  const resetEdit = () => {
    if (detailInfo) {
      if (detailInfo.type === "Vespa") {
        setNest((detailInfo as HornetDataJoin).nest);
        setEditConfirmed((detailInfo as HornetDataJoin).confirmed_asian);
      }
      setEditedLocalType(detailInfo.localtype);
      setEditMode(false);
    }
  };

  const postUpdate = () => {
    if (detailInfo) {
      let body: Object = {
        avistamento: {
          localtype: editedLocalType,
        },
      };
      body =
        detailInfo.type === "Vespa"
          ? {
              ...body,
              vespas: {
                vespaid: (detailInfo as HornetDataJoin)?.vespaid,
                confirmed_asian: editConfirmed,
                nest,
              },
            }
          : {
              ...body,
              nest: {
                nestid: (detailInfo as NestDataJoin).nestid,
                colony,
                destroyed,
                destruction_date: destroyed ? new Date().toISOString() : null,
              },
            };

      const data = JSON.stringify(body);
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      };

      fetch(
        `https://vespatrack.herokuapp.com/update/${detailInfo.type.toLowerCase()}/${
          props.id
        }`,
        requestOptions
      ).then((response) => props.updateCallback(!props.query));
      setEditMode(false);
      resetEdit();
    }
  };

  return detailInfo ? (
    <div>
      {editMode ? (
        <div style={{ float: "right", marginTop: 5, marginRight: 5 }}>
          <IconButton onClick={resetEdit}>
            <DeleteIcon />
          </IconButton>
          <IconButton
            onClick={postUpdate}
            disabled={isNest === "true" && isUndefined(nest)}
          >
            <SaveIcon />
          </IconButton>
        </div>
      ) : (
        <IconButton
          onClick={() => setEditMode(!editMode)}
          style={{ float: "right" }}
        >
          <EditIcon />
        </IconButton>
      )}

      <Paper className={classes.paper} elevation={0}>
        <Typography variant={"h6"} className={classes.paperTitle}>
          Informação Geral
        </Typography>
        <div>
          <Typography display="inline" className={classes.subject}>
            Local{" "}
          </Typography>
          <Typography variant={"body2"} display="inline">
            {detailInfo.local}
          </Typography>
          <Typography variant={"caption"} display={"block"}>
            {detailInfo.lat}, {detailInfo.lng}
          </Typography>
        </div>
        <div>
          <Typography display="inline" className={classes.subject}>
            Data Submissão{" "}
          </Typography>
          <Typography display="inline">
            {moment(detailInfo.date).locale("pt").format("LL")}
          </Typography>
          <div>
            <Typography display="inline" className={classes.subject}>
              Tipo{" "}
            </Typography>
            <Typography display="inline">{detailInfo.type}</Typography>
          </div>
        </div>
        {editMode ? (
          <EditViewing
            type={detailInfo.type}
            data={detailInfo}
            setEditConfirmed={setEditConfirmed}
            setEditedLocalType={setEditedLocalType}
            setNest={setNest}
            editedLocalType={editedLocalType}
            editedConfirmed={editConfirmed}
            nest={nest}
            isNest={isNest}
            setIsNest={setIsNest}
            setDestroyed={setDestroyed}
            setColony={setColony}
            destroyed={destroyed}
            colony={colony}
          />
        ) : (
          <div>
            {" "}
            <div>
              <Typography display="inline" className={classes.subject}>
                Tipo Local{" "}
              </Typography>
              <Typography display="inline">{detailInfo.localtype}</Typography>
              {detailInfo.type === "Vespa" ? (
                <HornetCard
                  confirmed_asian={
                    (detailInfo as HornetDataJoin).confirmed_asian
                  }
                />
              ) : (
                <NestCard
                  colony={(detailInfo as NestDataJoin).colony}
                  destroyed={(detailInfo as NestDataJoin).destroyed}
                />
              )}
            </div>
          </div>
        )}
      </Paper>
      <Paper className={classes.paper} elevation={0}>
        <Typography variant={"h6"} className={classes.paperTitle}>
          Evolução de Estado
        </Typography>
        <Progression
          query={props.query}
          type={detailInfo.type}
          callbackRender={props.updateCallback}
          id={detailInfo.id}
          specific_id={
            isHornetJoin(detailInfo)
              ? detailInfo.specific_id
              : detailInfo.nest_specific_id
          }
          states={detailInfo.past_states}
          currentState={
            isHornetJoin(detailInfo)
              ? detailInfo.state_hornet
              : detailInfo.state_nest
          }
        />
      </Paper>

      <Paper className={classes.paper} elevation={0}>
        <Typography variant={"h6"} className={classes.paperTitle}>
          Fotografia
        </Typography>
        <div>
          {detailInfo.photo && !preview && (
            <ButtonBase onClick={handlefsImage}>
              <img
                src={`https://storage.googleapis.com/tig2020-vespatrack/uploads/${detailInfo.photo}`}
                style={{ width: "100%" }}
                alt={"Avistamento"}
              />
            </ButtonBase>
          )}
          <PhotoInput
            preview={preview}
            setPreview={setPreview}
            onImageUpload={onImageUpload}
          />
          <Button onClick={onPhotoSend}>Carregar fotografia</Button>
          <Dialog open={fullscreenImage} onClose={handlefsImage}>
            <DialogContent>
              <img
                src={`https://storage.googleapis.com/tig2020-vespatrack/uploads/${detailInfo.photo}`}
                alt={"Avistamento"}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handlefsImage}>Voltar</Button>
            </DialogActions>
          </Dialog>
        </div>
      </Paper>
    </div>
  ) : (
    <div />
  );
}
