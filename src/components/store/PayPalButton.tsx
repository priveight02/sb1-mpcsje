import React from 'react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { verifyPayment } from '../../config/firebase';
import toast from 'react-hot-toast';

interface PayPalButtonProps {
  amount: string;
  packageId: string;
  onSuccess: (points: number) => void;
  onError: () => void;
  className?: string;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  packageId,
  onSuccess,
  onError,
  className = ''
}) => {
  return (
    <div className={className}>
      <PayPalButtons
        style={{
          layout: "horizontal",
          color: "gold",
          shape: "rect",
          label: "pay",
          height: 40
        }}
        createOrder={(_, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount,
                  currency_code: "USD"
                },
                description: `Points Package: ${packageId}`
              }
            ]
          });
        }}
        onApprove={async (data, actions) => {
          try {
            if (!actions.order) {
              throw new Error('Order object is missing');
            }

            const order = await actions.order.capture();
            
            // Verify payment with our backend
            const result = await verifyPayment({
              orderId: data.orderID,
              packageId,
              amount
            });

            if (result.data.success) {
              onSuccess(result.data.points);
              toast.success('Payment successful! Points added to your account.');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onError();
            toast.error('Payment verification failed. Please contact support.');
          }
        }}
        onCancel={() => {
          toast('Payment cancelled');
          onError();
        }}
        onError={(err) => {
          console.error('PayPal Error:', err);
          onError();
          toast.error('Payment failed. Please try again.');
        }}
      />
    </div>
  );
};