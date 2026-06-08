import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
import { parseApiError } from "@/api/apiClient";
import {
  generateTableQr,
  getTableQrCodes,
  getTableQrImageUrl,
  getTables,
} from "@/services/tableService";
import type { TableQrCodeRecord } from "@/types/admin";

// ── icons (inline SVGs to avoid extra deps) ──────────────────────────────────
const DownloadIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── area filter options ────────────────────────────────────────────────────────
// ── helper: get display label for a record ───────────────────────────────────
const getTableLabel = (record: TableQrCodeRecord): string => {
  if (record.table_name) {
    return String(record.table_name);
  }

  const tableNumber = String(record.table_number ?? "").trim();
  if (tableNumber) {
    return !isNaN(Number(tableNumber))
      ? `T-${tableNumber.padStart(2, "0")}`
      : tableNumber;
  }

  return `T-${record.table_id}`;
};

// const downloadSelectedQrs = async () => {
//   try {
//     const zip = new JSZip();

//     for (const tableId of selectedTableIds) {
//       const record = records.find((r) => r.table_id === tableId);

//       const response = await fetch(getTableQrImageUrl(tableId));
//       const blob = await response.blob();

//       zip.file(
//         `${getTableLabel(record!)}-qr.png`,
//         blob
//       );
//     }

//     const zipBlob = await zip.generateAsync({
//       type: "blob",
//     });

//     saveAs(zipBlob, "table-qrs.zip");
//   } catch (error) {
//     toast.error("Failed to download QRs");
//   }
// };

