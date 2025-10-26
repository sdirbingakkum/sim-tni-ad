import React, { useState } from "react";
import { ImageInput, ImageField } from "react-admin";
import { Typography, Box, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import dataProvider from "../../providers/data";

// Kunci lokasi upload agar sama persis dengan SignaturePad versi lama
const BUCKET_TTD_KOMANDAN = "gambar";
const FOLDER_TTD_KOMANDAN = "tanda_tangan_satlak"; // <-- ganti jika folder lama kamu berbeda

/**
 * Perilaku:
 * - format: DB string URL -> [{ src, title }]
 * - transform: upload ke Supabase, return STRING URL (bukan object)
 * Catatan: ImageInput akan menyimpan array, tapi kita flatten di TabbedForm.transform (di file Create/Edit).
 */
const CommanderSignatureUpload = ({ source, label = "Unggah Tanda Tangan (opsional)", ...props }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const show = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });
  const close = () => setSnackbar(s => ({ ...s, open: false }));

  // Untuk render nilai awal (string URL) menjadi array yang dipahami ImageInput
  const format = (value) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return [{ src: value, title: value.split("/").pop() }];
    }
    if (typeof value === "object" && value.src) return [value];
    return undefined;
  };

  // Upload instan per file & KEMBALIKAN string URL (ImageInput akan membungkus ke array)
  const transform = async (file /*, sourceName, record */) => {
    try {
      const raw = file?.rawFile instanceof File ? file.rawFile : null;
      if (!raw) {
        // Jika user tidak mengganti file, tetap pertahankan nilai lama (biarkan TabbedForm.transform yang handle)
        return file;
      }
      const { url } = await dataProvider.uploadFile(raw, BUCKET_TTD_KOMANDAN, FOLDER_TTD_KOMANDAN);
      show(`📎 ${raw.name} berhasil diunggah.`, "success");
      // return string URL (bukan object)
      return url;
    } catch (e) {
      console.error("Upload error:", e);
      show("❌ Gagal menyimpan file ke server!", "error");
      return file; // fallback agar form tidak crash
    }
  };

  return (
    <>
      <Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          📤 File akan diunggah instan & field menyimpan URL gambar.
        </Typography>

        <ImageInput
          source={source}
          label={label}
          accept="image/*"
          multiple={false}
          format={format}
          transform={transform}
          {...props}
        >
          <ImageField source="src" title="title" />
        </ImageInput>

        <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: "block" }}>
          💡 Format: JPG, PNG, GIF, WEBP — drag & drop atau klik untuk pilih
        </Typography>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={close} severity={snackbar.severity} style={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CommanderSignatureUpload;
