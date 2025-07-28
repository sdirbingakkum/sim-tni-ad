import React, { useState } from "react";
import { useInput } from "react-admin";
import dataProvider from "../../providers/data";

const StempelInput = (props) => {
  // Ambil input & meta dari useInput agar terhubung dengan form React-Admin
  const {
    input: { value, onChange },
    meta: { touched, error },
  } = useInput(props);

  // Jika sudah ada data (misal saat edit), pakai value.src untuk preview
  const [preview, setPreview] = useState(value?.src || null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      const file = files[0];

      // Pastikan benar-benar objek File
      if (!(file instanceof File)) {
        console.error("Not a valid File object:", file);
        return;
      }

      // Upload langsung ke Supabase
      // Ganti "gambar" & "stempel" sesuai bucket/folder di Supabase
      const { url, path } = await dataProvider.uploadFile(
        file,
        "gambar",
        "stempel"
      );

      console.log("Upload result:", { url, path });

      // Buat data yang akan disimpan di record
      const fileData = {
        src: url,
        path,
        bucket: "gambar",
        title: file.name,
      };

      // Simpan ke form React-Admin
      onChange(fileData);

      // Tampilkan preview
      setPreview(url);
    } catch (err) {
      console.error("Error uploading stempel:", err);
      alert("Gagal mengupload stempel!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Preview stempel jika ada */}
      {preview && (
        <div style={{ marginBottom: 15 }}>
          <img src={preview} alt="Stempel Preview" style={{ maxWidth: 200 }} />
        </div>
      )}

      {/* Input file */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
      />
      {loading && <p>Uploading...</p>}

      {/* Tampilkan error jika ada */}
      {touched && error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
};

export default StempelInput;
