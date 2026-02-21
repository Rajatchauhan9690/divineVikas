export const createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    // Later integrate Razorpay or Stripe here
    // For now simulate payment

    res.json({
      message: "Payment initiated",
      paymentId: "PAY_" + Date.now(),
      amount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    // Normally verify signature here

    res.json({
      message: "Payment verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
