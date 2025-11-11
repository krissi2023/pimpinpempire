const express = require('express');
const path = require('path');
require('dotenv').config();

const ComicStore = require('./SourceCode/ComicStore');
const PaymentHandler = require('./SourceCode/PaymentHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize comic store system
const comicStore = new ComicStore();
const paymentHandler = new PaymentHandler(
    process.env.STRIPE_SECRET_KEY || 'sk_test_demo',
    process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo'
);

// Serve static files
app.use(express.static('.'));

// API Routes
app.use(express.json());

// Get all packages
app.get('/api/packages', (req, res) => {
    res.json(comicStore.getAllPackages());
});

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { packageId } = req.body;
        const pkg = comicStore.getPackage(packageId);
        
        if (!pkg) {
            return res.status(404).json({ error: 'Package not found' });
        }

        // For demo without real Stripe keys
        res.json({
            clientSecret: 'demo_client_secret',
            paymentIntentId: 'demo_payment_' + Date.now(),
            package: pkg
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Demo webhook
app.post('/webhook', (req, res) => {
    console.log('Webhook received (demo mode)');
    res.json({ received: true });
});

// Serve demo page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('💎 Diamondz Playhouse Server running!');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log('📚 Available Packages:');
    
    comicStore.getAllPackages().forEach(pkg => {
        console.log(`   • ${pkg.name} - $${pkg.price}`);
    });
});
