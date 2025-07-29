import React, { Component } from "react";
import {
  Card,
  CardActions,
  Button,
  CardContent,
  CircularProgress,
  Typography,
  Box,
  Snackbar,
  Switch,
  FormControlLabel,
  Paper,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import {
  Brush as BrushIcon,
  GetApp as DownloadIcon,
  Settings as SettingsIcon
} from "@material-ui/icons";
import dataProvider from "../../../providers/data";

class SignaturePadComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canvas: null,
      loading: false,
      processing: false,
      uploadedSignature: null,
      existingSignature: null,
      sigPlusReady: false,
      extensionInstalled: false,
      snackbar: { open: false, message: '', severity: 'success' },
      // Background removal settings
      autoRemoveBackground: true,
      transparentBackground: true,
      backgroundThreshold: 240,
      enhanceContrast: true,
      showSettings: false
    };
  }

  componentDidMount = () => {
    this.setState({
      canvas: this.refs.canvas
    }, () => {
      this.checkExtension();
      this.handleExistingSignature();
      this.setupCanvas();
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.input?.value !== this.props.input?.value) {
      this.handleExistingSignature();
    }
  }

  setupCanvas = () => {
    const { canvas, transparentBackground } = this.state;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (transparentBackground) {
      // Clear to transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  showSnackbar = (message, severity = 'success') => {
    this.setState({
      snackbar: { open: true, message, severity }
    });
  };

  handleCloseSnackbar = () => {
    this.setState({
      snackbar: { ...this.state.snackbar, open: false }
    });
  };

  handleExistingSignature = () => {
    const inputValue = this.props.input?.value;

    if (inputValue && !this.state.uploadedSignature) {
      let signatureUrl = null;
      let isUploaded = false;

      if (typeof inputValue === 'string' && inputValue.startsWith('http')) {
        signatureUrl = inputValue;
      } else if (inputValue && typeof inputValue === 'object') {
        signatureUrl = inputValue.src || inputValue.path || inputValue.url;
        isUploaded = !!(inputValue.src && inputValue.path && inputValue.bucket && inputValue.instantUpload);
      }

      if (signatureUrl) {
        if (isUploaded) {
          this.setState({
            uploadedSignature: signatureUrl,
            existingSignature: null
          });
        } else {
          this.setState({
            existingSignature: signatureUrl,
            uploadedSignature: null
          });
        }
      }
    } else if (!inputValue) {
      this.setState({
        existingSignature: null,
        uploadedSignature: null
      });
    }
  };

  checkExtension = () => {
    const isInstalled = document.documentElement.getAttribute('SigPlusExtLiteExtension-installed');

    if (isInstalled) {
      this.setState({ extensionInstalled: true });
      this.loadSigPlusWrapper();
    } else {
      console.warn("SigPlusExtLite extension not detected");
      this.setState({ extensionInstalled: false });
    }
  };

  loadSigPlusWrapper = () => {
    try {
      const url = document.documentElement.getAttribute('SigPlusExtLiteWrapperURL');
      if (url) {
        const script = document.createElement('script');
        script.onload = () => {
          console.log("SigPlus wrapper loaded");
          this.setState({ sigPlusReady: true });
        };
        script.onerror = () => {
          console.error("Failed to load SigPlus wrapper");
          this.setState({ sigPlusReady: false });
        };
        script.src = url;
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error("Error loading SigPlus wrapper:", error);
    }
  };

  // Remove background from signature image
  removeBackgroundFromCanvas = async (canvas) => {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const { backgroundThreshold, enhanceContrast } = this.state;

      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + 3];

        // Calculate brightness
        const brightness = (red + green + blue) / 3;

        // Remove light background pixels
        if (brightness > backgroundThreshold && alpha > 0) {
          data[i + 3] = 0; // Make transparent
        }
        // Enhance dark signature lines
        else if (brightness < backgroundThreshold / 2 && alpha > 0) {
          if (enhanceContrast) {
            // Make signature lines darker and more opaque
            const enhancement = Math.max(0, (backgroundThreshold / 2 - brightness) / (backgroundThreshold / 2));
            data[i] = Math.max(0, red - enhancement * 100);     // Darker red
            data[i + 1] = Math.max(0, green - enhancement * 100); // Darker green  
            data[i + 2] = Math.max(0, blue - enhancement * 100);  // Darker blue
            data[i + 3] = Math.min(255, alpha + enhancement * 100); // More opaque
          }
        }
        // Medium brightness - partial transparency
        else if (alpha > 0) {
          const transparency = (brightness - backgroundThreshold / 2) / (backgroundThreshold / 2);
          data[i + 3] = Math.max(0, alpha * (1 - transparency));
        }
      }

      // Apply processed image data
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas);
    });
  };

  startSign = async () => {
    const { canvas, extensionInstalled, sigPlusReady, transparentBackground } = this.state;

    if (!extensionInstalled) {
      this.showSnackbar("SigPlusExtLite extension tidak terinstall atau tidak aktif!", 'error');
      return;
    }

    if (!sigPlusReady || !window.Topaz) {
      this.showSnackbar("SigPlus tidak siap. Pastikan extension dan driver sudah terinstall!", 'error');
      return;
    }

    if (!canvas) {
      console.error("Canvas not ready");
      return;
    }

    // Setup canvas background
    const ctx = canvas.getContext("2d");
    if (transparentBackground) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    try {
      const sign = window.Topaz.SignatureCaptureWindow.Sign;

      // Configure signature capture for transparent background
      sign.SetImageDetails(1, imgWidth, imgHeight, transparentBackground, false, 0.0);
      sign.SetPenDetails("Black", 2); // Slightly thicker pen for better visibility
      sign.SetMinSigPoints(25);

      console.log("🖊️ Starting signature capture with transparent background...");

      await sign.StartSign(false, 1, 0, "");

      let lastError = await window.Topaz.Global.GetLastError();

      if (lastError !== null && lastError !== "") {
        if (lastError === "The signature does not have enough points to be valid." ||
          lastError === "User cancelled signing.") {
          console.log("SigPlusExtLite Info:", lastError);
          this.showSnackbar("Tanda tangan dibatalkan", 'info');
        } else {
          console.error("SigPlusExtLite Error:", lastError);
          this.showSnackbar("Error: " + lastError, 'error');
        }
        return;
      }

      if (await sign.IsSigned()) {
        let imgData = await sign.GetSignatureImage();

        const img = new Image();
        img.onload = async () => {
          // Draw the signature to canvas
          ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

          // Process for background removal if enabled
          if (this.state.autoRemoveBackground && this.state.transparentBackground) {
            try {
              this.setState({ processing: true });
              this.showSnackbar("🎨 Memproses tanda tangan untuk menghapus background...", 'info');

              await this.removeBackgroundFromCanvas(canvas);

              this.showSnackbar("✨ Background berhasil dihapus!", 'success');
            } catch (processError) {
              console.warn("Background removal failed:", processError);
              this.showSnackbar("⚠️ Gagal menghapus background, menggunakan tanda tangan asli", 'warning');
            } finally {
              this.setState({ processing: false });
            }
          }

          // Convert to data URL and upload
          const canvasDataUrl = canvas.toDataURL("image/png");
          this.uploadToSupabase(canvasDataUrl);
        };

        img.onerror = (e) => {
          console.error("Error loading signature image:", e);
          this.showSnackbar("Gagal memuat gambar tanda tangan", 'error');
        };

        img.src = "data:image/png;base64," + imgData;
      }

    } catch (error) {
      console.error("Error during signing:", error);
      this.showSnackbar("Terjadi kesalahan saat menandatangani: " + error.message, 'error');
    }
  };

  base64ToBlob = (base64) => {
    try {
      const parts = base64.split(";base64,");
      if (parts.length < 2) {
        throw new Error("Invalid base64 format");
      }

      const contentType = parts[0].split(":")[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: contentType });
    } catch (error) {
      console.error("Error converting base64 to blob:", error);
      return new Blob();
    }
  };

  uploadToSupabase = async (base64Image) => {
    try {
      this.setState({ loading: true });
      console.log("🚀 Starting instant signature upload...");

      const blob = this.base64ToBlob(base64Image);
      const fileName = `signature_transparent_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const bucketName = "gambar";
      const folderPath = "tanda_tangan_sim";

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
        uploadedAt: new Date().toISOString(),
        instantUpload: true,
        transparentBackground: this.state.transparentBackground,
        backgroundRemoved: this.state.autoRemoveBackground
      };

      const { input: { onChange } } = this.props;
      onChange(fileData);

      this.setState({
        uploadedSignature: url,
        existingSignature: null
      });

      console.log("✅ Instant signature upload successful:", url);
      this.showSnackbar("✍️ Tanda tangan berhasil disimpan ke server!", 'success');

      return url;
    } catch (error) {
      console.error("❌ Instant signature upload error:", error);
      this.showSnackbar("❌ Gagal menyimpan tanda tangan ke server!", 'error');
      return null;
    } finally {
      this.setState({ loading: false });
    }
  };

  handleRemoveSignature = async () => {
    try {
      this.setState({ loading: true });

      const { canvas } = this.state;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (this.state.transparentBackground) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      const inputValue = this.props.input?.value;
      if (this.state.uploadedSignature && inputValue && inputValue.path) {
        console.log("🗑️ Attempting to delete signature from server:", inputValue.path);
        try {
          await dataProvider.deleteFile(inputValue.bucket, inputValue.path);
          console.log("🗑️ Signature deleted from server");
        } catch (deleteError) {
          console.warn("⚠️ Could not delete signature from server:", deleteError);
        }
      }

      this.setState({
        uploadedSignature: null,
        existingSignature: null
      });

      const { input: { onChange } } = this.props;
      onChange(null);

      this.showSnackbar("🗑️ Tanda tangan berhasil dihapus", 'info');
    } catch (error) {
      console.error("Error removing signature:", error);
      this.showSnackbar("❌ Gagal menghapus tanda tangan", 'error');
    } finally {
      this.setState({ loading: false });
    }
  };

  // Manual background removal for existing signatures
  handleRemoveBackgroundManually = async () => {
    const currentSignature = this.state.uploadedSignature || this.state.existingSignature;
    if (!currentSignature) return;

    try {
      this.setState({ processing: true });
      this.showSnackbar("🎨 Memproses tanda tangan untuk menghapus background...", 'info');

      // Load current signature to canvas
      const canvas = this.state.canvas;
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        // Clear canvas and draw image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Remove background
        await this.removeBackgroundFromCanvas(canvas);

        // Upload processed signature
        const processedDataUrl = canvas.toDataURL("image/png");
        await this.uploadToSupabase(processedDataUrl);

        this.showSnackbar("✨ Background berhasil dihapus dan tanda tangan diperbarui!", 'success');
      };

      img.onerror = () => {
        this.showSnackbar("❌ Gagal memuat gambar untuk diproses", 'error');
      };

      img.src = currentSignature;

    } catch (error) {
      console.error("Manual background removal error:", error);
      this.showSnackbar("❌ Gagal menghapus background", 'error');
    } finally {
      this.setState({ processing: false });
    }
  };

  downloadSignature = () => {
    const currentSignature = this.state.uploadedSignature || this.state.existingSignature;
    if (!currentSignature) return;

    const link = document.createElement('a');
    link.download = 'signature_transparent.png';
    link.href = currentSignature;
    link.click();

    this.showSnackbar("📥 Tanda tangan berhasil diunduh", 'success');
  };

  render() {
    const {
      loading,
      processing,
      uploadedSignature,
      existingSignature,
      extensionInstalled,
      sigPlusReady,
      snackbar,
      autoRemoveBackground,
      transparentBackground,
      backgroundThreshold,
      enhanceContrast,
      showSettings
    } = this.state;

    const hasSignature = uploadedSignature || existingSignature;
    const inputValue = this.props.input?.value;

    return (
      <>
        <Card style={{ maxWidth: 600, margin: 'auto' }}>
          <CardContent>
            {/* Background Settings */}
            <Paper elevation={1} style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#f8f9fa' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">
                  🎨 Pengaturan Background Transparent
                </Typography>
                <Button
                  size="small"
                  onClick={() => this.setState({ showSettings: !showSettings })}
                  startIcon={<SettingsIcon />}
                >
                  {showSettings ? 'Tutup' : 'Advanced'}
                </Button>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={transparentBackground}
                      onChange={(e) => this.setState({ transparentBackground: e.target.checked }, this.setupCanvas)}
                      size="small"
                    />
                  }
                  label="Background Transparan"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRemoveBackground}
                      onChange={(e) => this.setState({ autoRemoveBackground: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Auto Hapus Background"
                />
              </Box>

              {showSettings && (
                <Box mt={2} p={1} bgcolor="#ffffff" borderRadius={1}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Threshold Background: {backgroundThreshold}
                  </Typography>
                  <Slider
                    value={backgroundThreshold}
                    onChange={(e, value) => this.setState({ backgroundThreshold: value })}
                    min={200}
                    max={255}
                    size="small"
                    style={{ marginBottom: '8px' }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={enhanceContrast}
                        onChange={(e) => this.setState({ enhanceContrast: e.target.checked })}
                        size="small"
                      />
                    }
                    label="Tingkatkan Kontras"
                  />
                </Box>
              )}
            </Paper>

            {/* Status indicator */}
            <Box mb={2}>
              <Typography variant="body2" style={{ fontSize: '12px' }}>
                <span style={{ color: extensionInstalled ? '#4caf50' : '#f44336' }}>
                  ● Extension: {extensionInstalled ? 'Installed' : 'Not Installed'}
                </span>
                {extensionInstalled && (
                  <span style={{ color: sigPlusReady ? '#4caf50' : '#ff9800', marginLeft: 15 }}>
                    ● SigPlus: {sigPlusReady ? 'Ready' : 'Loading...'}
                  </span>
                )}
                <span style={{ color: transparentBackground ? '#4caf50' : '#2196f3', marginLeft: 15 }}>
                  ● Background: {transparentBackground ? 'Transparent' : 'White'}
                </span>
              </Typography>
            </Box>

            {/* Existing signature preview */}
            {existingSignature && !uploadedSignature && (
              <Box mb={2} p={2} border={1} borderColor="primary.main" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  ✍️ Tanda Tangan Tersimpan Sebelumnya:
                </Typography>
                <Box
                  style={{
                    background: transparentBackground
                      ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
                      : '#ffffff',
                    backgroundSize: transparentBackground ? '20px 20px' : 'auto',
                    backgroundPosition: transparentBackground ? '0 0, 0 10px, 10px -10px, -10px 0px' : 'auto',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px dashed #2196f3'
                  }}
                >
                  <img
                    src={existingSignature}
                    alt="Tanda tangan tersimpan"
                    style={{
                      width: "100%",
                      maxHeight: "120px",
                      objectFit: "contain",
                      display: "block"
                    }}
                  />
                </Box>
                <Box mt={1} display="flex" gap={1}>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={this.handleRemoveSignature}
                    variant="outlined"
                    disabled={loading || processing}
                  >
                    Hapus
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={this.handleRemoveBackgroundManually}
                    variant="outlined"
                    disabled={loading || processing}
                    startIcon={<BrushIcon />}
                  >
                    Hapus Background
                  </Button>
                  <Button
                    size="small"
                    onClick={this.downloadSignature}
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            )}

            {/* Canvas for signing */}
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                {hasSignature ? "📝 Buat Tanda Tangan Baru:" : "📝 Area Tanda Tangan:"}
              </Typography>
              <Box
                style={{
                  background: transparentBackground
                    ? 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)'
                    : '#ffffff',
                  backgroundSize: transparentBackground ? '20px 20px' : 'auto',
                  backgroundPosition: transparentBackground ? '0 0, 0 10px, 10px -10px, -10px 0px' : 'auto',
                  padding: '8px',
                  borderRadius: '4px',
                  border: uploadedSignature ? '2px solid #4caf50' : '2px dashed #ccc'
                }}
              >
                <canvas
                  ref="canvas"
                  id="cnv"
                  name="cnv"
                  width="500"
                  height="100"
                  style={{
                    width: '100%',
                    display: 'block',
                    backgroundColor: 'transparent',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            </Box>

            {/* Uploaded signature preview */}
            {uploadedSignature && (
              <Box mb={2} p={2} border={2} borderColor="success.main" borderRadius={1} bgcolor="#f8fff8">
                <Typography variant="subtitle2" gutterBottom color="primary">
                  ✅ Tanda Tangan Baru Tersimpan di Server:
                  {inputValue?.backgroundRemoved && (
                    <Typography component="span" variant="caption" color="secondary" ml={1}>
                      (Background Removed ✨)
                    </Typography>
                  )}
                </Typography>
                <Box
                  style={{
                    background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '2px solid #4caf50'
                  }}
                >
                  <img
                    src={uploadedSignature}
                    alt="Tanda tangan baru"
                    style={{
                      width: "100%",
                      maxHeight: "120px",
                      objectFit: "contain",
                      display: "block"
                    }}
                  />
                </Box>
                <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    📡 Tersimpan otomatis ke server
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      color="secondary"
                      onClick={this.handleRemoveSignature}
                      variant="outlined"
                      disabled={loading || processing}
                    >
                      Hapus
                    </Button>
                    {!inputValue?.backgroundRemoved && (
                      <Button
                        size="small"
                        color="primary"
                        onClick={this.handleRemoveBackgroundManually}
                        variant="outlined"
                        disabled={loading || processing}
                        startIcon={<BrushIcon />}
                      >
                        Hapus Background
                      </Button>
                    )}
                    <Button
                      size="small"
                      onClick={this.downloadSignature}
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                    >
                      Download
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Processing indicator */}
            {processing && (
              <Box display="flex" justifyContent="center" alignItems="center" p={2} bgcolor="#fff3e0" borderRadius={1} mb={2}>
                <CircularProgress size={24} style={{ marginRight: 10 }} />
                <Typography variant="body2" color="textSecondary">
                  🎨 Memproses gambar untuk menghapus background...
                </Typography>
              </Box>
            )}

            {/* Loading indicator */}
            {loading && !processing && (
              <Box display="flex" justifyContent="center" alignItems="center" p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <CircularProgress size={24} style={{ marginRight: 10 }} />
                <Typography variant="body2" color="textSecondary">
                  📤 Menyimpan tanda tangan ke server...
                </Typography>
              </Box>
            )}

            {/* Extension warning */}
            {!extensionInstalled && (
              <Box mt={2} p={2} bgcolor="#fff3cd" border="1px solid #ffeaa7" borderRadius={1}>
                <Typography variant="body2" style={{ fontSize: '14px' }}>
                  ⚠️ SigPlusExtLite extension belum terinstall. Silakan install extension terlebih dahulu.
                </Typography>
              </Box>
            )}

            {/* Status text */}
            {uploadedSignature && (
              <Box textAlign="center" mt={2}>
                <Typography variant="caption" color="primary" style={{ fontWeight: 'bold' }}>
                  ✅ Tanda tangan sudah tersimpan di server dan siap digunakan
                  {inputValue?.transparentBackground && " ✨ dengan background transparan"}
                </Typography>
              </Box>
            )}
          </CardContent>

          <CardActions>
            <Button
              style={{ margin: "auto" }}
              onClick={this.startSign}
              disabled={loading || processing || !extensionInstalled || !sigPlusReady}
              variant="contained"
              color="primary"
              size="large"
            >
              {loading ? "💾 Menyimpan..." :
                processing ? "🎨 Memproses..." :
                  hasSignature ? (uploadedSignature ? "✍️ Tanda Tangani Ulang" : "✍️ Ganti Tanda Tangan") :
                    "✍️ Mulai Tanda Tangan"}
            </Button>
          </CardActions>
        </Card>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onClose={() => this.setState({ showSettings: false })}>
          <DialogTitle>🎨 Pengaturan Background Transparent</DialogTitle>
          <DialogContent>
            <Box py={1}>
              <Typography variant="body2" gutterBottom>
                Sesuaikan pengaturan untuk hasil background transparent yang optimal:
              </Typography>

              <Box mt={2}>
                <Typography variant="caption" display="block">
                  Threshold Background: {backgroundThreshold}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                  Nilai lebih tinggi = lebih banyak background yang dihapus
                </Typography>
                <Slider
                  value={backgroundThreshold}
                  onChange={(e, value) => this.setState({ backgroundThreshold: value })}
                  min={200}
                  max={255}
                  marks={[
                    { value: 200, label: '200' },
                    { value: 230, label: '230' },
                    { value: 255, label: '255' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={enhanceContrast}
                      onChange={(e) => this.setState({ enhanceContrast: e.target.checked })}
                    />
                  }
                  label="Tingkatkan Kontras Tanda Tangan"
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Membuat garis tanda tangan lebih gelap dan jelas
                </Typography>
              </Box>

              <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <Typography variant="caption" color="textSecondary">
                  💡 Tips:
                  <br />• Threshold 240-250: Untuk background putih bersih
                  <br />• Threshold 220-240: Untuk background dengan sedikit bayangan
                  <br />• Enhance Contrast: Aktifkan untuk tanda tangan yang tipis
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ showSettings: false })}>
              Tutup
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={this.handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={this.handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }
}

export default SignaturePadComponent;