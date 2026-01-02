// import React, { forwardRef, useEffect, useState } from "react";
// import { Stage, Layer, Image, Text, Group } from "react-konva";
// import useImage from "use-image";

// const SimCanvasDepan = forwardRef((props, ref) => {
//   const {
//     kode_sim,
//     nama,
//     tempat_tanggal_lahir,
//     pangkat_nrp_nip,
//     kesatuan,
//     golongan_darah,
//     dibuat_di,
//     pada_tanggal,
//     berlaku_hingga,
//     label_komandan,
//     nama_komandan,
//     pangkat_korps_nrp_komandan,
//     tanda_tangan_komandan,
//     stempel,
//     tanda_tangan,
//     pas_foto,
//     sidik_jari,
//   } = props.content;

//   // // Debug received data
//   useEffect(() => {
//     console.log("SimCanvasDepan received data:", props.content);
//   }, [props.content]);

//   // Fixed image URL extraction with proper JSON handling
//   const extractImageData = (data) => {
//     if (!data) {
//       // console.log("No image data provided");
//       return null;
//     }

//     try {
//       // Handle case where data is a stringified JSON object
//       if (
//         typeof data === "string" &&
//         (data.startsWith("{") || data.includes("src"))
//       ) {
//         try {
//           // Attempt to parse if it's a JSON string
//           const parsedData = JSON.parse(data);
//           console.log("Parsed JSON data:", parsedData);

//           // Extract src from parsed JSON
//           if (parsedData.src) {
//             console.log("Using src from parsed JSON:", parsedData.src);
//             return parsedData.src;
//           }
//         } catch (parseError) {
//           // If it's not valid JSON but contains a URL, try to extract it
//           const urlMatch = data.match(/(https?:\/\/[^"]+)/);
//           if (urlMatch && urlMatch[0]) {
//             console.log("Extracted URL from string:", urlMatch[0]);
//             return urlMatch[0];
//           }
//         }
//       }

//       // Handle direct URL strings
//       if (typeof data === "string" && data.startsWith("http")) {
//         console.log("Using direct URL:", data);
//         return data;
//       }

//       // Handle simple string paths
//       if (typeof data === "string") {
//         const fullUrl = `https://ocqghycfqgrvlgqjoort.supabase.co/storage/v1/object/public/gambar/${data}`;
//         console.log("Built URL from string path:", fullUrl);
//         return fullUrl;
//       }

//       // Handle object with src property
//       if (data && typeof data === "object" && data.src) {
//         if (typeof data.src === "string" && data.src.startsWith("http")) {
//           console.log("Using src from object:", data.src);
//           return data.src;
//         }
//       }

//       // Handle object with path property
//       if (data && typeof data === "object" && data.path) {
//         // Don't use path if src is available
//         if (data.src) {
//           console.log("Using src instead of path:", data.src);
//           return data.src;
//         }

//         const fullUrl = `https://ocqghycfqgrvlgqjoort.supabase.co/storage/v1/object/public/gambar/${data.path}`;
//         console.log("Built URL from object path:", fullUrl);
//         return fullUrl;
//       }

//       console.warn("Unknown image data format:", data);
//       return null;
//     } catch (error) {
//       console.error("Error processing image data:", error);
//       return null;
//     }
//   };

//   // Process image sources
//   const [imageUrls, setImageUrls] = useState({
//     stempelSrc: null,
//     tandaTanganKomandanSrc: null,
//     tandaTanganPemohonSrc: null,
//     sidikJariPemohonSrc: null,
//     pasFotoPemohonSrc: null,
//   });

//   // Update URLs whenever props change
//   useEffect(() => {
//     setImageUrls({
//       stempelSrc: extractImageData(stempel),
//       tandaTanganKomandanSrc: extractImageData(tanda_tangan_komandan),
//       tandaTanganPemohonSrc: extractImageData(tanda_tangan),
//       sidikJariPemohonSrc: extractImageData(sidik_jari),
//       pasFotoPemohonSrc: extractImageData(pas_foto),
//     });

//     console.log("Extracted image URLs:", {
//       stempel: extractImageData(stempel),
//       tanda_tangan_komandan: extractImageData(tanda_tangan_komandan),
//       tanda_tangan: extractImageData(tanda_tangan),
//       sidik_jari: extractImageData(sidik_jari),
//       pas_foto: extractImageData(pas_foto),
//     });
//   }, [stempel, tanda_tangan_komandan, tanda_tangan, sidik_jari, pas_foto]);

