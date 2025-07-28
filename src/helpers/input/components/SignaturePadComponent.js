import React, { Component } from "react";
import {
  Card,
  CardActions,
  Button,
  CardContent,
  CircularProgress,
} from "@material-ui/core";
import dataProvider from "../../../providers/data";

class SignaturePadComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canvas: null,
      loading: false,
      preview: props.input?.value?.src || null,
      sigPlusReady: false,
      extensionInstalled: false
    };
  }

  componentDidMount = () => {
    this.setState({
      canvas: this.refs.canvas
    }, () => {
      this.checkExtension();
      if (this.state.preview) {
        this.drawImageOnCanvas(this.state.preview);
      }
    });
  };

  checkExtension = () => {
    // Check if SigPlusExtLite extension is installed
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

  drawImageOnCanvas = (imageUrl) => {
    const { canvas } = this.state;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onerror = (e) => {
      console.warn("Error loading preview:", e);
    };
    img.src = imageUrl;
  };

  startSign = async () => {
    const { canvas, extensionInstalled, sigPlusReady } = this.state;
    
    if (!extensionInstalled) {
      alert("SigPlusExtLite extension tidak terinstall atau tidak aktif. Silakan install atau aktifkan extension.");
      return;
    }

    if (!sigPlusReady || !window.Topaz) {
      alert("SigPlus tidak siap. Pastikan extension dan driver sudah terinstall.");
      return;
    }

    if (!canvas) {
      console.error("Canvas not ready");
      return;
    }

    // Clear canvas
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    this.setState({ preview: null });

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    try {
      const sign = window.Topaz.SignatureCaptureWindow.Sign;
      
      // Setup signature capture
      sign.SetImageDetails(1, imgWidth, imgHeight, false, false, 0.0);
      sign.SetPenDetails("Black", 1);
      sign.SetMinSigPoints(25);
      
      // Start signing
      await sign.StartSign(false, 1, 0, "");
      
      // Check for errors
      let lastError = await window.Topaz.Global.GetLastError();
      
      if (lastError !== null && lastError !== "") {
        if (lastError === "The signature does not have enough points to be valid." ||
            lastError === "User cancelled signing.") {
          console.log("SigPlusExtLite Info:", lastError);
          // User cancelled, don't show error
        } else {
          alert("SigPlusExtLite Error: " + lastError);
        }
        return;
      }

      // Process successful signature
      const ctx = canvas.getContext('2d');
      
      if (await sign.IsSigned()) {
        let imgData = await sign.GetSignatureImage();
        
        const img = new Image();
        img.onload = () => {
          // Draw to canvas
          ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
          
          // Get canvas data for upload
          const canvasDataUrl = canvas.toDataURL("image/png");
          
          // Upload to Supabase
          this.uploadToSupabase(canvasDataUrl);
        };
        
        img.onerror = (e) => {
          console.error("Error loading signature image:", e);
          alert("Gagal memuat gambar tanda tangan");
        };
        
        img.src = "data:image/png;base64," + imgData;
      }
      
    } catch (error) {
      console.error("Error during signing:", error);
      alert("Terjadi kesalahan saat menandatangani: " + error.message);
    }
  };

  // Utility functions
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

      const blob = this.base64ToBlob(base64Image);
      const fileName = `signature_${Date.now()}.png`;
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
      };

      const { input: { onChange } } = this.props;
      onChange(fileData);

      this.setState({ preview: url });
      console.log("Upload successful:", url);
      
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengupload tanda tangan!");
      return null;
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, preview, extensionInstalled, sigPlusReady } = this.state;

    return (
      <Card style={{ maxWidth: 600, margin: 'auto' }}>
        <CardContent>
          {/* Status indicator */}
          <div style={{ marginBottom: 10, fontSize: '12px' }}>
            <span style={{ color: extensionInstalled ? '#4caf50' : '#f44336' }}>
              ● Extension: {extensionInstalled ? 'Installed' : 'Not Installed'}
            </span>
            {extensionInstalled && (
              <span style={{ color: sigPlusReady ? '#4caf50' : '#ff9800', marginLeft: 15 }}>
                ● SigPlus: {sigPlusReady ? 'Ready' : 'Loading...'}
              </span>
            )}
          </div>

          <canvas
            ref="canvas"
            id="cnv"
            name="cnv"
            width="500"
            height="100"
            style={{ 
              border: '1px solid #ccc', 
              width: '100%',
              display: 'block',
              marginBottom: preview ? '15px' : '0'
            }}
          />

          {preview && (
            <div style={{ marginTop: 15 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                marginBottom: 8,
                color: '#4caf50'
              }}>
                ✓ Tanda Tangan Tersimpan:
              </div>
              <img
                src={preview}
                alt="Tanda tangan tersimpan"
                style={{
                  width: "100%",
                  maxHeight: "120px",
                  objectFit: "contain",
                  border: '1px dashed #4caf50',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}

          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 15,
                padding: 15,
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
              }}
            >
              <CircularProgress size={24} style={{ marginRight: 10 }} />
              <span style={{ fontSize: '14px', color: '#666' }}>
                Mengupload tanda tangan...
              </span>
            </div>
          )}

          {!extensionInstalled && (
            <div style={{ 
              marginTop: 15, 
              padding: 10, 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              ⚠️ SigPlusExtLite extension belum terinstall. Silakan install extension terlebih dahulu.
            </div>
          )}
        </CardContent>

        <CardActions>
          <Button 
            style={{ margin: "auto" }} 
            onClick={this.startSign}
            disabled={loading || !extensionInstalled || !sigPlusReady}
            variant="contained"
            color="primary"
            size="large"
          >
            {loading ? "Processing..." : (preview ? "Tanda Tangani Ulang" : "Tanda Tangani")}
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default SignaturePadComponent;