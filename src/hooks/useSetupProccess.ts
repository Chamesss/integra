import { useEffect } from "react";
import { useMutation } from "./useMutation";
import { QueryParams } from "@electron/types/core.types";

export default function useSyncWithWoo() {
  const { mutateAsync: syncAttributes } = useMutation<QueryParams, unknown>();
  const { mutateAsync: syncTag } = useMutation<QueryParams, unknown>();

  useEffect(() => {
    const syncWithWoo = async () => {
      try {
        console.log("Starting WooCommerce sync process...");

        // Sync attributes first
        console.log("Syncing attributes...");
        const attrResult = await syncAttributes({
          method: "attribute:sync",
          data: {
            limit: 9999,
          },
        });

        if (attrResult.success) {
          console.log("✅ Attributes synced successfully:", attrResult.message);
        } else {
          console.error("❌ Failed to sync attributes:", attrResult.message);
          return; // Stop if attributes fail
        }

        // Wait a bit before next sync to prevent database locks
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Then sync tags
        console.log("Syncing tags...");
        const tagResult = await syncTag({
          method: "tag:sync",
          data: {
            limit: 9999,
          },
        });

        if (tagResult.success) {
          console.log("✅ Tags synced successfully:", tagResult.message);
          console.log("🎉 All sync operations completed successfully!");
        } else {
          console.error("❌ Failed to sync tags:", tagResult.message);
        }
      } catch (error) {
        console.error("❌ Syncing error:", error);
      }
    };

    syncWithWoo();
  }, [syncAttributes, syncTag]);

  return;
}