//   // Load images with appropriate crossOrigin setting
//   const [stempel_satlak, stempelStatus] = useImage(
//     imageUrls.stempelSrc,
//     "anonymous"
//   );
//   const [tanda_tangan_komandan_satlak, komandanStatus] = useImage(
//     imageUrls.tandaTanganKomandanSrc,
//     "anonymous"
//   );
//   const [tanda_tangan_pemohon, pemohonStatus] = useImage(
//     imageUrls.tandaTanganPemohonSrc,
//     "anonymous"
//   );
//   const [sidik_jari_pemohon, sidikStatus] = useImage(
//     imageUrls.sidikJariPemohonSrc,
//     "anonymous"
//   );
//   const [pas_foto_pemohon, fotoStatus] = useImage(
//     imageUrls.pasFotoPemohonSrc,
//     "anonymous"
//   );

//   // Log loading status for debugging
//   useEffect(() => {
//     console.log("Image loading status:", {
//       stempel: { src: imageUrls.stempelSrc, status: stempelStatus },
//       komandan: {
//         src: imageUrls.tandaTanganKomandanSrc,
//         status: komandanStatus,
//       },
//       pemohon: { src: imageUrls.tandaTanganPemohonSrc, status: pemohonStatus },
//       sidik: { src: imageUrls.sidikJariPemohonSrc, status: sidikStatus },
//       foto: { src: imageUrls.pasFotoPemohonSrc, status: fotoStatus },
//     });
//   }, [
//     imageUrls,
//     stempelStatus,
//     komandanStatus,
//     pemohonStatus,
//     sidikStatus,
//     fotoStatus,
//   ]);

//   // Helper for safe text rendering
//   const safeText = (text) => text || "N/A";

//   return (
//     <Stage width={325} height={204} ref={ref}>
//       <Layer>
//         {/* SIM Code */}
//         <Text
//           x={86}
//           y={36}
//           width={153}
//           text={safeText(kode_sim)}
//           fontSize={8}
//           fontStyle="bold"
//           align="center"
//         />

// {/* Applicant Signature */}
//         // {pemohonStatus === "loaded" && (
//         //   <Image
//         //     image={tanda_tangan_pemohon}
//         //     x={-25}
//         //     y={170}
//         //     width={150}
//         //     height={30}
//         //   />
//         // )}

//   {pemohonStatus === "loaded" && (
//           <Image
//             image={tanda_tangan_pemohon}
//             x={-25}
//             y={150}
//             width={150}
//             height={30}
//           />
//         )}

//         {/* Fingerprint */}
//         {sidikStatus === "loaded" && (
//           <Image
//             image={sidik_jari_pemohon}
//             x={10}
//             y={75}
//             scaleY={0.13}
//             scaleX={0.13}
//           />
//         )}

//         {/* Personal Info */}
//         <Group x={15} y={55}>
//           <Group>
//             <Text text="Nama" fontSize={9} fontStyle="bold" />
//             <Text text=":" x={80} fontSize={9} fontStyle="bold" />
//             <Text text={safeText(nama)} x={90} fontSize={9} fontStyle="bold" />
//           </Group>
//           <Group y={10}>
//             <Text text="Tempat/Tgl. Lahir" fontSize={9} fontStyle="bold" />
//             <Text text=":" x={80} fontSize={9} fontStyle="bold" />
//             <Text
//               text={safeText(tempat_tanggal_lahir)}
//               x={90}
//               fontSize={9}
//               fontStyle="bold"
//             />
//           </Group>
//           <Group y={20}>
//             <Text text="Pangkat/NRP/NIP" fontSize={9} fontStyle="bold" />
//             <Text text=":" x={80} fontSize={9} fontStyle="bold" />
//             <Text
//               text={safeText(pangkat_nrp_nip)}
//               x={90}
//               fontSize={9}
//               fontStyle="bold"
//             />
//           </Group>
//           <Group y={30}>
//             <Text text="Kesatuan" fontSize={9} fontStyle="bold" />
//             <Text text=":" x={80} fontSize={9} fontStyle="bold" />
//             <Text
//               text={safeText(kesatuan)}
//               x={90}
//               fontSize={9}
//               fontStyle="bold"
//             />
//           </Group>
//           <Group y={40}>
//             <Text text="Golongan Darah" fontSize={9} fontStyle="bold" />
//             <Text text=":" x={80} fontSize={9} fontStyle="bold" />
//             <Text
//               text={safeText(golongan_darah)}
//               x={90}
//               fontSize={9}
//               fontStyle="bold"
//             />
//           </Group>
//         </Group>

