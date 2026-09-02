export type AnalyticsEventName =
  | 'product_added_to_cart'
  | 'product_removed_from_cart'
  | 'checkout_started'
  | 'order_submitted'
  | 'whatsapp_button_clicked';

export interface AnalyticsPayload {
  productId?: string | number;
  productName?: string;
  quantity?: number;
  itemCount?: number;
  subtotal?: number;
  orderNumber?: string;
  status?: string;
  [key: string]: unknown;
}

export const trackEvent = (
  eventName: AnalyticsEventName,
  payload: AnalyticsPayload = {},
): void => {
  // Ensure no personal information (name, phone, address, notes) is sent
  const sanitizedPayload: AnalyticsPayload = { ...payload };
  delete sanitizedPayload.customerName;
  delete sanitizedPayload.mobileNumber;
  delete sanitizedPayload.phone;
  delete sanitizedPayload.address;
  delete sanitizedPayload.addressLine;
  delete sanitizedPayload.customerNote;

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    const event = new CustomEvent('kc:analytics', {
      detail: {
        eventName,
        payload: sanitizedPayload,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(event);
  }
};

