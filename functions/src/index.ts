import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();

const PAYPAL_API = 'https://api-m.paypal.com';
const PAYPAL_CLIENT_ID = 'AQRTvrG0AfMb0KCtVRmSJjRTCSAK08jGvaYs2oAjyOcFeTlEzBgKDwlC2sLP9Zzj3V1I0Rl9XbOBrjYC';
const PAYPAL_CLIENT_SECRET = 'EJAvfawUExTTa-SI-LFLpAoFkbP_HDzOTcQLwF0Dr5aHu9wX12mcZ2E0IyAHTL7wwlPkxFy0aDrMYjup';

interface PaymentData {
  orderId: string;
  packageId: string;
  amount: string;
}

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
export const createPayPalOrder = functions.https.onCall(async (data: { packageId: string; amount: string }, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: data.amount
          },
          description: `Points Package: ${data.packageId}`
        }]
      })
    });

    const order = await response.json();
    return { id: order.id };
  } catch (error) {
    console.error('Create PayPal order error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create PayPal order');
  }
});

// Verify PayPal payment
export const verifyPayment = functions.https.onCall(async (data: PaymentData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  try {
    const accessToken = await getPayPalAccessToken();
    
    // Verify the payment with PayPal
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${data.orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    const paypalOrder = await response.json();
    
    if (paypalOrder.status !== 'COMPLETED') {
      throw new Error('Payment not completed');
    }

    // Verify amount matches
    const actualAmount = paypalOrder.purchase_units[0].payments.captures[0].amount.value;
    if (actualAmount !== data.amount) {
      throw new Error('Payment amount mismatch');
    }

    // Get points for package
    const pointsMap: { [key: string]: number } = {
      'basic': 1000,
      'popular': 2500,
      'premium': 5000,
      'ultimate': 12000,
    };

    const points = pointsMap[data.packageId];
    if (!points) {
      throw new Error('Invalid package ID');
    }

    // Update user's points in Firestore
    const userRef = admin.firestore().collection('users').doc(context.auth.uid);
    await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentPoints = userDoc.exists ? (userDoc.data()?.points || 0) : 0;
      
      transaction.set(userRef, {
        points: currentPoints + points,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    // Log the transaction
    await admin.firestore().collection('transactions').add({
      userId: context.auth.uid,
      packageId: data.packageId,
      orderId: data.orderId,
      amount: data.amount,
      points,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'completed'
    });

    return { success: true, points };
  } catch (error) {
    console.error('Payment verification error:', error);
    throw new functions.https.HttpsError('internal', 'Payment verification failed');
  }
});