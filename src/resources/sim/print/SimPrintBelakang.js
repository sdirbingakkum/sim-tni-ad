import React, { useRef, useEffect, useState, useCallback } from "react";
import { Title, useRedirect } from "react-admin";
import { Card, CardContent, CardActions, Button } from "@material-ui/core";
import ReactToPrint from "react-to-print";
import SimCanvasBelakang from "./SimCanvasBelakang";

const SimPrintBelakang = ({
  match: {
    params: { id }
  }
}) => {
  const [sim_image, setSimImage] = useState();
  const redirect = useRedirect();
  const componentRef = useRef();
  const simCanvasRef = React.createRef();

  useEffect(() => {
    setSimImage(
      simCanvasRef.current.toDataURL({
        mimeType: "image/png",
        width: 325,
        height: 204,
        quality: 2,
        pixelRatio: 10
      })
    );
  });

  const onAfterPrint = () => {
    redirect(`/sim`);
  };

  return (
    <Card>
      <Title title="Cetak Belakang SIM" />
      <CardContent>
        <img src={sim_image} width={325} height={204} ref={componentRef} />
        <SimCanvasBelakang sim_id={id} ref={simCanvasRef} />
      </CardContent>
      <CardActions>
        <ReactToPrint
          trigger={() => (
            <Button variant="contained" color="primary">
              Cetak Belakang
            </Button>
          )}
          content={() => componentRef.current}
          onAfterPrint={onAfterPrint}
        />
      </CardActions>
    </Card>
  );
};

export default SimPrintBelakang;
