import React from "react";
import { useRecordContext } from "react-admin";

const ImageField = ({ source, title }) => {
  const record = useRecordContext();

  if (!record || !record[source]) {
    return null;
  }

  // Function to determine the image URL from various formats
  const getImageUrl = () => {
    const value = record[source];

    // Case 1: Direct string URL
    if (typeof value === "string") {
      return value;
    }

    // Case 2: Object with src property that's a string
    if (value && value.src && typeof value.src === "string") {
      return value.src;
    }

    // Case 3: Object with path property (from Supabase storage)
    if (value && value.path && typeof value.path === "string") {
      return value.path;
    }

    // Case 4: Object with src property that's a File object
    if (value && value.src instanceof File) {
      return URL.createObjectURL(value.src);
    }

    // Case 5: Object with rawFile property (react-admin's FileInput format)
    if (value && value.rawFile instanceof File) {
      return URL.createObjectURL(value.rawFile);
    }

    // Default: return null if no valid format is found
    return null;
  };

  const imageUrl = getImageUrl();

  if (!imageUrl) {
    return null;
  }

  // Create a cleanup function for object URLs
  const handleLoad = () => {
    const value = record[source];
    // Only create cleanup for object URLs from Files
    if (value?.src instanceof File || value?.rawFile instanceof File) {
      return () => URL.revokeObjectURL(imageUrl);
    }
    return undefined;
  };

  return (
    <img
      src={imageUrl}
      title={title || source}
      alt={title || source}
      style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
      onLoad={handleLoad}
    />
  );
};

export default ImageField;
