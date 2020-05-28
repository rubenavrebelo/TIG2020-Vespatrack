import * as React from "react";
import { Input } from "@material-ui/core";
import { isUndefined } from "util";

interface Props {
  preview: string | undefined;
  setPreview: (preview: string | undefined) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PhotoInput(props: Props) {
  return (
    <div>
      {!isUndefined(props.preview) && (
        <img
          src={props.preview}
          style={{ width: "100%" }}
          alt={"Avistamento"}
        />
      )}
      <Input type={"file"} onChange={props.onImageUpload} />
    </div>
  );
}
