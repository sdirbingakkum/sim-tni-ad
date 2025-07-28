import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { Stage, Layer, Image } from "react-konva";
import useImage from "use-image";
import QRious from "qrious";
import { self_ip, client_port } from "../../../providers/attrs";

const SimCanvasBelakang = forwardRef(({ sim_id }, ref) => {
  const [qr, setQr] = useState();
  const [qrCode] = useImage(qr);

  const createQr = useCallback(() => {
    const qr = new QRious({
      value: `${self_ip}:${client_port}/#/show_sim/${sim_id}`
    });

    setQr(qr.toDataURL());
  }, []);

  useEffect(() => {
    createQr();
  }, [createQr]);

  return (
    <Stage width={325} height={204} ref={ref}>
      <Layer>
        <Image image={qrCode} x={20} y={130} width={60} height={60} />
      </Layer>
    </Stage>
  );
});

// const SimCanvasBelakang = ({ sim_id }) => {
//   const [qr, setQr] = useState();
//   const [qrCode] = useImage(qr);

//   const createQr = useCallback(() => {
//     const qr = new QRious({
//       value: `${self_ip}:${client_port}/#/show_sim/${sim_id}`
//     });

//     setQr(qr.toDataURL());
//   }, []);

//   useEffect(() => {
//     createQr();
//   }, [createQr]);

//   return (
//     <Stage width={325} height={204}>
//       <Layer>
//         <Image image={qrCode} x={20} y={130} width={60} height={60} />
//       </Layer>
//     </Stage>
//   );
// };

export default SimCanvasBelakang;
