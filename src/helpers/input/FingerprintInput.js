// FingerprintInput.js
import React, { useState } from "react";
import { useInput } from "react-admin";
import dataProvider from "../../providers/data";

const FingerprintInput = (props) => {
  const {
    input: { value, onChange },
    meta: { touched, error },
    // ...rest
  } = useInput(props);

  const [preview, setPreview] = useState(value?.src || null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      const file = files[0];
      if (!(file instanceof File)) {
        console.error("Not a valid File object:", file);
        return;
      }

      // Upload ke Supabase
      const { url, path } = await dataProvider.uploadFile(
        file,
        "gambar", // bucket
        "fingerprints" // folder
      );

      // Setelah upload sukses
      const fileData = {
        src: url,
        path,
        bucket: "gambar",
        title: file.name,
      };

      // Update nilai di form React-Admin
      onChange(fileData);
      setPreview(url);
    } catch (err) {
      console.error("Error uploading fingerprint:", err);
      alert("Gagal mengupload sidik jari!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Preview */}
      {preview && (
        <div style={{ marginBottom: 15 }}>
          <img
            src={preview}
            alt="Sidik Jari Preview"
            style={{ maxWidth: 200 }}
          />
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

export default FingerprintInput;
