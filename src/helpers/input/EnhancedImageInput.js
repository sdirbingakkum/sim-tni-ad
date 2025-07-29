import React, { useState, useEffect } from "react";
import { ImageInput } from "react-admin";
import { Typography, Box, Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import CustomImageField from "./components/ImageField";
import dataProvider from "../../providers/data";

const EnhancedImageInput = ({
    source,
    label,
    bucketName = "gambar",
    folderPath = "uploads",
    ...props
}) => {
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Custom transform function untuk instant upload
    const transformFile = async (file, source, record) => {
        // Jika file adalah File object baru yang diupload
        if (file && file.rawFile instanceof File) {
            try {
                console.log("🚀 Starting instant upload via ImageInput...");

                const { url, path } = await dataProvider.uploadFile(
                    file.rawFile,
                    bucketName,
                    folderPath
                );

                const fileData = {
                    src: url,
                    path: path,
                    bucket: bucketName,
                    title: file.rawFile.name,
                    uploadedAt: new Date().toISOString(),
                    instantUpload: true,
                    // Keep original rawFile reference for compatibility
                    rawFile: file.rawFile
                };

                console.log("✅ Instant upload via ImageInput successful:", url);
                showSnackbar(`📎 File ${file.rawFile.name} berhasil disimpan ke server!`, 'success');

                return fileData;
            } catch (error) {
                console.error("❌ Instant upload via ImageInput error:", error);
                showSnackbar("❌ Gagal menyimpan file ke server!", 'error');

                // Return original file object if upload fails
                return file;
            }
        }

        // Return as-is if not a new file upload
        return file;
    };

    return (
        <>
            <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    📤 File akan langsung disimpan ke server setelah dipilih
                </Typography>

                <ImageInput
                    source={source}
                    label={label}
                    accept="image/*"
                    options={{
                        onDropAccepted: (files) => {
                            if (files.length > 0) {
                                console.log("📁 File dropped, preparing for instant upload...");
                            }
                        }
                    }}
                    // Transform function akan dipanggil setiap kali ada file baru
                    transform={transformFile}
                    {...props}
                >
                    <CustomImageField source="src" title="title" />
                </ImageInput>

                <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: 'block' }}>
                    💡 Format yang didukung: JPG, PNG, GIF, WEBP | Drag & drop atau klik untuk memilih
                </Typography>
            </Box>

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

export default EnhancedImageInput;