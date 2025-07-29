import React, { useState, useEffect, useCallback, useRef } from "react";
import { useInput } from "react-admin";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  IconButton,
  Paper,
  Switch,
  FormControlLabel
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { PhotoCamera, Delete, Brush } from "@material-ui/icons";
import dataProvider from "../../providers/data";

const FingerprintInput = (props) => {
  const {
    input: { value, onChange },
    meta: { touched, error },
  } = useInput(props);

  // Add ref for file input
  const fileInputRef = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [autoRemoveBackground, setAutoRemoveBackground] = useState(true);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Function to remove background from image
  const removeImageBackground = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple background removal algorithm
        // This removes white/light backgrounds (common for fingerprint scans)
        for (let i = 0; i < data.length; i += 4) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];

          // If pixel is close to white/light gray, make it transparent
          const brightness = (red + green + blue) / 3;
          const threshold = 240; // Adjust this value as needed

          if (brightness > threshold) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }

          // Optional: Enhance dark areas (fingerprint lines)
          else if (brightness < 100) {
            // Make dark areas more opaque
            data[i + 3] = Math.min(255, data[i + 3] + 50);
          }
        }

        // Put processed image data back to canvas
        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new file with transparent background
            const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "_transparent.png"), {
              type: 'image/png'
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to process image'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Advanced background removal using edge detection
  const advancedBackgroundRemoval = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Convert to grayscale first
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        // Apply threshold and remove background
        const newData = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const current = data[idx];

            // Calculate local variance to detect edges
            let sum = 0;
            let count = 0;

            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
                sum += data[neighborIdx];
                count++;
              }
            }

            const average = sum / count;
            const variance = Math.abs(current - average);

            // If low variance and bright, make transparent
            if (variance < 20 && current > 200) {
              newData[idx + 3] = 0; // Transparent
            }
            // If high variance (edge), enhance
            else if (variance > 30) {
              newData[idx + 3] = 255; // Opaque
              // Darken the ridges
              newData[idx] = Math.max(0, current - 50);
              newData[idx + 1] = Math.max(0, current - 50);
              newData[idx + 2] = Math.max(0, current - 50);
            }
            // Medium variance, partial transparency
            else {
              newData[idx + 3] = Math.max(0, 255 - current);
            }
          }
        }

        const processedImageData = new ImageData(newData, width, height);
        ctx.putImageData(processedImageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "_enhanced.png"), {
              type: 'image/png'
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to process image'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Handle existing value
  useEffect(() => {
    if (value && !uploadedImage) {
      let imageUrl = null;
      let isUploaded = false;

      if (typeof value === 'string' && value.startsWith('http')) {
        imageUrl = value;
      } else if (value && typeof value === 'object') {
        imageUrl = value.src || value.path || value.url;
        isUploaded = !!(value.src && value.path && value.bucket && value.instantUpload);
      }

      if (imageUrl) {
        if (isUploaded) {
          setUploadedImage(imageUrl);
          setExistingImage(null);
        } else {
          setExistingImage(imageUrl);
          setUploadedImage(null);
        }
      }
    } else if (!value) {
      setExistingImage(null);
      setUploadedImage(null);
    }
  }, [value, uploadedImage]);

  const validateFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      throw new Error("Hanya file gambar yang diperbolehkan!");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Ukuran file terlalu besar! Maksimal 5MB.");
    }

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
    if (!validFormats.includes(file.type)) {
      throw new Error("Format tidak didukung! Gunakan JPG, PNG, BMP, atau TIFF.");
    }
  }, []);

  const uploadFile = useCallback(async (file) => {
    try {
      setLoading(true);

      if (!(file instanceof File)) {
        throw new Error("File tidak valid!");
      }

      validateFile(file);

      let fileToUpload = file;

      // Process image to remove background if enabled
      if (autoRemoveBackground) {
        try {
          setProcessing(true);
          showSnackbar("🎨 Memproses gambar untuk menghapus background...", 'info');

          // Use advanced background removal for better results
          fileToUpload = await advancedBackgroundRemoval(file);

          showSnackbar("✨ Background berhasil dihapus!", 'success');
        } catch (processError) {
          console.warn("Background removal failed, using original file:", processError);
          showSnackbar("⚠️ Gagal menghapus background, menggunakan gambar asli", 'warning');
        } finally {
          setProcessing(false);
        }
      }

      console.log("🚀 Starting fingerprint upload...");

      const { url, path } = await dataProvider.uploadFile(
        fileToUpload,
        "gambar",
        "fingerprints"
      );

      const fileData = {
        src: url,
        path,
        bucket: "gambar",
        title: fileToUpload.name,
        size: fileToUpload.size,
        type: fileToUpload.type,
        uploadedAt: new Date().toISOString(),
        instantUpload: true,
        backgroundRemoved: autoRemoveBackground
      };

      onChange(fileData);
      setUploadedImage(url);
      setExistingImage(null);

      console.log("✅ Fingerprint upload successful:", url);
      showSnackbar("👆 Sidik jari berhasil disimpan ke server!", 'success');

    } catch (err) {
      console.error("❌ Fingerprint upload error:", err);
      showSnackbar(err.message || "❌ Gagal menyimpan sidik jari ke server!", 'error');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  }, [onChange, showSnackbar, validateFile, autoRemoveBackground, advancedBackgroundRemoval]);

  // Fixed handleFileChange with proper null checking
  const handleFileChange = useCallback(async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    await uploadFile(files[0]);

    // Safe way to reset file input value
    try {
      if (event.target && event.target.value !== undefined) {
        event.target.value = '';
      }
      // Alternative: use ref to reset
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.warn('Could not reset file input:', error);
      // If direct reset fails, try to recreate the input element
      if (fileInputRef.current) {
        const parent = fileInputRef.current.parentNode;
        const newInput = fileInputRef.current.cloneNode(true);
        newInput.value = '';
        parent.replaceChild(newInput, fileInputRef.current);
        fileInputRef.current = newInput;
      }
    }
  }, [uploadFile]);

  const handleRemoveImage = useCallback(async () => {
    try {
      setLoading(true);

      if (uploadedImage && value && value.path && value.bucket) {
        console.log("🗑️ Attempting to delete fingerprint from server:", value.path);
        try {
          await dataProvider.deleteFile(value.bucket, value.path);
          console.log("🗑️ Fingerprint deleted from server");
        } catch (deleteError) {
          console.warn("⚠️ Could not delete fingerprint from server:", deleteError);
        }
      }

      setUploadedImage(null);
      setExistingImage(null);
      onChange(null);

      // Reset file input safely
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = '';
        } catch (error) {
          console.warn('Could not reset file input on remove:', error);
        }
      }

      showSnackbar("🗑️ Sidik jari berhasil dihapus", 'info');
    } catch (error) {
      console.error("Error removing fingerprint:", error);
      showSnackbar("❌ Gagal menghapus sidik jari", 'error');
    } finally {
      setLoading(false);
    }
  }, [uploadedImage, value, onChange, showSnackbar]);

  // Manual background removal for existing images
  const handleRemoveBackgroundManually = useCallback(async () => {
    if (!uploadedImage && !existingImage) return;

    try {
      setProcessing(true);
      showSnackbar("🎨 Memproses gambar untuk menghapus background...", 'info');

      // Create a temporary image to process
      const response = await fetch(uploadedImage || existingImage);
      const blob = await response.blob();
      const file = new File([blob], 'fingerprint.png', { type: 'image/png' });

      const processedFile = await advancedBackgroundRemoval(file);

      // Upload the processed file
      const { url, path } = await dataProvider.uploadFile(
        processedFile,
        "gambar",
        "fingerprints"
      );

      const fileData = {
        src: url,
        path,
        bucket: "gambar",
        title: processedFile.name,
        size: processedFile.size,
        type: processedFile.type,
        uploadedAt: new Date().toISOString(),
        instantUpload: true,
        backgroundRemoved: true
      };

      onChange(fileData);
      setUploadedImage(url);
      setExistingImage(null);

      showSnackbar("✨ Background berhasil dihapus dan gambar diperbarui!", 'success');
    } catch (error) {
      console.error("Manual background removal error:", error);
      showSnackbar("❌ Gagal menghapus background", 'error');
    } finally {
      setProcessing(false);
    }
  }, [uploadedImage, existingImage, onChange, showSnackbar, advancedBackgroundRemoval]);

  const currentImage = uploadedImage || existingImage;

  return (
    <>
      <div>
        {/* Background Removal Settings */}
        <Box mb={2} p={2} bgcolor="#f8f9fa" borderRadius={1}>
          <FormControlLabel
            control={
              <Switch
                checked={autoRemoveBackground}
                onChange={(e) => setAutoRemoveBackground(e.target.checked)}
                color="primary"
              />
            }
            label="🎨 Otomatis hapus background putih saat upload"
          />
          <Typography variant="caption" display="block" color="textSecondary" mt={1}>
            Fitur ini akan menghapus background putih/terang dan meningkatkan kontras sidik jari
          </Typography>
        </Box>

        {/* Existing image preview */}
        {existingImage && !uploadedImage && (
          <Box mb={2} p={2} border={1} borderColor="primary.main" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              👆 Sidik Jari Tersimpan Sebelumnya:
            </Typography>
            <Box
              style={{
                background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                padding: '8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              <img
                src={existingImage}
                alt="Sidik Jari Tersimpan"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  border: '1px dashed #2196f3',
                  borderRadius: '4px',
                  backgroundColor: 'transparent'
                }}
              />
            </Box>
            <Box mt={1} display="flex" gap={1}>
              <Button
                size="small"
                color="secondary"
                onClick={handleRemoveImage}
                variant="outlined"
                disabled={loading || processing}
                startIcon={<Delete />}
              >
                Hapus
              </Button>
              <Button
                size="small"
                color="primary"
                onClick={handleRemoveBackgroundManually}
                variant="outlined"
                disabled={loading || processing}
                startIcon={<Brush />}
              >
                Hapus Background
              </Button>
            </Box>
          </Box>
        )}

        {/* Uploaded image preview */}
        {uploadedImage && (
          <Box mb={2} p={2} border={2} borderColor="success.main" borderRadius={1} bgcolor="#f8fff8">
            <Typography variant="subtitle2" gutterBottom color="primary">
              ✅ Sidik Jari Baru Tersimpan di Server:
              {value?.backgroundRemoved && (
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
                display: 'inline-block'
              }}
            >
              <img
                src={uploadedImage}
                alt="Sidik Jari Baru"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  border: '2px solid #4caf50',
                  borderRadius: '4px',
                  backgroundColor: 'transparent'
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
                  onClick={handleRemoveImage}
                  variant="outlined"
                  disabled={loading || processing}
                  startIcon={<Delete />}
                >
                  Hapus
                </Button>
                {!value?.backgroundRemoved && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={handleRemoveBackgroundManually}
                    variant="outlined"
                    disabled={loading || processing}
                    startIcon={<Brush />}
                  >
                    Hapus Background
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* File input section */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            {currentImage ? "📁 Ganti dengan File Baru:" : "📁 Pilih File Sidik Jari:"}
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading || processing}
            style={{
              width: '100%',
              padding: '12px',
              border: uploadedImage ? '2px solid #4caf50' : '2px dashed #ccc',
              borderRadius: '8px',
              backgroundColor: (loading || processing) ? '#f5f5f5' : (uploadedImage ? '#f8fff8' : '#fff'),
              cursor: (loading || processing) ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          />

          <Box mt={1}>
            <Typography variant="caption" color="textSecondary">
              📋 Format: JPG, PNG, BMP, TIFF | Maksimal: 5MB |
              {autoRemoveBackground && " 🎨 Background akan dihapus otomatis"} |
              Status: {currentImage ? '✅ Tersimpan' : '📤 Belum ada file'}
            </Typography>
          </Box>
        </Box>

        {/* Processing indicator */}
        {processing && (
          <Box display="flex" alignItems="center" justifyContent="center" p={2} bgcolor="#fff3e0" borderRadius={1} mb={2}>
            <CircularProgress size={24} style={{ marginRight: 10 }} />
            <Typography variant="body2" color="textSecondary">
              🎨 Memproses gambar untuk menghapus background...
            </Typography>
          </Box>
        )}

        {/* Loading indicator */}
        {loading && !processing && (
          <Box display="flex" alignItems="center" justifyContent="center" p={2} bgcolor="#f5f5f5" borderRadius={1} mb={2}>
            <CircularProgress size={24} style={{ marginRight: 10 }} />
            <Typography variant="body2" color="textSecondary">
              📤 Menyimpan sidik jari ke server...
            </Typography>
          </Box>
        )}

        {/* Status text */}
        {uploadedImage && (
          <Box textAlign="center" mb={2}>
            <Typography variant="caption" color="primary" style={{ fontWeight: 'bold' }}>
              ✅ Sidik jari sudah tersimpan di server dan siap digunakan
              {value?.backgroundRemoved && " ✨ dengan background yang sudah dihapus"}
            </Typography>
          </Box>
        )}

        {/* Error display */}
        {touched && error && (
          <Typography variant="body2" color="error" style={{ marginTop: 8 }}>
            ❌ {error}
          </Typography>
        )}

        {/* Help text */}
        <Typography variant="caption" color="textSecondary">
          💡 Tips: {currentImage ?
            "File sudah tersimpan di server. Pilih file baru jika ingin menggantinya." :
            "Pilih file gambar sidik jari. Background putih akan dihapus otomatis untuk hasil yang lebih baik."}
        </Typography>
      </div>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FingerprintInput;