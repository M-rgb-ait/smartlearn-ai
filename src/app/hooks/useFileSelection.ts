"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { SavedFile } from "../types/question";

export function useFileSelection(files: SavedFile[]) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedFileId = searchParams.get("fileId") || "";

  // Keep track of a pending selection during file deletion
  const pendingFileId = useRef<string | null | undefined>(undefined);

  const updateFileId = useCallback(
    (fileId: string | null) => {
      const params = new URLSearchParams(window.location.search);

      if (fileId) {
        params.set("fileId", fileId);
      } else {
        params.delete("fileId");
      }

      pendingFileId.current = fileId;

      const query = params.toString();

      window.history.replaceState(
        null,
        "",
        query ? `${pathname}?${query}` : pathname,
      );
    },
    [pathname],
  );

  const selectFile = useCallback(
    (fileId: string) => {
      if (fileId === selectedFileId) return;

      const params = new URLSearchParams(window.location.search);
      params.set("fileId", fileId);

      window.history.pushState(null, "", `${pathname}?${params.toString()}`);
    },
    [pathname, selectedFileId],
  );

  useEffect(() => {
    // Wait until the URL and files list reflect the pending selection
    if (pendingFileId.current !== undefined) {
      if (selectedFileId !== (pendingFileId.current ?? "")) return;

      if (
        pendingFileId.current !== null &&
        !files.some((file) => file.id === pendingFileId.current)
      ) {
        return;
      }

      if (pendingFileId.current === null && files.length > 0) {
        return;
      }

      pendingFileId.current = undefined;
    }

    if (files.length === 0) return;

    const isSelectedFileValid = files.some(
      (file) => file.id === selectedFileId,
    );

    if (!isSelectedFileValid) {
      updateFileId(files[0].id);
    }
  }, [selectedFileId, files, updateFileId]);

  return {
    selectedFileId,
    selectFile,
    updateFileId,
  };
}
