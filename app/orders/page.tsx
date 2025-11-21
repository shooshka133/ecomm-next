"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Order, OrderItem } from "@/types";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  Truck,
} from "lucide-react";
import Link from "next/link";
import OrderTracking from "@/components/OrderTracking";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<
    (Order & { order_items?: OrderItem[] })[]
  >([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      loadOrders();
    }
  }, [user, authLoading, router]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Load order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*, products(*)")
            .eq("order_id", order.id);

          return {
            ...order,
            order_items: itemsData || [],
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "shipped":
        return <Truck className="w-6 h-6 text-indigo-600" />;
      case "processing":
        return <Package className="w-6 h-6 text-blue-600" />;
      case "cancelled":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "shipped":
        return "Shipped";
      case "processing":
        return "Processing";
      case "cancelled":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
          My Orders
        </h1>
        <p className="text-gray-600">
          View your order history and track shipments
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-16 h-16 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            No orders yet
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Start shopping to see your orders here
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Order Header */}
              <div
                className="p-6 cursor-pointer"
                onClick={() =>
                  setExpandedOrder(expandedOrder === order.id ? null : order.id)
                }
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.status)}
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                    </div>
                    <p className="text-gray-600">
                      Placed on{" "}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-3xl font-bold gradient-text">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <button className="md:ml-4">
                      {expandedOrder === order.id ? (
                        <ChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {expandedOrder === order.id && order.order_items && (
                <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                  {/* Order Tracking */}
                  <OrderTracking order={order} />

                  {/* Order Items */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-4">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-4 flex items-center gap-4"
                        >
                          {item.products?.image_url ? (
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No Image
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">
                              {item.products?.name || "Product"}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
