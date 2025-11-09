class PaymentHandler {
    constructor(stripeSecretKey, webhookSecret) {
        this.stripeSecretKey = stripeSecretKey;
        this.webhookSecret = webhookSecret;
        this.stripe = null;
    }

    async createPaymentIntent(packageId, amount, currency = 'usd', metadata = {}) {
        if (!this.stripe) throw new Error('Stripe not initialized');
        
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), currency,
            metadata: { packageId, ...metadata },
            automatic_payment_methods: { enabled: true }
        });

        return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
    }

    createWebhookHandler(comicStore) {
        return (req, res) => {
            const event = req.body; // Simplified for demo
            
            switch (event.type) {
                case 'payment_intent.succeeded':
                    this.handlePaymentSuccess(event.data.object, comicStore);
                    break;
            }
            
            res.json({received: true});
        };
    }

    handlePaymentSuccess(paymentIntent, comicStore) {
        const { packageId, userId } = paymentIntent.metadata;
        return comicStore.processSuccessfulPurchase(paymentIntent.id, packageId, userId || 'guest');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentHandler;
} else if (typeof window !== 'undefined') {
    window.PaymentHandler = PaymentHandler;
}