export default function QRCodeGeneration() {
  const [records, setRecords] = useState<TableQrCodeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState("all");
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [selectedTableIds, setSelectedTableIds] = useState<Set<number>>(
    new Set(),
  );
  const [previewTableId, setPreviewTableId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const generatedDefaultQr = useRef(false);
  const [generatedQrs, setGeneratedQrs] = useState<
    Record<number, TableQrCodeRecord>
  >({});

  const loadQrCodes = async () => {
    setLoading(true);
    try {
      const [qrResponse, tableResponse] = await Promise.all([
        getTableQrCodes(),
        getTables(),
      ]);
      const tableAreas = new Map(
        tableResponse.tables.map((table) => [table.table_id, table.area_type]),
      );

      const mergedRecords = qrResponse.records.map((record) => ({
        ...record,
        area_type: record.area_type || tableAreas.get(record.table_id),
      }));

      setAreaOptions(tableResponse.filters.area_types);

      setRecords(
        Array.from(
          new Map(mergedRecords.map((record) => [record.table_id, record])).values(),
        ),
      );
    } catch (error) {
      toast.error("Failed to load QR codes", {
        description: parseApiError(error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQrCodes();
  }, []);

  const selectedAreaLabel =
    selectedArea === "all" ? "All Areas" : selectedArea;

  const filteredRecords = useMemo(
    () =>
      selectedArea === "all"
        ? records
        : records.filter(
          (record) => (record.area_type?.trim() || "") === selectedArea,
        ),
    [records, selectedArea],
  );

  useEffect(() => {
    setSelectedTableIds((prev) => {
      const visibleIds = new Set(filteredRecords.map((record) => record.table_id));
      const next = new Set(
        Array.from(prev).filter((tableId) => visibleIds.has(tableId)),
      );

      if (next.size === 0 && filteredRecords[0]) {
        next.add(filteredRecords[0].table_id);
      }

      if (
        next.size === prev.size &&
        Array.from(next).every((tableId) => prev.has(tableId))
      ) {
        return prev;
      }

      return next;
    });
  }, [filteredRecords]);
  
  useEffect(() => {
    setPreviewTableId((current) => {
      const visibleIds = new Set(
        filteredRecords.map((record) => record.table_id),
      );

      if (current === null || !visibleIds.has(current)) {
        return filteredRecords[0]?.table_id ?? null;
      }

      return current;
    });
  }, [filteredRecords]);

  useEffect(() => {
    const firstRecord = filteredRecords[0];
    if (!firstRecord || generatedDefaultQr.current) return;

    generatedDefaultQr.current = true;
    void generateTableQr(firstRecord.table_id)
      .then(({ qr }) => {
        const generatedRecord = { ...firstRecord, ...qr };
        setGeneratedQrs((prev) => ({
          ...prev,
          [qr.table_id]: generatedRecord,
        }));
        setRecords((prev) =>
          prev.map((record) =>
            record.table_id === qr.table_id ? { ...record, ...qr } : record,
          ),
        );
      })
      .catch((error) => {
        generatedDefaultQr.current = false;
        toast.error("Default QR generation failed", {
          description: parseApiError(error).message,
        });
      });
  }, [filteredRecords]);

  const toggleTableSelection = (tableId: number) => {
    setSelectedTableIds((prev) => {
      const next = new Set(prev);

      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }

      return next;
    });
  };

  const downloadQr = async (
    tableId: number,
    label?: string,
    generatedDataUrl?: string | null,
  ) => {
    try {
      const anchor = document.createElement("a");
      const dataUrl =
        generatedDataUrl ||
        generatedQrs[tableId]?.qr_code_data_url ||
        records.find((record) => record.table_id === tableId)?.qr_code_data_url;
      const objectUrl = dataUrl
        ? null
        : URL.createObjectURL(
          await (async () => {
            const response = await fetch(getTableQrImageUrl(tableId));
            if (!response.ok) throw new Error("Failed to fetch QR image.");
            return response.blob();
          })(),
        );

      anchor.href = dataUrl || objectUrl || "";
      anchor.download = `${label ?? `table-${tableId}`}-qr.png`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      toast.error("QR download failed", {
        description: parseApiError(error).message,
      });
    }
  };

  const handleDownload = async () => {
    if (selectedTableIds.size === 0) {
      toast.error("No tables selected", {
        description: "Please select at least one table.",
      });
      return;
    }
    setGenerating(true);
    try {
      const ids = Array.from(selectedTableIds);
      const generated = await Promise.all(
        ids.map((tableId) => generateTableQr(tableId)),
      );
      setGeneratedQrs((prev) => ({
        ...prev,
        ...Object.fromEntries(
          generated.map(({ qr }) => [
            qr.table_id,
            {
              ...records.find((record) => record.table_id === qr.table_id),
              ...qr,
            },
          ]),
        ),
      }));
      setRecords((prev) =>
        prev.map((record) => {
          const generatedRecord = generated.find(
            ({ qr }) => qr.table_id === record.table_id,
          )?.qr;

          return generatedRecord ? { ...record, ...generatedRecord } : record;
        }),
      );
      const firstId = ids[0];
      setPreviewTableId(firstId);

      for (const { qr } of generated) {
        const record = records.find((item) => item.table_id === qr.table_id);
        await downloadQr(
          qr.table_id,
          record ? getTableLabel(record) : undefined,
          qr.qr_code_data_url,
        );
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      toast.success(`Downloaded QR for ${selectedTableIds.size} table(s)`);
    } catch (error) {
      toast.error("QR download failed", {
        description: parseApiError(error).message,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className="flex min-h-0 flex-col overflow-hidden"
      style={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#FFF8F6",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Breadcrumb ── */}
      <div className="shrink-0 px-6 pt-5 pb-1">
        <p
          style={{
            fontSize: 12,
            color: "#b85c00",
            letterSpacing: "0.08em",
            fontWeight: 500,
            textTransform: "uppercase",
          }}
        >
          SYSTEM / OPERATIONS
        </p>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#1a0a00",
            marginTop: 2,
          }}
        >
          Generate QR Codes
        </h1>
      </div>

      {/* ── Main card ── */}
      <div
        className="mx-6 mt-4 flex min-h-0 flex-1 flex-col"
        style={{ borderBottom: "2px solid #EA580C", backgroundColor: "#fff" }}
      >
        {/* Card header */}
        <div className="flex shrink-0 items-center justify-between px-5 py-3">
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: "#8F4D27",
              textTransform: "uppercase",
            }}
          >
            TABLE SELECTION
          </span>
          <button
            onClick={() => void loadQrCodes()}
            disabled={loading}
            className="flex items-center gap-1"
            style={{
              fontSize: 12,
              color: "#c85a00",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <RefreshIcon />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div
          className="max-w-305 mx-auto"
          style={{ borderBottom: "1px solid #f0d5c4" }}
        ></div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-5 py-4">
          {/* ── Area Filter dropdown ── */}
          <div className="shrink-0">
            <label
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#7a3a00",
                display: "block",
                marginBottom: 6,
              }}
            >
              Area Filter
            </label>
            <div className="relative">
              <button
                onClick={() => setAreaDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2"
                style={{
                  border: "1px solid #FDA77A",
                  borderRadius: 3,
                  backgroundColor: "#fff8f4",
                  fontSize: 14,
                  color: "#1a0a00",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span>{selectedAreaLabel}</span>
                <ChevronDownIcon />
              </button>
              {areaDropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-1"
                  style={{
                    border: "1px solid #f0d5c4",
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 12px rgba(200,90,0,0.1)",
                  }}
                >
                  {["all", ...areaOptions].map((area) => (
                    <button
                      key={area}
                      onClick={() => {
                        setSelectedArea(area);
                        setAreaDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2"
                      style={{
                        fontSize: 14,
                        color:
                          area === selectedArea ? "#c85a00" : "#1a0a00",
                        backgroundColor:
                          area === selectedArea
                            ? "#fff8f4"
                            : "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: area === selectedArea ? 600 : 400,
                      }}
                    >
                      {area === "all" ? "All Areas" : area}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Table grid ── */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: "3px solid #f0d5c4",
                  borderTopColor: "#e85c00",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10"
              style={{ color: "#c8a090", fontSize: 13 }}
            >
              <p style={{ fontWeight: 600 }}>No tables found</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                Try refreshing or changing the area filter.
              </p>
            </div>
          ) : (
            <div className="min-h-[220px] flex-1 overflow-y-auto pr-1">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 8,
                }}
              >
                {filteredRecords.map((record) => {
                  const isSelected = selectedTableIds.has(record.table_id);
                  const isPreviewed = previewTableId === record.table_id;
                  const label = getTableLabel(record);
                  return (
                    <div
                      key={record.table_id}
                      onClick={() => setPreviewTableId(record.table_id)}
                      className="flex items-center gap-2"
                      style={{
                        padding: "8px 10px",
                        borderRadius: 3,
                        border: isPreviewed
                          ? "2px solid #F97316"
                          : isSelected
                            ? "1px solid #F97316"
                            : "1px solid #FDA77A",
                        backgroundColor: isPreviewed
                          ? "#F97316"
                          : isSelected
                            ? "#FFF1E8"
                            : "#fff",
                        color: isPreviewed
                          ? "#fff"
                          : isSelected
                            ? "#C2410C"
                            : "#1a0a00",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        letterSpacing: "0.04em",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTableSelection(record.table_id)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Select ${label} for download`}
                        style={{
                          width: 14,
                          height: 14,
                          flexShrink: 0,
                          cursor: "pointer",
                          accentColor: "#f97316",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewTableId(record.table_id)}
                        className="flex-1"
                        style={{
                          border: 0,
                          padding: "2px 0",
                          background: "transparent",
                          color: "inherit",
                          cursor: "pointer",
                          font: "inherit",
                          letterSpacing: "inherit",
                        }}
                      >
                        {label}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── QR Preview panel ── */}
          {previewTableId !== null && (
            <div
              className="shrink-0"
              style={{
                border: "1px solid #f0d5c4",
                borderRadius: 4,
                backgroundColor: "#fff8f4",
                padding: 16,
                marginTop: 8,
              }}
            >
              <div className="mb-3 flex items-center">
                <p style={{ fontWeight: 600, color: "#1a0a00", fontSize: 14 }}>
                  {getTableLabel(
                    records.find((r) => r.table_id === previewTableId) ?? {
                      table_id: previewTableId,
                      table_number: previewTableId,
                      table_name: undefined,
                      qr_code_url: null,
                    },
                  )}{" "}
                  — QR Preview
                </p>
              </div>
              <img
                key={previewTableId}
                src={
                  generatedQrs[previewTableId]?.qr_code_data_url ||
                  records.find((r) => r.table_id === previewTableId)
                    ?.qr_code_data_url ||
                  getTableQrImageUrl(previewTableId)
                }
                alt={`QR for ${getTableLabel(records.find((r) => r.table_id === previewTableId) ?? { table_id: previewTableId, table_number: previewTableId, table_name: undefined, qr_code_url: null })}`}
                style={{
                  display: "block",
                  margin: "0 auto",
                  border: "1px solid #f0d5c4",
                  padding: 8,
                  backgroundColor: "#fff",
                  maxWidth: 200,
                }}
              />

            </div>
          )}
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div
        className="mt-auto w-full max-w-317 shrink-0 mx-auto px-6 pb-4 pt-3"
        style={{
          backgroundColor: "#FFF8F6",
        }}
      >
        <button
          onClick={() => void handleDownload()}
          disabled={generating || selectedTableIds.size === 0}
          className="w-full max-w-317 mx-auto flex items-center justify-center gap-2 py-4"
          style={{
            backgroundColor:
              selectedTableIds.size === 0 ? "#f5cbb0" : "#f97316",
            color: "#fff",
            borderBottom: "4px solid #9A3412",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: selectedTableIds.size === 0 ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
          }}
        >
          <DownloadIcon />
          {generating
            ? "Preparing Download..."
            : `Download${selectedTableIds.size > 0 ? ` (${selectedTableIds.size})` : ""}`}
        </button>
        <button
          onClick={() => {
            setSelectedTableIds(new Set());
            setPreviewTableId(null);
          }}
          className="w-full max-w-317 mt-3 mx-auto py-3"
          style={{
            backgroundColor: "#fff",
            color: "#f97316",
            border: "1px solid #FED7AA",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
