export type ReturnStatusInfo = {
  label: string;
  type: "normal" | "return" | "refund" | "error";
};

export function getOrderDisplayStatus(order: {
  orderStatus: string;
  returns?: Array<{
    status?: string;
    refundStatus?: string;
  }>;
}): ReturnStatusInfo {
  const returns = order.returns || [];

  /*
   * Refund processed has the highest priority.
   */
  const processedRefund = returns.find(
    (item) =>
      item.status === "approved" &&
      item.refundStatus === "processed"
  );

  if (processedRefund) {
    return {
      label: "REFUND PROCESSED",
      type: "refund",
    };
  }

  /*
   * Refund failed.
   */
  const failedRefund = returns.find(
    (item) =>
      item.status === "approved" &&
      item.refundStatus === "failed"
  );

  if (failedRefund) {
    return {
      label: "REFUND FAILED",
      type: "error",
    };
  }

  /*
   * Approved return waiting for refund.
   */
  const pendingRefund = returns.find(
    (item) =>
      item.status === "approved" &&
      item.refundStatus === "pending"
  );

  if (pendingRefund) {
    return {
      label: "REFUND PENDING",
      type: "refund",
    };
  }

  /*
   * Approved return.
   */
  const approvedReturn = returns.find(
    (item) => item.status === "approved"
  );

  if (approvedReturn) {
    return {
      label: "RETURN APPROVED",
      type: "return",
    };
  }

  /*
   * Return received.
   */
  const receivedReturn = returns.find(
    (item) => item.status === "received"
  );

  if (receivedReturn) {
    return {
      label: "RETURN RECEIVED",
      type: "return",
    };
  }

  /*
   * Return requested.
   */
  const requestedReturn = returns.find(
    (item) => item.status === "requested"
  );

  if (requestedReturn) {
    return {
      label: "RETURN REQUESTED",
      type: "return",
    };
  }

  /*
   * Rejected return.
   */
  const rejectedReturn = returns.find(
    (item) => item.status === "rejected"
  );

  if (rejectedReturn) {
    return {
      label: "RETURN REJECTED",
      type: "error",
    };
  }

  /*
   * No return activity.
   */
  const normalLabels: Record<string, string> = {
    placed: "ORDER PLACED",
    confirmed: "ORDER CONFIRMED",
    shipped: "ORDER SHIPPED",
    out_for_delivery: "OUT FOR DELIVERY",
    delivered: "ORDER DELIVERED",
    cancelled: "ORDER CANCELLED",
  };

  return {
    label:
      normalLabels[order.orderStatus] ||
      order.orderStatus.toUpperCase(),
    type: "normal",
  };
}