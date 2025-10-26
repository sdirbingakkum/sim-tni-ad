import React, { useState } from "react";
import { ImageInput, ImageField } from "react-admin";
import { useForm } from "react-final-form";
import { Typography, Box, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import dataProvider from "../../providers/data";

// pastikan sama dgn lokasi yg dipakai SignaturePad
const BUCKET_TTD_KOMANDAN = "gambar";
const FOLDER_TTD_KOMANDAN = "tanda_tangan_satlak"; // ganti kalau beda

const CommanderSignatureUpload = ({ source, label = "Unggah Tanda Tangan (opsional)" }) => {
  const form = useForm();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const show = (m, s="success") => setSnackbar({ open: true, message: m, severity: s });
  const close = () => setSnackbar(s => ({ ...s, open: false }));

  const onDropAccepted = async (files) => {
    try {
      const raw = files?.[0];
      if (!raw) return;
      const { url } = await dataProvider.uploadFile(raw, BUCKET_TTD_KOMANDAN, FOLDER_TTD_KOMANDAN);
      // nilai field target = STRING URL (bukan array/object/promise)
      form.change(source, url);
      show(`📎 ${raw.name} berhasil diunggah.`, "success");
    } catch (e) {
      console.error(e);
      show("❌ Gagal menyimpan file ke server!", "error");
    }
  };

  return (
    <>
      <Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          📤 File akan diunggah instan; nilai form diset ke URL.
        </Typography>

        {/* Wajib punya SATU child -> ImageField dummy */}
        <ImageInput
          source="__dummy_satlak_ttd_upload__" // hanya agar RA render dropzone
          label={label}
          accept="image/*"
          multiple={false}
          options={{ onDropAccepted }}
        >
          <ImageField source="src" title="title" />
        </ImageInput>

        <Typography variant="caption" color="textSecondary" style={{ display: "block", marginTop: 8 }}>
          💡 Format: JPG, PNG, GIF, WEBP — drag & drop atau klik untuk pilih
        </Typography>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={close} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={close} severity={snackbar.severity} style={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CommanderSignatureUpload;