//         {/* Issuance Info */}
//         <Group x={160} y={108}>
//           <Group>
//             <Text text="Diberikan di" fontSize={9} fontStyle="bold" />
//             <Text text=":" x={80} fontSize={9} fontStyle="bold" />
//             <Text
//               text={safeText(dibuat_di)}
//               x={90}
//               fontSize={9}
//               fontStyle="bold"
//             />
//           </Group>
//           <Group y={10}>
//             <Text text="Pada Tanggal" fontSize={9} fontStyle="bold" />
//             <Text text=":" x={80} fontSize={9} fontStyle="bold" />
//             <Text
//               text={safeText(pada_tanggal)}
//               x={90}
//               fontSize={9}
//               fontStyle="bold"
//             />
//           </Group>
//           <Group y={20}>
//             <Text text="Berlaku Hingga" fontSize={9} fontStyle="bold" />
//             <Text text=":" x={80} fontSize={9} fontStyle="bold" />
//             <Text
//               text={safeText(berlaku_hingga)}
//               x={90}
//               fontSize={9}
//               fontStyle="bold"
//             />
//           </Group>
//         </Group>

//         {/* Commander Info */}
//         <Group x={160} y={140}>
//           <Group>
//             <Text
//               text={safeText(label_komandan)}
//               fontSize={9}
//               fontStyle="bold"
//               width={180}
//               align="center"
//             />

//             {/* Commander Signature */}
//             {komandanStatus === "loaded" && (
//               <Image
//                 image={tanda_tangan_komandan_satlak}
//                 width={140}
//                 height={30}
//                 x={0}
//                 y={10}
//               />
//             )}

//             <Text
//               text={safeText(nama_komandan)}
//               fontSize={8}
//               fontStyle="bold"
//               width={180}
//               align="center"
//               y={35}
//             />
//             <Text
//               text={safeText(pangkat_korps_nrp_komandan)}
//               fontSize={8}
//               fontStyle="bold"
//               width={180}
//               align="center"
//               y={45}
//             />
//           </Group>
//         </Group>

//         {/* Photo */}
//         {fotoStatus === "loaded" && (
//           <Image
//             image={pas_foto_pemohon}
//             x={86}
//             y={108}
//             width={72}
//             height={86}
//           />
//         )}

//         {/* Stamp */}
//         {stempelStatus === "loaded" && (
//           <Image
//             image={stempel_satlak}
//             x={150}
//             y={115}
//             width={75}
//             height={75}
//             opacity={0.7}
//           />
//         )}


//       </Layer>
//     </Stage>
//   );
// });

// export default SimCanvasDepan;

import React, { forwardRef, useEffect, useState } from "react";
import { Stage, Layer, Image, Text, Group } from "react-konva";
import useImage from "use-image";

