import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, X } from "lucide-react";
import { fileToThumbnail, isImageFile } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}

/** Drag-and-drop + file-picker + camera-capture image input. */
export function ImageDropzone({ value, onChange }: ImageDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file?: File) => {
      if (!file || !isImageFile(file)) return;
      setBusy(true);
      try {
        onChange(await fileToThumbnail(file));
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <img src={value} alt="Selected food" className="h-56 w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInput.current?.click()}
        whileHover={{ scale: 1.005 }}
        className={cn(
          "flex h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-primary bg-accent/40" : "border-border bg-secondary/30 hover:bg-secondary/50",
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ImagePlus className="h-7 w-7" />
        </div>
        <div>
          <p className="font-medium">{busy ? "Processing image…" : "Drag & drop a food photo"}</p>
          <p className="text-sm text-muted-foreground">or click to browse — JPG, PNG, HEIC</p>
        </div>
      </motion.div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => fileInput.current?.click()} type="button">
          <ImagePlus className="h-4 w-4" /> Upload
        </Button>
        <Button variant="secondary" onClick={() => cameraInput.current?.click()} type="button">
          <Camera className="h-4 w-4" /> Take Photo
        </Button>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
    </div>
  );
}
