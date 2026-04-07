const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * 🔄 Auto Stock Sync on Purchase Invoice Approval
 */
exports.syncStockOnInvoiceApproval = functions.firestore
  .document('purchase_invoices/{invoiceId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    // Only run if status changed from PENDING to APPROVED
    if (previousValue.status === 'PENDING' && newValue.status === 'APPROVED') {
      const batch = db.batch();
      
      for (const item of newValue.lines) {
        const inventoryRef = db.collection('inventory')
          .where('tenantId', '==', newValue.tenantId)
          .where('productId', '==', item.productId)
          .where('outletId', '==', newValue.storeId)
          .limit(1);

        const invSnap = await inventoryRef.get();
        
        if (!invSnap.empty) {
          const invDoc = invSnap.docs[0];
          batch.update(invDoc.ref, {
            quantity: admin.firestore.FieldValue.increment(item.quantity),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        } else {
          // Create new record if none exists
          const newInvRef = db.collection('inventory').doc();
          batch.set(newInvRef, {
            tenantId: newValue.tenantId,
            productId: item.productId,
            outletId: newValue.storeId,
            quantity: item.quantity,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        // Add to Audit Logs
        const logRef = db.collection('audit_logs').doc();
        batch.set(logRef, {
          tenantId: newValue.tenantId,
          productId: item.productId,
          actionType: 'PURCHASE_APPROVAL',
          changeQty: item.quantity,
          details: `Approved Purchase Invoice ${newValue.invoiceNumber || context.params.invoiceId}`,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return batch.commit();
    }
    return null;
  });

/**
 * 🛡️ Subscription Guard & Feature Toggler
 */
exports.enforceSubscriptionLimits = functions.firestore
  .document('tenants/{tenantId}')
  .onUpdate(async (change, context) => {
    const data = change.after.data();
    
    // Check if billing expired
    if (data.billingExpiry) {
      const expiry = new Date(data.billingExpiry);
      if (expiry < new Date() && data.isActive) {
        return change.after.ref.update({
          isActive: false,
          suspensionReason: 'Subscription expired. Please renew.'
        });
      }
    }
    return null;
  });

/**
 * 🧾 POS Order Logic (Atomic Transaction)
 */
exports.processPOSOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  
  const { order } = data;
  const tenantId = context.auth.token.tenantId;

  return db.runTransaction(async (transaction) => {
    const orderRef = db.collection('orders').doc();
    
    // Deduct stock for each item
    for (const item of order.items) {
      const stockRef = db.collection('inventory')
        .where('tenantId', '==', tenantId)
        .where('productId', '==', item.id)
        .limit(1);
        
      const stockSnap = await transaction.get(stockRef);
      if (stockSnap.empty) throw new Error(`Out of stock: ${item.name}`);
      
      const stockDoc = stockSnap.docs[0];
      if (stockDoc.data().quantity < item.qty) throw new Error(`Insufficient stock for ${item.name}`);
      
      transaction.update(stockDoc.ref, {
        quantity: admin.firestore.FieldValue.increment(-item.qty)
      });
    }

    transaction.set(orderRef, {
      ...order,
      tenantId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { id: orderRef.id };
  });
});