const SimCanvasDepan = forwardRef((props, ref) => {
  const {
    kode_sim,
    nama,
    tempat_tanggal_lahir,
    pangkat_nrp_nip,
    kesatuan,
    golongan_darah,
    dibuat_di,
    pada_tanggal,
    berlaku_hingga,
    label_komandan,
    nama_komandan,
    pangkat_korps_nrp_komandan,
    tanda_tangan_komandan,
    stempel,
    tanda_tangan,
    pas_foto,
    sidik_jari,
  } = props.content;

  // // Debug received data
  useEffect(() => {
    console.log("SimCanvasDepan received data:", props.content);
  }, [props.content]);

  // Fixed image URL extraction with proper JSON handling
  const extractImageData = (data) => {
    if (!data) {
      // console.log("No image data provided");
      return null;
    }

    try {
      // Handle case where data is a stringified JSON object
      if (
        typeof data === "string" &&
        (data.startsWith("{") || data.includes("src"))
      ) {
        try {
          // Attempt to parse if it's a JSON string
          const parsedData = JSON.parse(data);
          console.log("Parsed JSON data:", parsedData);

          // Extract src from parsed JSON
          if (parsedData.src) {
            console.log("Using src from parsed JSON:", parsedData.src);
            return parsedData.src;
          }
        } catch (parseError) {
          // If it's not valid JSON but contains a URL, try to extract it
          const urlMatch = data.match(/(https?:\/\/[^"]+)/);
          if (urlMatch && urlMatch[0]) {
            console.log("Extracted URL from string:", urlMatch[0]);
            return urlMatch[0];
          }
        }
      }

      // Handle direct URL strings
      if (typeof data === "string" && data.startsWith("http")) {
        console.log("Using direct URL:", data);
        return data;
      }

      // Handle simple string paths
      if (typeof data === "string") {
        const fullUrl = `https://ocqghycfqgrvlgqjoort.supabase.co/storage/v1/object/public/gambar/${data}`;
        console.log("Built URL from string path:", fullUrl);
        return fullUrl;
      }

      // Handle object with src property
      if (data && typeof data === "object" && data.src) {
        if (typeof data.src === "string" && data.src.startsWith("http")) {
          console.log("Using src from object:", data.src);
          return data.src;
        }
      }

      // Handle object with path property
      if (data && typeof data === "object" && data.path) {
        // Don't use path if src is available
        if (data.src) {
          console.log("Using src instead of path:", data.src);
          return data.src;
        }

        const fullUrl = `https://ocqghycfqgrvlgqjoort.supabase.co/storage/v1/object/public/gambar/${data.path}`;
        console.log("Built URL from object path:", fullUrl);
        return fullUrl;
      }

      console.warn("Unknown image data format:", data);
      return null;
    } catch (error) {
      console.error("Error processing image data:", error);
      return null;
    }
  };

  // Process image sources
  const [imageUrls, setImageUrls] = useState({
    stempelSrc: null,
    tandaTanganKomandanSrc: null,
    tandaTanganPemohonSrc: null,
    sidikJariPemohonSrc: null,
    pasFotoPemohonSrc: null,
  });

  // Update URLs whenever props change
  useEffect(() => {
    setImageUrls({
      stempelSrc: extractImageData(stempel),
      tandaTanganKomandanSrc: extractImageData(tanda_tangan_komandan),
      tandaTanganPemohonSrc: extractImageData(tanda_tangan),
      sidikJariPemohonSrc: extractImageData(sidik_jari),
      pasFotoPemohonSrc: extractImageData(pas_foto),
    });

    console.log("Extracted image URLs:", {
      stempel: extractImageData(stempel),
      tanda_tangan_komandan: extractImageData(tanda_tangan_komandan),
      tanda_tangan: extractImageData(tanda_tangan),
      sidik_jari: extractImageData(sidik_jari),
      pas_foto: extractImageData(pas_foto),
    });
  }, [stempel, tanda_tangan_komandan, tanda_tangan, sidik_jari, pas_foto]);

  // Load images with appropriate crossOrigin setting
  const [stempel_satlak, stempelStatus] = useImage(
    imageUrls.stempelSrc,
    "anonymous"
  );
  const [tanda_tangan_komandan_satlak, komandanStatus] = useImage(
    imageUrls.tandaTanganKomandanSrc,
    "anonymous"
  );
  const [tanda_tangan_pemohon, pemohonStatus] = useImage(
    imageUrls.tandaTanganPemohonSrc,
    "anonymous"
  );
  const [sidik_jari_pemohon, sidikStatus] = useImage(
    imageUrls.sidikJariPemohonSrc,
    "anonymous"
  );
  const [pas_foto_pemohon, fotoStatus] = useImage(
    imageUrls.pasFotoPemohonSrc,
    "anonymous"
  );

  // Log loading status for debugging
  useEffect(() => {
    console.log("Image loading status:", {
      stempel: { src: imageUrls.stempelSrc, status: stempelStatus },
      komandan: {
        src: imageUrls.tandaTanganKomandanSrc,
        status: komandanStatus,
      },
      pemohon: { src: imageUrls.tandaTanganPemohonSrc, status: pemohonStatus },
      sidik: { src: imageUrls.sidikJariPemohonSrc, status: sidikStatus },
      foto: { src: imageUrls.pasFotoPemohonSrc, status: fotoStatus },
    });
  }, [
    imageUrls,
    stempelStatus,
    komandanStatus,
    pemohonStatus,
    sidikStatus,
    fotoStatus,
  ]);

  // Helper for safe text rendering
  const safeText = (text) => text || "N/A";

  return (
    <Stage width={325} height={204} ref={ref}>
      <Layer>
        {/* SIM Code */}
        <Text
          x={86}
          y={36}
          width={153}
          text={safeText(kode_sim)}
          fontSize={8}
          fontStyle="bold"
          align="center"
        />

        {/* Fingerprint */}
        {sidikStatus === "loaded" && (
          <Image
            image={sidik_jari_pemohon}
            x={15}
            y={82}
            scaleY={0.13}
            scaleX={0.13}
          />
        )}

  {/* Applicant Signature - MOVED BEFORE pas_foto so it appears behind */}
        {pemohonStatus === "loaded" && (
          <Image
            image={tanda_tangan_pemohon}
            x={-20}
            y={170}
            width={150}
            height={30}
          />
        )}
  
        {/* Personal Info */}
        <Group x={15} y={55}>
          <Group>
            <Text text="Nama" fontSize={9} fontStyle="bold" />
            <Text text=":" x={80} fontSize={9} fontStyle="bold" />
            <Text text={safeText(nama)} x={90} fontSize={9} fontStyle="bold" />
          </Group>
          <Group y={10}>
            <Text text="Tempat/Tgl. Lahir" fontSize={9} fontStyle="bold" />
            <Text text=":" x={80} fontSize={9} fontStyle="bold" />
            <Text
              text={safeText(tempat_tanggal_lahir)}
              x={90}
              fontSize={9}
              fontStyle="bold"
            />
          </Group>
          <Group y={20}>
            <Text text="Pangkat/NRP/NIP" fontSize={9} fontStyle="bold" />
            <Text text=":" x={80} fontSize={9} fontStyle="bold" />
            <Text
              text={safeText(pangkat_nrp_nip)}
              x={90}
              fontSize={9}
              fontStyle="bold"
            />
          </Group>
          <Group y={30}>
            <Text text="Kesatuan" fontSize={9} fontStyle="bold" />
            <Text text=":" x={80} fontSize={9} fontStyle="bold" />
            <Text
              text={safeText(kesatuan)}
              x={90}
              fontSize={9}
              fontStyle="bold"
            />
          </Group>
          <Group y={40}>
            <Text text="Golongan Darah" fontSize={9} fontStyle="bold" />
            <Text text=":" x={80} fontSize={9} fontStyle="bold" />
            <Text
              text={safeText(golongan_darah)}
              x={90}
              fontSize={9}
              fontStyle="bold"
            />
          </Group>
        </Group>

        {/* Issuance Info */}
        <Group x={160} y={108}>
          <Group>
            <Text text="Diberikan di" fontSize={9} fontStyle="bold" />
            <Text text=":" x={67} fontSize={9} fontStyle="bold" />
            <Text
              text={safeText(dibuat_di)}
              x={70}
              fontSize={9}
              fontStyle="bold"
            />
          </Group>
          <Group y={10}>
            <Text text="Pada Tanggal" fontSize={9} fontStyle="bold" />
            <Text text=":" x={67} fontSize={9} fontStyle="bold" />
            <Text
              text={safeText(pada_tanggal)}
              x={70}
              fontSize={9}
              fontStyle="bold"
            />
          </Group>
          <Group y={20}>
            <Text text="Berlaku Hingga" fontSize={9} fontStyle="bold" />
            <Text text=":" x={67} fontSize={9} fontStyle="bold" />
            <Text
              text={safeText(berlaku_hingga)}
              x={70}
              fontSize={9}
              fontStyle="bold"
            />
          </Group>
        </Group>

        {/* Commander Info */}
        <Group x={145} y={140}>
          <Group>
            <Text
              text={safeText(label_komandan)}
              fontSize={9}
              fontStyle="bold"
              width={180}
              align="center"
            />

            // {/* Commander Signature */}
            // {komandanStatus === "loaded" && (
            //   <Image
            //     image={tanda_tangan_komandan_satlak}
            //     width={150}
            //     height={30}
            //     x={28}
            //     y={0}
            //   />
            // )}

                {/* Commander Signature - Enhanced with filters for bold effect */}
            {komandanStatus === "loaded" && (
              <>
                <Image
                  image={tanda_tangan_komandan_satlak}
                  width={150}
                  height={30}
                  x={28}
                  y={0}
                  filters={[window.Konva.Filters.Brighten, window.Konva.Filters.Contrast]}
                  brightness={-0.1}
                  contrast={30}
                />
                {/* Duplicate layer for extra boldness */}
                <Image
                  image={tanda_tangan_komandan_satlak}
                  width={150}
                  height={30}
                  x={28}
                  y={0}
                  opacity={0.4}
                />
              </>
            )}

            <Text
              text={safeText(nama_komandan)}
              fontSize={8}
              fontStyle="bold"
              width={180}
              align="center"
              y={35}
            />
            <Text
              text={safeText(pangkat_korps_nrp_komandan)}
              fontSize={8}
              fontStyle="bold"
              width={180}
              align="center"
              y={45}
            />
          </Group>
        </Group>

        {/* Photo - NOW APPEARS ABOVE applicant signature */}
        {fotoStatus === "loaded" && (
          <Image
            image={pas_foto_pemohon}
            x={85}
            y={106}
            width={74}
            height={88}
          />
        )}

        {/* Stamp */}
        {stempelStatus === "loaded" && (
          <Image
            image={stempel_satlak}
            x={150}
            y={115}
            width={75}
            height={75}
            opacity={0.7}
          />
        )}


      </Layer>
    </Stage>
  );
});

export default SimCanvasDepan;
