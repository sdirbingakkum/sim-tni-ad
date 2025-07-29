import React, { forwardRef, useState, useRef, useCallback, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  Slide,
  makeStyles,
  CircularProgress,
  Typography,
  Box,
} from "@material-ui/core";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Webcam from "react-webcam";
import dataProvider from "../../../providers/data";

const useStyles = makeStyles((theme) => ({
  button: {
    display: "flex",
    flexDirection: "column",
    marginTop: 20,
    marginBottom: 20,
    margin: "auto",
    width: "fit-content",
  },
  previewImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "contain",
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5'
  },
  existingPreview: {
    width: "100%",
    maxHeight: "200px",
    objectFit: "contain",
    border: '1px dashed #2196f3',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
    padding: '8px'
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
  input: { value, onChange },
  bucketName = "gambar",
  folderPath = "camera-photos",
  ...rest
}) => {
  const classes = useStyles();
  const cropRef = useRef();
  const [imgSrc, setImgSrc] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const webcamRef = React.useRef(null);

  // Effect untuk handle existing image dari value
  useEffect(() => {
    if (value) {
      let imageUrl = null;

      if (typeof value === 'string' && value.startsWith('http')) {
        imageUrl = value;
      } else if (value && typeof value === 'object') {
        imageUrl = value.src || value.path || value.url;
      }

      if (imageUrl && imageUrl !== preview) {
        setExistingImage(imageUrl);
      }
    } else {
      setExistingImage(null);
    }
  }, [value, preview]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const capture = React.useCallback(() => {
    const screenshot = webcamRef.current.getScreenshot();
    setImgSrc(screenshot);
    handleClose();
  }, [webcamRef]);

  const uploadToSupabase = async (blob) => {
    try {
      setLoading(true);
      const fileName = `photo_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });

      const { url, path } = await dataProvider.uploadFile(
        file,
        bucketName,
        folderPath
      );

      const fileData = {
        src: url,
        path: path,
        bucket: bucketName,
        title: fileName,
      };

      onChange(fileData);
      setPreview(url);
      setExistingImage(null); // Clear existing image when new one is taken

      console.log("Camera upload successful:", url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Gagal mengupload gambar!");
    } finally {
      setLoading(false);
    }
  };

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

  const handleRemoveImage = () => {
    setPreview(null);
    setExistingImage(null);
    setImgSrc(null);
    onChange(null);
  };

  return (
    <div>
      {/* Tampilkan existing image jika ada dan belum ada preview baru */}
      {existingImage && !preview && (
        <Box mb={2} p={2} border={1} borderColor="primary.main" borderRadius={4}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            📷 Gambar Tersimpan:
          </Typography>
          <img
            src={existingImage}
            alt="Existing"
            className={classes.existingPreview}
          />
          <Box mt={1}>
            <Button
              size="small"
              color="secondary"
              onClick={handleRemoveImage}
              variant="outlined"
            >
              Hapus Gambar
            </Button>
          </Box>
        </Box>
      )}

      {/* Tampilkan preview gambar baru jika sudah ada */}
      {preview && (
        <Box mb={2} p={2} border={1} borderColor="success.main" borderRadius={4}>
          <Typography variant="subtitle2" gutterBottom color="primary">
            ✅ Foto Baru Tersimpan:
          </Typography>
          <img src={preview} alt="Preview" className={classes.previewImage} />
          <Box mt={1}>
            <Button
              size="small"
              color="secondary"
              onClick={handleRemoveImage}
              variant="outlined"
            >
              Hapus Foto Baru
            </Button>
          </Box>
        </Box>
      )}

      {/* Tampilkan cropper jika foto sudah diambil tapi belum di-crop */}
      {imgSrc && !preview && (
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            📐 Sesuaikan Area Foto:
          </Typography>
          <Cropper
            ref={cropRef}
            src={imgSrc}
            style={{ height: 400, width: "100%" }}
            aspectRatio={3 / 4}
            guides={false}
          />
          <Box mt={1} display="flex" gap={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={crop}
              disabled={loading}
            >
              {loading ? "Sedang Memproses..." : "Gunakan Foto Ini"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setImgSrc(null)}
              disabled={loading}
            >
              Batal
            </Button>
          </Box>

          {loading && (
            <div className={classes.loading}>
              <CircularProgress size={24} />
              <Typography variant="body2" style={{ marginLeft: 10 }}>
                Mengupload foto...
              </Typography>
            </div>
          )}
        </Box>
      )}

      {/* Button untuk buka kamera */}
      <Button
        variant="outlined"
        color="primary"
        onClick={handleClickOpen}
        className={classes.button}
        disabled={loading}
        size="large"
      >
        {existingImage && !preview ? "📷 Ganti dengan Kamera" :
          preview ? "📷 Ambil Foto Lagi" :
            "📷 Aktifkan Kamera"}
      </Button>

      {/* Dialog kamera */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="camera-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            📷 Ambil Foto
          </Typography>
          <Webcam
            ref={webcamRef}
            videoConstraints={{ facingMode: "environment" }}
            screenshotFormat="image/jpeg"
            style={{ width: "100%", height: "auto", borderRadius: '8px' }}
          />
        </Box>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Batal
          </Button>
          <Button onClick={capture} color="primary" variant="contained">
            📸 Ambil Foto
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CameraComponent;