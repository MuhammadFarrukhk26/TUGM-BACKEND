const Stripe = require("stripe");
// const stripe = new Stripe("sk_test_51OjJpTASyMRcymO6FVBewDoB2x4Wi5tq5uX5PYSfkAC2pU0sZvWJbZIqGoMTnzEYYFjFh4jbcWYD3OyFc761otRt00tX4j1UO2");
const stripe = new Stripe("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");

const createPaymentIntent = async (req,res)=>{
    try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({amount: amount,currency: "usd",automatic_payment_methods:{enabled:true}});
        console.log(paymentIntent.client_secret)
        res.status(200).send({clientSecret: paymentIntent.client_secret,});
    } 
    catch (error) {
        console.log(error)
    }
}

module.exports = {createPaymentIntent}
