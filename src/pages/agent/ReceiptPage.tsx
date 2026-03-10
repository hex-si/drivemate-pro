import { useParams, useNavigate } from "react-router-dom";
import { useHubOrders } from "@/hooks/useHubOrders";
import { ArrowLeft, Printer, Share2, MessageCircle, Download } from "lucide-react";
import { format } from "date-fns";

export default function ReceiptPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders } = useHubOrders();
  const navigate = useNavigate();

  const order = orders.find((o) => o.hubOrderId === orderId);

  if (!order) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Receipt - ${order.hubOrderId}`,
        text: `Delivery receipt for ${order.customerName}\nTotal: ₵${order.total.toFixed(2)}\nDelivered to: ${order.deliveryAddress}`,
      });
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header - hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex gap-2">
          {navigator.share && (
            <button onClick={handleShare} className="p-2 glass rounded-xl active:scale-95 transition-transform">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          )}
          <button onClick={handlePrint} className="p-2 glass rounded-xl active:scale-95 transition-transform">
            <Printer className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="glass rounded-2xl p-6 space-y-5 print:bg-white print:text-black print:border print:shadow-none">
        {/* Brand */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground print:text-black">
            Deliver<span className="text-primary">Pro</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Delivery Receipt</p>
        </div>

        <div className="border-t border-dashed border-border print:border-gray-300" />

        {/* Order Info */}
        <div className="space-y-2 text-sm">
          <Row label="Order ID" value={order.hubOrderId} />
          <Row label="Date" value={format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")} />
          <Row label="Customer" value={order.customerName} />
          <Row label="Delivery Address" value={order.deliveryAddress} />
          {order.pickupAddress && <Row label="Pickup" value={order.pickupAddress} />}
          <Row label="Source" value={order.sourceSite} />
        </div>

        <div className="border-t border-dashed border-border print:border-gray-300" />

        {/* Items */}
        {order.items.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-muted-foreground uppercase">Items</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-foreground print:text-black">{item.quantity}x {item.name}</span>
                <span className="font-medium text-foreground print:text-black">₵{item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-dashed border-border print:border-gray-300" />

        {/* Totals */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground print:text-black font-medium">₵{order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="text-foreground print:text-black font-medium">₵{order.fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-1 border-t border-border print:border-gray-300">
            <span className="text-foreground print:text-black">Grand Total</span>
            <span className="text-foreground print:text-black">₵{(order.total + order.fee).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-border print:border-gray-300" />

        <div className="text-center">
          <p className="text-xs text-muted-foreground">Thank you for choosing DeliverPro!</p>
          <p className="text-[10px] text-muted-foreground mt-1">Status: {order.status.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-foreground print:text-black font-medium text-right">{value}</span>
    </div>
  );
}
