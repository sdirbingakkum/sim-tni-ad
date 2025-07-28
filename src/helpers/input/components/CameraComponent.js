import React, { forwardRef, useState, useRef, useCallback } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  Slide,
  makeStyles,
  CircularProgress,
} from "@material-ui/core";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Webcam from "react-webcam";
import dataProvider from "../../../providers/data";

const useStyles = makeStyles((theme) => ({
  button: {
    display: "flex",
    flexDirection: "column",
    marginTop: 50,
    marginBottom: 50,
    margin: "auto",
    width: "fit-content",
  },
  previewImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "contain",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
  },
}));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CameraComponent = ({
  input: { onChange },
  bucketName = "gambar", // Default jika tidak ada prop bucketName yang diberikan
  folderPath = "camera-photos", // Default jika tidak ada prop folderPath yang diberikan
  // Anda juga akan menerima 'source', 'label' dll dari props yang diteruskan oleh <Field>
  ...rest
}) => {
  const classes = useStyles();
  const cropRef = useRef();
  const [imgSrc, setImgSrc] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const webcamRef = React.useRef(null);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Fungsi untuk mengambil foto dari webcam
  const capture = React.useCallback(() => {
    const screenshot = webcamRef.current.getScreenshot();
    setImgSrc(screenshot);
    handleClose();
  }, [webcamRef]);

  // Fungsi untuk upload gambar ke Supabase Storage menggunakan data provider
  const uploadToSupabase = async (blob) => {
    try {
      setLoading(true);
      const fileName = `photo_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      // Gunakan bucketName dan folderPath dari props
      const { url, path } = await dataProvider.uploadFile(
        file,
        bucketName, // <-- Gunakan bucketName dari prop
        folderPath  // <-- Gunakan folderPath dari prop
      );

      const fileData = {
        src: url,
        path: path,
        bucket: bucketName, // Simpan juga bucket yang digunakan
        title: fileName,
      };
      onChange(fileData);
      setPreview(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Gagal mengupload gambar!");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memproses hasil crop
  const crop = useCallback(() => {
    if (!cropRef.current) return;

    const canvas = cropRef.current.getCroppedCanvas();
    if (!canvas) return;

    canvas.toBlob(
      async (blob) => {
        await uploadToSupabase(blob);
      },
      "image/jpeg",
      0.95
    );
  }, []);

  return (
    <div>
      {/* Tampilkan preview gambar jika sudah ada */}
      {preview && (
        <div style={{ marginBottom: 15 }}>
          <img src={preview} alt="Preview" className={classes.previewImage} />
        </div>
      )}

      {/* Tampilkan cropper jika foto sudah diambil tapi belum di-crop */}
      {imgSrc && !preview && (
        <>
          <Cropper
            ref={cropRef}
            src={imgSrc}
            style={{ height: 400, width: "100%" }}
            aspectRatio={3 / 4}
            guides={false}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={crop}
            disabled={loading}
            style={{ marginTop: 10 }}
          >
            {loading ? "Sedang Memproses..." : "Gunakan Foto Ini"}
          </Button>

          {loading && (
            <div className={classes.loading}>
              <CircularProgress size={24} />
            </div>
          )}
        </>
      )}

      <Button
        variant="outlined"
        color="primary"
        onClick={handleClickOpen}
        className={classes.button}
        disabled={loading}
      >
        {preview ? "Ganti Foto" : "Aktifkan Kamera"}
      </Button>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        fullWidth
      >
        <Webcam
          ref={webcamRef}
          videoConstraints={{ facingMode: "environment" }}
          screenshotFormat="image/jpeg"
          style={{ width: "100%", height: "auto" }}
        />
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Batal
          </Button>
          <Button onClick={capture} color="primary">
            Ambil Foto
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CameraComponent;
