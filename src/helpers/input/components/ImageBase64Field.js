import React, { useState, useEffect } from "react";
import { ImageField } from "react-admin";
import isBase64 from "is-base64";
import converFileToBase64 from "../../converFileToBase64";

const ImageBase64Field = (props) => {
  const { record: originalRecord, ...rest } = props;
  const [processedRecord, setProcessedRecord] = useState(originalRecord);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset state when original record changes
    setProcessedRecord(originalRecord);

    const processImage = async () => {
      if (!originalRecord || !originalRecord.src) return;

      // Only convert if not already base64
      if (!isBase64(originalRecord.src, { allowMime: true })) {
        setIsLoading(true);
        try {
          const base64Data = await converFileToBase64(originalRecord);
          setProcessedRecord({
            ...originalRecord,
            src: base64Data,
          });
        } catch (error) {
          console.error("Error converting to base64:", error);
          // Keep original record in case of failure
        } finally {
          setIsLoading(false);
        }
      }
    };

    processImage();
  }, [originalRecord]);

  if (isLoading) {
    return <div>Loading image...</div>;
  }

  return <ImageField record={processedRecord} {...rest} />;
};

export default ImageBase64Field;
