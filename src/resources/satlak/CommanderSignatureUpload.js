import React, { useState } from "react";
import { ImageInput, ImageField } from "react-admin";
import { Typography, Box, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import dataProvider from "../../providers/data";

// Pastikan sama dengan lokasi lama yang dipakai SignaturePad
const BUCKET_TTD_KOMANDAN = "gambar";
const FOLDER_TTD_KOMANDAN = "tanda_tangan_satlak"; // ganti kalau folder lama berbeda

/**
 * Perilaku:
 * - format: DB string -> [{ src, title }] agar ImageInput bisa preview
 * - parse: upload instan ke Supabase, KEMBALIKAN **string URL** ke form state
 * (jadi field form = string, bukan array/object)
 */
const CommanderSignatureUpload = ({ source, label = "Unggah Tanda Tangan (opsional)", ...props }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const show = (m, s="success") => setSnackbar({ open: true, message: m, severity: s });
  const close = () => setSnackbar(s => ({ ...s, open: false }));

  const format = (value) => {
    if (!value) return undefined;
    if (typeof value === "string") {
      return [{ src: value, title: value.split("/").pop() }];
    }
    if (Array.isArray(value)) return value;
    if (typeof value === "object" && value?.src) return [value];
    return undefined;
  };

  // IMPORTANT: kembalikan **string URL** (bukan object/array)
  const parse = async (value) => {
    const fileObj = Array.isArray(value) ? value[0] : value;
    const raw = fileObj?.rawFile instanceof File ? fileObj.rawFile : null;
    if (!raw) {
      // kalau user tidak mengganti file, biarkan nilai existing (string) tetap
      return typeof value === "string" ? value : undefined;
    }
    try {
      const { url } = await dataProvider.uploadFile(raw, BUCKET_TTD_KOMANDAN, FOLDER_TTD_KOMANDAN);
      show(`📎 ${raw.name} berhasil diunggah.`, "success");
      return url; // ← hanya string URL
    } catch (e) {
      console.error("Upload error:", e);
      show("❌ Gagal menyimpan file ke server!", "error");
      return undefined;
    }
  };

  return (
    <>
      <Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          📤 File diunggah instan; field menyimpan URL (string).
        </Typography>

        <ImageInput
          source={source}
          label={label}
          accept="image/*"
          multiple={false}
          format={format}
          parse={parse}
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
