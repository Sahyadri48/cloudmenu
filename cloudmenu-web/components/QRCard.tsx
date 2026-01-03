"use client";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCard({ restaurantId, tableNumber }: { restaurantId:number; tableNumber:number }) {
  const qrData = JSON.stringify({ restaurantId, tableNumber });
  const downloadQR = () => {
    const canvas = document.getElementById(`qr-${tableNumber}`) as HTMLCanvasElement;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url; link.download = `table-${tableNumber}.png`; link.click();
  };
  return (
    <div className="bg-white border rounded-xl p-6 flex flex-col items-center">
      <QRCodeCanvas id={`qr-${tableNumber}`} value={qrData} size={160} includeMargin />
      <h3 className="mt-3 font-semibold">Table #{tableNumber}</h3>
      <button onClick={downloadQR} className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm">
        Download QR
      </button>
    </div>
  );
}
